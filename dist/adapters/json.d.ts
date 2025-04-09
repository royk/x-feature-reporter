import type { JsonAdapterOptions, XAdapter, XTestSuite } from '../types.js';
export declare class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions);
    private adapterOptions;
    generateReport(results: XTestSuite[]): void;
}
export * from '../types.js';
