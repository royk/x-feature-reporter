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
    _removeTransparentSuites(suite) {
        if (suite.transparent) {
            return suite.suites.flatMap((s) => this._removeTransparentSuites(s));
        }
        return [suite];
    }
    _removeNonBehavioralTests(suite) {
        const removalCandidates = [];
        suite.tests = suite.tests.filter((t) => !t.testType || t.testType === exports.TEST_TYPE_BEHAVIOR);
        if (suite.tests.length === 0) {
            removalCandidates.push(suite);
        }
        suite.suites && suite.suites.forEach((s) => {
            this._removeNonBehavioralTests(s);
        });
        // reverse iteration to avoid mutating the array while iterating over it
        for (let i = removalCandidates.length - 1; i >= 0; i--) {
            if (suite.suites.length === 0 || suite.suites.every((s) => s.transparent)) {
                suite.transparent = true;
            }
        }
    }
    generateReport(results) {
        this._removeNonBehavioralTests(results);
        const mergedSuite = this._mergeSuites(results, {}, '');
        const opaqueSuites = this._removeTransparentSuites(mergedSuite);
        this.outputAdapter.generateReport(opaqueSuites);
    }
}
exports.XFeatureReporter = XFeatureReporter;
