"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonAdapter = void 0;
const fs_1 = __importDefault(require("fs"));
class JsonAdapter {
    constructor(adapterOptions) {
        this.adapterOptions = adapterOptions || { outputFile: 'report.json' };
    }
    generateReport(results) {
        fs_1.default.writeFileSync(this.adapterOptions.outputFile, JSON.stringify(results));
    }
}
exports.JsonAdapter = JsonAdapter;
