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
export declare const TEST_PREFIX_SKIPPED = "\uD83D\uDEA7";
export declare const TEST_PREFIX_PASSED = "\u2705";
export declare const TEST_PREFIX_FAILED = "\u274C";
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export declare const defaultEmbeddingPlaceholder = "x-feature-reporter";
export declare class XFeatureReporter {
    constructor(options: XOptions | undefined);
    private options;
    _mergeSuites(suite: TestSuite, suiteStructure: Record<string, TestSuite>): TestSuite;
    generateReport(outputFile: string, results: TestSuite, options?: XFeatureReporterOptions): void;
}
