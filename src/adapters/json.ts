import { TestSuite } from "..";
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
    generateReport(results: TestSuite) {
        fs.writeFileSync(this.adapterOptions.outputFile, JSON.stringify(results));
    }
}   