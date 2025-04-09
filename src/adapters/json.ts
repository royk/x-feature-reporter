import fs from 'fs';
import type { JsonAdapterOptions, XAdapter, XTestSuite } from '../types.js';


export class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions) {
        this.adapterOptions = adapterOptions || {outputFile: 'report.json'};
    }
    private adapterOptions: JsonAdapterOptions;
    generateReport(results: XTestSuite[]) {
        fs.writeFileSync(this.adapterOptions.outputFile, JSON.stringify(results));
    }
}   

export * from '../types.js';