export type XTestSuite = {
    title: string;
    suites: XTestSuite[];
    tests: XTestResult[];
    transparent?: boolean;
};
export type XTestResult = {
    title: string;
    status: "passed" | "failed" | "skipped";
    testType?: string;
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
    generateReport(results: XTestSuite): void;
}
