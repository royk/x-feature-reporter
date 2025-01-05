export type XTestSuite = {
    title: string;
    suites: XTestSuite[];
    tests: XTestResult[];
    transparent?: boolean;
    change?: "added" | "removed" | "modified";
};
export type XTestResult = {
    title: string;
    status: "passed" | "failed" | "skipped";
    testType?: string;
    change?: "added" | "removed" | "modified";
};
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export interface XAdapter {
    generateReport(results: XTestSuite[]): void;
}
export declare class XFeatureReporter {
    constructor(outputAdapter?: XAdapter);
    private outputAdapter;
    _mergeSuites(suite: XTestSuite, suiteStructure: Record<string, XTestSuite>, lineage: string): XTestSuite;
    _removeTransparentSuites(suite: XTestSuite): XTestSuite[];
    _removeNonBehavioralTests(suite: XTestSuite): void;
    _detectSuiteChange(suite: XTestSuite, oldTitles: string[]): void;
    _detectTestChange(test: XTestResult, oldTitles: string[]): void;
    _markChanges(suites: XTestSuite[], oldResults: XTestSuite[]): void;
    generateReport(results: XTestSuite, oldResults?: XTestSuite[]): void;
}
