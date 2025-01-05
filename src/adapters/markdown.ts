import { XTestResult, XTestSuite, XAdapter } from "..";
import fs from 'fs';

export const TEST_PREFIX_SKIPPED = '🚧';
export const TEST_PREFIX_PASSED = '✅';
export const TEST_PREFIX_FAILED = '❌';

export const CHANGE_PREFIX_ADDED = '🔥NEW🔥';

export const defaultEmbeddingPlaceholder = 'x-feature-reporter';

export type MarkdownAdapterOptions = {
    embeddingPlaceholder?: string;
    fullReportLink?: string;
    outputFile: string;
};

export class MarkdownAdapter implements XAdapter {
    constructor(adapterOptions?: MarkdownAdapterOptions) {
        this.adapterOptions = adapterOptions || {outputFile: 'report.md'};
    }
    private adapterOptions: MarkdownAdapterOptions;
    private nestedLevel = 0;
    private stringBuilder = '';
    _getStringBuilder() {
        return this.stringBuilder;
      }
    
      _getOutcomeIcon(testCase: XTestResult) {
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
    
      _printSuite(s: XTestSuite) {
        const myNestedLevel = this.nestedLevel;
        const headerPrefix = '#'.repeat(myNestedLevel+2);
        const hasNestedSuites = s.suites && s.suites.length > 0;
        const hasTests = s.tests && s.tests.length > 0;
        if (!hasTests && !hasNestedSuites) {
          return;
        }
        // if there are no tests and no nested suites, don't print the suite
        // TODO: Consider differentiating between no tests and no printable tests
        if (!hasNestedSuites && s.tests.length === 0) {
          return;
        }
        let changePrefix = '';
        if (s.change === 'added') {
          changePrefix = `${CHANGE_PREFIX_ADDED} `;
        }
        this.stringBuilder += `${headerPrefix} ${changePrefix}${s.title}\n`;
        this.nestedLevel++;
        const testNames = [];
        s.tests.forEach((test) => {
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
          changePrefix = '';
          if (test.change === 'added') {
            changePrefix = `${CHANGE_PREFIX_ADDED} `;
          }
          this.stringBuilder += ` - ${changePrefix}${this._getOutcomeIcon(test)} ${testTitle}\n`;
        });
          
        s.suites && s.suites.forEach((ss) => {
          this._printSuite(ss);
        });
        this.nestedLevel--;
      }
      _generateMarkdown(outputFile: string, options: MarkdownAdapterOptions) {
        const existingContent = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
        const embeddingPlaceholder = options.embeddingPlaceholder || defaultEmbeddingPlaceholder;
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
    generateReport(results: XTestSuite[]) {
        this.stringBuilder = '\n';
        this.nestedLevel = 0;
        results.forEach((result) => {
          this._printSuite(result);
          this.nestedLevel = 0;
        });
        if (this.adapterOptions.fullReportLink) {
            this.stringBuilder += `\n[Test report](${this.adapterOptions.fullReportLink})\n`;
        }
        this._generateMarkdown(this.adapterOptions.outputFile, this.adapterOptions);
    }
}   