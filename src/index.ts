import { MarkdownAdapter } from './adapters/markdown';

export type XTestSuite = {
  title: string;
  suites: XTestSuite[];
  tests: XTestResult[];
  transparent?: boolean;
};
export type XTestResult = {
  title: string;
  status: "passed" | "failed" | "skipped";
  testType?: string;
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

  generateReport(results: XTestSuite) {
    const mergedSuite = this._mergeSuites(results, {}, '');
    const opaqueSuites = this._removeTransparentSuites(mergedSuite);
    
    this.outputAdapter.generateReport(opaqueSuites);
  }
}