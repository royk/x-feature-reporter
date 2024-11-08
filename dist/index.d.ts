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
export declare const TEST_PREFIX_SKIPPED = "\uD83D\uDEA7";
export declare const TEST_PREFIX_PASSED = "\u2705";
export declare const TEST_PREFIX_FAILED = "\u274C";
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export declare const defaultEmbeddingPlaceholder = "x-feature-reporter";
export declare class XFeatureReporter {
    constructor();
    private nestedLevel;
    private stringBuilder;
    _mergeSuites(suite: TestSuite, suiteStructure: Record<string, TestSuite>): TestSuite;
    _getStringBuilder(): string;
    _willPrintTest(test: TestResult): boolean;
    _getOutcomeIcon(testCase: TestResult): "🚧" | "✅" | "❌";
    _printSuite(s: TestSuite): void;
    _generateMarkdown(outputFile: string, options?: XFeatureReporterOptions): void;
    generateReport(outputFile: string, results: TestSuite, options?: XFeatureReporterOptions): void;
}
