import { TestResult, TestSuite, XFeatureReporterOptions } from "..";
export default class MarkdownAdapter {
    private nestedLevel;
    private stringBuilder;
    _getStringBuilder(): string;
    _willPrintTest(test: TestResult): boolean;
    _getOutcomeIcon(testCase: TestResult): "🚧" | "✅" | "❌";
    _printSuite(s: TestSuite): void;
    _generateMarkdown(outputFile: string, options?: XFeatureReporterOptions): void;
    generateReport(outputFile: string, results: TestSuite, options?: XFeatureReporterOptions): void;
}
