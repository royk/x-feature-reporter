import fs from 'fs';

export type TestSuite = {
  title: string;
  suites: TestSuite[];
  tests: TestResult[];
};
export type TestResult = {
  title: string;
  status: "passed" | "failed" | "skipped";
  testType?: string;
};

export const TEST_TYPE_BEHAVIOR = 'behavior';
export const embeddingPlaceholder = "<!-- playwright-feature-reporter--start -->";
export const embeddingPlaceholderEnd = "<!-- playwright-feature-reporter--end -->";

export default class XFeatureReporter {
  private nestedLevel = 0;
  private projectCount = 0;
  private stringBuilder = '';
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

  _willPrintTest(test: TestResult) {
    if (test.testType && test.testType !== TEST_TYPE_BEHAVIOR) {
      return;
    }
    return true;
  }

  _getOutcomeIcon(testCase: TestResult) {
    switch (testCase.status) {
      case 'skipped':
        return ':construction:';
      case 'passed':
        return ':white_check_mark:';
      case 'failed':
        return ':x:';
    }
    return testCase.status;
  }

  _printSuite(s: TestSuite) {
    const myNestedLevel = this.nestedLevel;
    const headerPrefix = '  '.repeat(myNestedLevel) + '#'.repeat(myNestedLevel+2);
    
    if (s.tests.length === 0 && s.suites.length === 0) {
      return;
    }
    const printableTests = s.tests.filter((test) => this._willPrintTest(test));
    // if there are no tests and no nested suites, don't print the suite
    // TODO: Consider differentiating between no tests and no printable tests
    if (s.suites.length === 0 && printableTests.length === 0) {
      return;
    }
    this.stringBuilder += `${headerPrefix} ${s.title}\n`;
    this.nestedLevel++;
    const testNames = [];
    s.tests
    .filter((test) => this._willPrintTest(test))
    .forEach((test) => {
      if (testNames.includes(test.title)) {
        return;
      }
     
      testNames.push(test.title);
      let testTitle = test.title;
      let additionalNesting = 0;
      if (testTitle.startsWith('-')) {
        additionalNesting = testTitle.indexOf(' ');
        testTitle = testTitle.slice(additionalNesting+1);
      }
      const listPrefix = '  '.repeat(myNestedLevel + additionalNesting) + '-';
      this.stringBuilder += `${listPrefix} ${this._getOutcomeIcon(test)} ${testTitle}\n`;
    });
    s.suites.forEach((ss) => {
      this._printSuite(ss);
    });
    this.nestedLevel--;
  }
  _generateMarkdown(outputFile: string) {
    const existingContent = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
    if (existingContent.includes(embeddingPlaceholder)) {
      let endPlaceholderIndex = existingContent.indexOf(embeddingPlaceholderEnd);
      if (endPlaceholderIndex==-1) {
        endPlaceholderIndex = existingContent.length;
      }
      const startPlaceholderIndex = existingContent.indexOf(embeddingPlaceholder);
      const newContent = existingContent.slice(0, startPlaceholderIndex) + embeddingPlaceholder + this.stringBuilder + existingContent.slice(endPlaceholderIndex);
      fs.writeFileSync(outputFile, newContent);
    } else {
      fs.writeFileSync(outputFile, this.stringBuilder);
    }
  }

  generateReport(outputFile: string, results: TestSuite) {
    const mergedSuite = this._mergeSuites(results, {});
    this.stringBuilder = '\n';
    this.nestedLevel = 0;
    this._printSuite(mergedSuite);
    this._generateMarkdown(outputFile);
  }
}