import { XTestSuite } from "..";
import fs from 'fs';
import { XAdapter } from '..';

export type JsonAdapterOptions = {
    outputFile: string;
};
export class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions) {
        this.adapterOptions = adapterOptions || {outputFile: 'report.json'};
    }
    private adapterOptions: JsonAdapterOptions;
    generateReport(results: XTestSuite[]) {
        fs.writeFileSync(this.adapterOptions.outputFile, JSON.stringify(results));
    }
}   