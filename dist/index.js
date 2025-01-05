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
    _detectSuiteChange(suite, oldTitles) {
        const titleExists = oldTitles.find((t) => t === suite.title);
        if (!titleExists) {
            suite.change = 'added';
        }
        suite.suites.forEach((s) => this._detectSuiteChange(s, oldTitles));
        suite.tests.forEach((t) => this._detectTestChange(t, oldTitles));
    }
    _detectTestChange(test, oldTitles) {
        const titleExists = oldTitles.find((t) => t === test.title);
        if (!titleExists) {
            test.change = 'added';
        }
    }
    _markChanges(suites, oldResults) {
        function getSuiteTitle(titles, suite) {
            titles.push(suite.title);
            suite.suites.forEach((s) => getSuiteTitle(titles, s));
            suite.tests.forEach((t) => testTitles.push(t.title));
        }
        const suiteTitles = [];
        const testTitles = [];
        oldResults.forEach((os) => {
            getSuiteTitle(suiteTitles, os);
            os.tests.forEach((t) => testTitles.push(t.title));
        });
        for (let i = 0; i < suites.length; i++) {
            this._detectSuiteChange(suites[i], suiteTitles);
        }
    }
    generateReport(results, oldResults) {
        this._removeNonBehavioralTests(results);
        this._mergeSuites(results, {}, '');
        const opaqueSuites = this._removeTransparentSuites(results);
        if (oldResults) {
            this._markChanges(opaqueSuites, oldResults);
        }
        this.outputAdapter.generateReport(opaqueSuites);
    }
}
exports.XFeatureReporter = XFeatureReporter;
