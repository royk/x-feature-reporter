import type { XTestSuite, XTestResult, XAdapter } from './types.js';
export declare const TEST_TYPE_BEHAVIOR = "behavior";
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
export * from './types.js';
