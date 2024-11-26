import { XTestResult, XTestSuite, XAdapter } from "..";
export declare const TEST_PREFIX_SKIPPED = "\uD83D\uDEA7";
export declare const TEST_PREFIX_PASSED = "\u2705";
export declare const TEST_PREFIX_FAILED = "\u274C";
export declare const defaultEmbeddingPlaceholder = "x-feature-reporter";
export type MarkdownAdapterOptions = {
    embeddingPlaceholder?: string;
    fullReportLink?: string;
    outputFile: string;
};
export declare class MarkdownAdapter implements XAdapter {
    constructor(adapterOptions?: MarkdownAdapterOptions);
    private adapterOptions;
    private nestedLevel;
    private stringBuilder;
    _getStringBuilder(): string;
    _willPrintTest(test: XTestResult): boolean;
    _getOutcomeIcon(testCase: XTestResult): "🚧" | "✅" | "❌";
    _printSuite(s: XTestSuite): void;
    _generateMarkdown(outputFile: string, options: MarkdownAdapterOptions): void;
    generateReport(results: XTestSuite[]): void;
}
