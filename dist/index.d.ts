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
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export interface XAdapter {
    generateReport(results: TestSuite): void;
}
export declare class XFeatureReporter {
    constructor(outputAdapter?: XAdapter);
    private outputAdapter;
    _mergeSuites(suite: TestSuite, suiteStructure: Record<string, TestSuite>): TestSuite;
    generateReport(results: TestSuite): void;
}
