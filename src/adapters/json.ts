import { TestSuite } from "..";
import fs from 'fs';
import { XAdapter } from '..';

export default class JsonAdapter implements XAdapter {
    generateReport(outputFile: string, results: TestSuite) {
        fs.writeFileSync(outputFile, JSON.stringify(results));
    }
}   