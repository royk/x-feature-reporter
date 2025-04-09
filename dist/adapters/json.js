import fs from 'fs';
export class JsonAdapter {
    constructor(adapterOptions) {
        this.adapterOptions = adapterOptions || { outputFile: 'report.json' };
    }
    generateReport(results) {
        fs.writeFileSync(this.adapterOptions.outputFile, JSON.stringify(results));
    }
}
export * from '../types.js';
