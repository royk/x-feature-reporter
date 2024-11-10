import { TestSuite } from "..";
import fs from 'fs';
import { XAdapter } from '..';



export type JsonAdapterOptions = {
    outputFile?: string;
};
export default class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions) {
        this.adapterOptions = adapterOptions;
    }
    private adapterOptions?: JsonAdapterOptions;
    generateReport(results: TestSuite) {
        fs.writeFileSync(this.adapterOptions?.outputFile, JSON.stringify(results));
    }
}   