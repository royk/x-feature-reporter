import { MarkdownAdapter } from './adapters/markdown';

export type TestSuite = {
  title: string;
  suites: TestSuite[];
  tests: TestResult[];
  transparent?: boolean;
};
export type TestResult = {
  title: string;
  status: "passed" | "failed" | "skipped";
  testType?: string;
};

export const TEST_TYPE_BEHAVIOR = 'behavior';

export interface XAdapter {
  generateReport(results: TestSuite): void;
}
export class XFeatureReporter {
  constructor(outputAdapter?: XAdapter) {
    this.outputAdapter = outputAdapter || new MarkdownAdapter();
  }
  
  private outputAdapter: XAdapter;

  _mergeSuites(suite: TestSuite, suiteStructure: Record<string, TestSuite>) {
    if (suiteStructure[suite.title]) {
      suiteStructure[suite.title].tests.push(...suite.tests);
      suiteStructure[suite.title].suites.push(...suite.suites);
      suite.tests = [];
      suite.suites = [];
    } else {
      suiteStructure[suite.title] = suite;
    }
    suite.suites.forEach((ss) => {
      this._mergeSuites(ss, suiteStructure);
    });
    return suite;
  }

  generateReport(results: TestSuite) {
    const mergedSuite = this._mergeSuites(results, {});
    this.outputAdapter.generateReport(mergedSuite);
  }
}