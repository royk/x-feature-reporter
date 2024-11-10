import { TestSuite } from "..";
import fs from 'fs';

export default class JsonAdapter {
    generateReport(outputFile: string, results: TestSuite) {
        fs.writeFileSync(outputFile, JSON.stringify(results));
    }
}   