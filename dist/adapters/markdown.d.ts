import type { XAdapter, XTestSuite, XTestResult, MarkdownAdapterOptions } from '../types.js';
export declare const TEST_PREFIX_SKIPPED = "\uD83D\uDEA7";
export declare const TEST_PREFIX_PASSED = "\u2705";
export declare const TEST_PREFIX_FAILED = "\u274C";
export declare const CHANGE_PREFIX_ADDED = "\uD83D\uDD25NEW\uD83D\uDD25";
export declare const defaultEmbeddingPlaceholder = "x-feature-reporter";
export declare class MarkdownAdapter implements XAdapter {
    constructor(adapterOptions?: MarkdownAdapterOptions);
    private adapterOptions;
    private nestedLevel;
    private stringBuilder;
    _getStringBuilder(): string;
    _getOutcomeIcon(testCase: XTestResult): "🚧" | "✅" | "❌";
    _printSuite(s: XTestSuite): void;
    _generateMarkdown(outputFile: string, options: MarkdownAdapterOptions): void;
    generateReport(results: XTestSuite[]): void;
}
export * from '../types.js';
