import { TestSuite } from "..";
import { XAdapter } from '..';
export type JsonAdapterOptions = {
    outputFile: string;
};
export default class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions);
    private adapterOptions;
    generateReport(results: TestSuite): void;
}
