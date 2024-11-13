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
  generateReport(results: XTestSuite): void;
}
export class XFeatureReporter {
  constructor(outputAdapter?: XAdapter) {
    this.outputAdapter = outputAdapter || new MarkdownAdapter();
  }
  
  private outputAdapter: XAdapter;

  _mergeSuites(suite: XTestSuite, suiteStructure: Record<string, XTestSuite>) {
    if (suiteStructure[suite.title]) {
      suiteStructure[suite.title].tests.push(...suite.tests);
      suiteStructure[suite.title].suites.push(...suite.suites);
      suite.tests = [];
      suite.suites = [];
    } else {
      suiteStructure[suite.title] = suite;
    }
    suite.suites && suite.suites.forEach((ss) => {
      this._mergeSuites(ss, suiteStructure);
    });
    return suite;
  }

  generateReport(results: XTestSuite) {
    const mergedSuite = this._mergeSuites(results, {});
    this.outputAdapter.generateReport(mergedSuite);
  }
}