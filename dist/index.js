"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureReporter = exports.TEST_TYPE_BEHAVIOR = void 0;
const markdown_1 = __importDefault(require("./adapters/markdown"));
exports.TEST_TYPE_BEHAVIOR = 'behavior';
class XFeatureReporter {
    constructor(outputAdapter) {
        this.outputAdapter = outputAdapter || new markdown_1.default();
    }
    _mergeSuites(suite, suiteStructure) {
        if (suiteStructure[suite.title]) {
            suiteStructure[suite.title].tests.push(...suite.tests);
            suiteStructure[suite.title].suites.push(...suite.suites);
            suite.tests = [];
            suite.suites = [];
        }
        else {
            suiteStructure[suite.title] = suite;
        }
        suite.suites.forEach((ss) => {
            this._mergeSuites(ss, suiteStructure);
        });
        return suite;
    }
    generateReport(results) {
        const mergedSuite = this._mergeSuites(results, {});
        this.outputAdapter.generateReport(mergedSuite);
    }
}
exports.XFeatureReporter = XFeatureReporter;
