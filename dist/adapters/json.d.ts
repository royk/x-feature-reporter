import { XTestSuite } from "..";
import { XAdapter } from '..';
export type JsonAdapterOptions = {
    outputFile: string;
};
export declare class JsonAdapter implements XAdapter {
    constructor(adapterOptions?: JsonAdapterOptions);
    private adapterOptions;
    generateReport(results: XTestSuite[]): void;
}
