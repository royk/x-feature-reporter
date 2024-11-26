"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureReporter = exports.TEST_TYPE_BEHAVIOR = void 0;
const markdown_1 = require("./adapters/markdown");
exports.TEST_TYPE_BEHAVIOR = 'behavior';
class XFeatureReporter {
    constructor(outputAdapter) {
        this.outputAdapter = outputAdapter || new markdown_1.MarkdownAdapter();
    }
    _mergeSuites(suite, suiteStructure, lineage) {
        const fullLineage = `${lineage}/${suite.title}`;
        if (suiteStructure[fullLineage]) {
            suiteStructure[fullLineage].tests.push(...suite.tests);
            suiteStructure[fullLineage].suites.push(...suite.suites);
            suite.suites && suite.suites.forEach((ss) => {
                this._mergeSuites(ss, suiteStructure, fullLineage);
            });
            suite.tests = [];
            suite.suites = [];
        }
        else {
            suiteStructure[fullLineage] = suite;
        }
        suite.suites && suite.suites.forEach((ss) => {
            this._mergeSuites(ss, suiteStructure, fullLineage);
        });
        return suite;
    }
    generateReport(results) {
        const mergedSuite = this._mergeSuites(results, {}, '');
        this.outputAdapter.generateReport(mergedSuite);
    }
}
exports.XFeatureReporter = XFeatureReporter;
