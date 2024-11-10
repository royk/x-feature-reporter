"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureReporter = exports.defaultEmbeddingPlaceholder = exports.TEST_TYPE_BEHAVIOR = exports.TEST_PREFIX_FAILED = exports.TEST_PREFIX_PASSED = exports.TEST_PREFIX_SKIPPED = void 0;
const json_1 = __importDefault(require("./adapters/json"));
const markdown_1 = __importDefault(require("./adapters/markdown"));
exports.TEST_PREFIX_SKIPPED = '🚧';
exports.TEST_PREFIX_PASSED = '✅';
exports.TEST_PREFIX_FAILED = '❌';
exports.TEST_TYPE_BEHAVIOR = 'behavior';
exports.defaultEmbeddingPlaceholder = 'x-feature-reporter';
class XFeatureReporter {
    constructor(options) {
        this.options = options || {
            outputType: 'markdown'
        };
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
    generateReport(outputFile, results, options) {
        const mergedSuite = this._mergeSuites(results, {});
        if (this.options.outputType === 'markdown') {
            new markdown_1.default().generateReport(outputFile, mergedSuite, options);
        }
        else {
            new json_1.default().generateReport(outputFile, mergedSuite);
        }
    }
}
exports.XFeatureReporter = XFeatureReporter;
