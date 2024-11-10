"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class JsonAdapter {
    generateReport(outputFile, results) {
        fs_1.default.writeFileSync(outputFile, JSON.stringify(results));
    }
}
exports.default = JsonAdapter;
