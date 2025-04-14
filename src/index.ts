import levenshtein from 'js-levenshtein';
import { MarkdownAdapter } from './adapters/markdown.js';
import type { XTestSuite, XTestResult, XAdapter } from './types.js';
import fs from 'fs';


export const TEST_TYPE_BEHAVIOR = 'behavior';

export class XFeatureReporter  {
  constructor(outputAdapter?: XAdapter) {
    this.outputAdapter = outputAdapter || new MarkdownAdapter();
  }
  
  private outputAdapter: XAdapter;
  
  _mergeSuites(suite: XTestSuite,suiteStructure: Record<string, XTestSuite>, lineage: string) {
    const fullLineage = `${lineage}/${suite.title}`;
    if (suiteStructure[fullLineage]) {
      suiteStructure[fullLineage].tests.push(...suite.tests);
      suiteStructure[fullLineage].suites.push(...suite.suites);
      suite.suites && suite.suites.forEach((ss) => {
        this._mergeSuites(ss, suiteStructure, fullLineage);
      });
      suite.tests = [];
      suite.suites = [];
    } else {
      suiteStructure[fullLineage] = suite;
    }
    suite.suites && suite.suites.forEach((ss) => {
      this._mergeSuites(ss, suiteStructure, fullLineage);
    });
    return suite;
  }
  
  _removeTransparentSuites(suite: XTestSuite): XTestSuite[] {
    if (suite.transparent) {
      return suite.suites.flatMap((s) => this._removeTransparentSuites(s));
    }
    return [suite];
  }
  
  _removeNonBehavioralTests(suite: XTestSuite) {
    const removalCandidates = [];
    suite.tests = suite.tests.filter((t) => !t.testType || t.testType === TEST_TYPE_BEHAVIOR);
    if (suite.tests.length === 0) {
      removalCandidates.push(suite);
    }
    suite.suites && suite.suites.forEach((s) => {
      this._removeNonBehavioralTests(s);
    });
    // reverse iteration to avoid mutating the array while iterating over it
    for (let i = removalCandidates.length - 1; i >= 0; i--) {
      if (suite.suites.length ===0 || suite.suites.every((s) => s.transparent)) {
        suite.transparent = true;
      }
    }
  }
  
  _detectSuiteChange(suite: XTestSuite, oldTitles: string[], oldTests: XTestResult[]) {

    let minDistance = Math.min(...oldTitles.map(title => levenshtein(suite.title, title)));
    const ratio = minDistance / suite.title.length;
    if (minDistance==Infinity) {
      suite.change = 'added';
    } else if (ratio > 0.3) {
      suite.change = 'modified';
    } else {
      suite.change = '';
    }
    suite.suites.forEach((s) => this._detectSuiteChange(s, oldTitles, oldTests));
    suite.tests.forEach((t) => this._detectTestChange(t, oldTests));
  }

  _detectTestChange(test: XTestResult, oldTests: XTestResult[]) {
    const oldTest = oldTests.find((t) => t.title === test.title);
    if (!oldTest) {
      test.change = 'added';
    } else {
      console.log(oldTest.status, test.status);
      if (oldTest.status !== test.status) {
        test.change = 'modified';
      } else {
        test.change = '';
      }
    }
  }
  
  _markChanges(suites: XTestSuite[], oldResults: XTestSuite[]) {
    function getSuiteTitle(titles:string[], suite: XTestSuite) {
      titles.push(suite.title);
      suite.suites.forEach((s) => getSuiteTitle(titles, s));
      suite.tests.forEach((t) => testTitles.push(t));
    }
    const suiteTitles = [];
    const testTitles = [];
    oldResults.forEach((oldSuite) => {
      getSuiteTitle(suiteTitles, oldSuite);
      oldSuite.tests.forEach((t) => testTitles.push(t));
    });
    for (let i = 0; i < suites.length; i++) {
      this._detectSuiteChange(suites[i], suiteTitles, testTitles);      
    }
  }
  
  generateReport(results: XTestSuite, oldResultsFile?: string, diffOnly?: boolean) {
    this._removeNonBehavioralTests(results);
    this._mergeSuites(results, {}, '');
    let opaqueSuites = this._removeTransparentSuites(results);
    diffOnly = diffOnly==undefined ? false: diffOnly;
    if (oldResultsFile) {
      if (fs.existsSync(oldResultsFile)) {
        const oldResults = JSON.parse(fs.readFileSync(oldResultsFile, 'utf8'));
        this._markChanges(opaqueSuites, oldResults);
      } else {
        this._markChanges(opaqueSuites, []);
      }
      if (diffOnly) {
        // keep suites if they have a test or suite that changed
        const containsChangeRecursive = (suite: XTestSuite) => {
          return suite.change || suite.suites.some(containsChangeRecursive) || suite.tests.some(t => t.change);
        }
        opaqueSuites = opaqueSuites.filter(containsChangeRecursive);
        opaqueSuites.forEach((s) => {
          s.suites = s.suites.filter(containsChangeRecursive);
          s.tests = s.tests.filter(t => t.change);
        });
      }
    }
    this.outputAdapter.generateReport(opaqueSuites);
  }
  
  
}

export * from './types.js';