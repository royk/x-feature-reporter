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
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export declare const embeddingPlaceholder = "<!-- playwright-feature-reporter--start -->";
export declare const embeddingPlaceholderEnd = "<!-- playwright-feature-reporter--end -->";
export default class XFeatureReporter {
    private nestedLevel;
    private projectCount;
    private stringBuilder;
    _mergeSuites(suite: TestSuite, suiteStructure: Record<string, TestSuite>): TestSuite;
    _willPrintTest(test: TestResult): boolean;
    _getOutcomeIcon(testCase: TestResult): ":construction:" | ":white_check_mark:" | ":x:";
    _printSuite(s: TestSuite): void;
    _generateMarkdown(outputFile: string): void;
    generateReport(outputFile: string, results: TestSuite): void;
}
