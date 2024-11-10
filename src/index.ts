import fs from 'fs';
import JsonAdapter from './adapters/json';
import MarkdownAdapter from './adapters/markdown';

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

export type XFeatureReporterOptions = {
  embeddingPlaceholder?: string;
  fullReportLink?: string;
};

export type XOptions = {
  outputType: 'markdown' | 'json' | undefined;
};

export const TEST_PREFIX_SKIPPED = '🚧';
export const TEST_PREFIX_PASSED = '✅';
export const TEST_PREFIX_FAILED = '❌';

export const TEST_TYPE_BEHAVIOR = 'behavior';

export const defaultEmbeddingPlaceholder = 'x-feature-reporter';

export class XFeatureReporter {
  constructor(options: XOptions | undefined) {
    this.options = options || {
      outputType: 'markdown'
    };
  }
  
  private options: XOptions;
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
  
  generateReport(outputFile: string, results: TestSuite, options?: XFeatureReporterOptions) {
    const mergedSuite = this._mergeSuites(results, {});
    if (this.options.outputType === 'markdown') {
      new MarkdownAdapter().generateReport(outputFile, mergedSuite, options);
    } else {
      new JsonAdapter().generateReport(outputFile, mergedSuite);
    }
  }
}