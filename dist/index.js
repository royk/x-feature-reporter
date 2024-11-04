"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureReporter = exports.embeddingPlaceholderEnd = exports.embeddingPlaceholder = exports.TEST_TYPE_BEHAVIOR = void 0;
const fs_1 = __importDefault(require("fs"));
exports.TEST_TYPE_BEHAVIOR = 'behavior';
exports.embeddingPlaceholder = "<!-- x-feature-reporter--start -->";
exports.embeddingPlaceholderEnd = "<!-- x-feature-reporter--end -->";
class XFeatureReporter {
    constructor() {
        this.nestedLevel = 0;
        this.stringBuilder = '';
        this.nestedLevel = 0;
        this.stringBuilder = '';
    }
    _mergeSuites(suite, suiteStructure) {
        if (suiteStructure[suite.title]) {
            suiteStructure[suite.title].tests.push(...suite.tests);
            suiteStructure[suite.title].suites.push(...suite.suites);
            suite.tests = [];
            suite.suites = [];
        }
        else {
            suiteStructure[suite.title] = suite;
        }
        suite.suites.forEach((ss) => {
            this._mergeSuites(ss, suiteStructure);
        });
        return suite;
    }
    _willPrintTest(test) {
        if (test.testType && test.testType !== exports.TEST_TYPE_BEHAVIOR) {
            return;
        }
        return true;
    }
    _getOutcomeIcon(testCase) {
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
    _printSuite(s) {
        const myNestedLevel = this.nestedLevel;
        const headerPrefix = '  '.repeat(myNestedLevel) + '#'.repeat(myNestedLevel + 2);
        if (s.tests.length === 0 && s.suites.length === 0) {
            return;
        }
        const isTransparent = s.transparent === null || !s.transparent;
        if (isTransparent) {
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
                    testTitle = testTitle.slice(additionalNesting + 1);
                }
                const listPrefix = '  '.repeat(myNestedLevel + additionalNesting) + '-';
                this.stringBuilder += `${listPrefix} ${this._getOutcomeIcon(test)} ${testTitle}\n`;
            });
        }
        s.suites.forEach((ss) => {
            this._printSuite(ss);
        });
        if (!isTransparent) {
            this.nestedLevel--;
        }
    }
    _generateMarkdown(outputFile) {
        const existingContent = fs_1.default.existsSync(outputFile) ? fs_1.default.readFileSync(outputFile, 'utf8') : '';
        if (existingContent.includes(exports.embeddingPlaceholder)) {
            let endPlaceholderIndex = existingContent.indexOf(exports.embeddingPlaceholderEnd);
            if (endPlaceholderIndex == -1) {
                endPlaceholderIndex = existingContent.length;
            }
            const startPlaceholderIndex = existingContent.indexOf(exports.embeddingPlaceholder);
            const newContent = existingContent.slice(0, startPlaceholderIndex) + exports.embeddingPlaceholder + this.stringBuilder + existingContent.slice(endPlaceholderIndex);
            fs_1.default.writeFileSync(outputFile, newContent);
        }
        else {
            fs_1.default.writeFileSync(outputFile, this.stringBuilder);
        }
    }
    generateReport(outputFile, results, fullReportLink) {
        const mergedSuite = this._mergeSuites(results, {});
        this.stringBuilder = '\n';
        this.nestedLevel = 0;
        this._printSuite(mergedSuite);
        if (fullReportLink) {
            this.stringBuilder += `\n[Test report](${fullReportLink})\n`;
        }
        this._generateMarkdown(outputFile);
    }
}
exports.XFeatureReporter = XFeatureReporter;
