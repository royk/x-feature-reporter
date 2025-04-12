import levenshtein from 'js-levenshtein';
import { MarkdownAdapter } from './adapters/markdown.js';
import fs from 'fs';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export class XFeatureReporter {
    constructor(outputAdapter) {
        this.outputAdapter = outputAdapter || new MarkdownAdapter();
    }
    _mergeSuites(suite, suiteStructure, lineage) {
        const fullLineage = `${lineage}/${suite.title}`;
        if (suiteStructure[fullLineage]) {
            suiteStructure[fullLineage].tests.push(...suite.tests);
            suiteStructure[fullLineage].suites.push(...suite.suites);
            suite.suites && suite.suites.forEach((ss) => {
                this._mergeSuites(ss, suiteStructure, fullLineage);
            });
            suite.tests = [];
            suite.suites = [];
        }
        else {
            suiteStructure[fullLineage] = suite;
        }
        suite.suites && suite.suites.forEach((ss) => {
            this._mergeSuites(ss, suiteStructure, fullLineage);
        });
        return suite;
    }
    _removeTransparentSuites(suite) {
        if (suite.transparent) {
            return suite.suites.flatMap((s) => this._removeTransparentSuites(s));
        }
        return [suite];
    }
    _removeNonBehavioralTests(suite) {
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
            if (suite.suites.length === 0 || suite.suites.every((s) => s.transparent)) {
                suite.transparent = true;
            }
        }
    }
    _detectSuiteChange(suite, oldTitles, oldTestTitles) {
        let minDistance = Math.min(...oldTitles.map(title => levenshtein(suite.title, title)));
        const ratio = minDistance / suite.title.length;
        if (minDistance == Infinity) {
            suite.change = 'added';
        }
        else if (ratio > 0.3) {
            suite.change = 'modified';
        }
        else {
            suite.change = '';
        }
        suite.suites.forEach((s) => this._detectSuiteChange(s, oldTitles, oldTestTitles));
        suite.tests.forEach((t) => this._detectTestChange(t, oldTestTitles));
    }
    _detectTestChange(test, oldTitles) {
        console.log(oldTitles, test.title);
        const titleExists = oldTitles.find((t) => t === test.title);
        if (!titleExists) {
            test.change = 'added';
        }
        else {
            test.change = '';
        }
    }
    _markChanges(suites, oldResults) {
        function getSuiteTitle(titles, suite) {
            titles.push(suite.title);
            suite.suites.forEach((s) => getSuiteTitle(titles, s));
            suite.tests.forEach((t) => testTitles.push(t.title));
        }
        const suiteTitles = [];
        const testTitles = [];
        oldResults.forEach((os) => {
            getSuiteTitle(suiteTitles, os);
            os.tests.forEach((t) => testTitles.push(t.title));
        });
        for (let i = 0; i < suites.length; i++) {
            this._detectSuiteChange(suites[i], suiteTitles, testTitles);
        }
    }
    generateReport(results, oldResultsFile) {
        this._removeNonBehavioralTests(results);
        this._mergeSuites(results, {}, '');
        const opaqueSuites = this._removeTransparentSuites(results);
        if (oldResultsFile) {
            if (fs.existsSync(oldResultsFile)) {
                const oldResults = JSON.parse(fs.readFileSync(oldResultsFile, 'utf8'));
                this._markChanges(opaqueSuites, oldResults);
            }
            else {
                this._markChanges(opaqueSuites, []);
            }
        }
        this.outputAdapter.generateReport(opaqueSuites);
    }
}
export * from './types.js';
