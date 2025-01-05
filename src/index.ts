import { MarkdownAdapter } from './adapters/markdown';

export type XTestSuite = {
  title: string;
  suites: XTestSuite[];
  tests: XTestResult[];
  transparent?: boolean;
  change?: "added" | "removed" | "modified";
};
export type XTestResult = {
  title: string;
  status: "passed" | "failed" | "skipped";
  testType?: string;
  change?: "added" | "removed" | "modified";
};

export const TEST_TYPE_BEHAVIOR = 'behavior';

export interface XAdapter {
  generateReport(results: XTestSuite[]): void;
}
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

  _markChanges(opaqueSuites: XTestSuite[], oldResults: XTestSuite[]) {
    for (let i = 0; i < opaqueSuites.length; i++) {
      const oldSuite = oldResults.find((os) => os.title === opaqueSuites[i].title);
      if (!oldSuite) {
        opaqueSuites[i].change = 'added';
      }
    }
  }

  generateReport(results: XTestSuite, oldResults?: XTestSuite[]) {
    this._removeNonBehavioralTests(results);
    this._mergeSuites(results, {}, '');
    const opaqueSuites = this._removeTransparentSuites(results);
    if (oldResults) {
      this._markChanges(opaqueSuites, oldResults);
    }
    this.outputAdapter.generateReport(opaqueSuites);
  }


}