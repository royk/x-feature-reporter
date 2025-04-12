export interface JsonAdapterOptions {
    outputFile: string;
};

export interface MarkdownAdapterOptions {
    embeddingPlaceholder?: string;
    fullReportLink?: string;
    outputFile: string;
};

export abstract class XAdapter {
    abstract generateReport(results: XTestSuite[]): void;
}

export interface XTestSuite {
    title: string;
    suites: XTestSuite[];
    tests: XTestResult[];
    transparent?: boolean;
    change?: "added" | "removed" | "modified" | "";
};
export interface XTestResult {
    title: string;
    status: "passed" | "failed" | "skipped";
    testType?: string;
    change?: "added" | "removed" | "modified" | "";
};

