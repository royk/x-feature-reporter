import { defaultEmbeddingPlaceholder, TEST_PREFIX_FAILED, TEST_PREFIX_PASSED, TEST_PREFIX_SKIPPED, TEST_TYPE_BEHAVIOR, TestResult, TestSuite, XFeatureReporterOptions } from "..";
import fs from 'fs';
export default class MarkdownAdapter {
    private nestedLevel = 0;
    private stringBuilder = '';
    _getStringBuilder() {
        return this.stringBuilder;
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
            return TEST_PREFIX_SKIPPED;
          case 'passed':
            return TEST_PREFIX_PASSED;
          case 'failed':
            return TEST_PREFIX_FAILED;
        }
        return testCase.status;
      }
    
      _printSuite(s: TestSuite) {
        const myNestedLevel = this.nestedLevel;
        const headerPrefix = '  '.repeat(myNestedLevel) + '#'.repeat(myNestedLevel+2);
        if (s.tests.length === 0 && s.suites.length === 0) {
          return;
        }
        const isNotTransparent = s.transparent===null || !s.transparent;
        if (isNotTransparent) {
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
          
        } 
        s.suites.forEach((ss) => {
          this._printSuite(ss);
        });
        if (isNotTransparent) {
          this.nestedLevel--;
        }
      }
      _generateMarkdown(outputFile: string, options?: XFeatureReporterOptions) {
        const existingContent = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
        const embeddingPlaceholder = options?.embeddingPlaceholder || defaultEmbeddingPlaceholder;
        const embeddingPlaceholderStart = `<!-- ${embeddingPlaceholder}--start -->`;
        const embeddingPlaceholderEnd = `<!-- ${embeddingPlaceholder}--end -->`;
        if (existingContent.includes(embeddingPlaceholderStart)) {
          let endPlaceholderIndex = existingContent.indexOf(embeddingPlaceholderEnd);
          if (endPlaceholderIndex==-1) {
            endPlaceholderIndex = existingContent.length;
          }
          const startPlaceholderIndex = existingContent.indexOf(embeddingPlaceholderStart);
          const newContent = existingContent.slice(0, startPlaceholderIndex) + embeddingPlaceholderStart + this.stringBuilder + existingContent.slice(endPlaceholderIndex);
          fs.writeFileSync(outputFile, newContent);
        } else {
          fs.writeFileSync(outputFile, this.stringBuilder);
        }
      }
    generateReport(outputFile: string, results: TestSuite, options?: XFeatureReporterOptions) {
        this.stringBuilder = '\n';
        this.nestedLevel = 0;
        this._printSuite(results);
        if (options?.fullReportLink) {
            this.stringBuilder += `\n[Test report](${options.fullReportLink})\n`;
        }
        this._generateMarkdown(outputFile, options);
    }
}   