import { test, expect } from '@playwright/test';
import sinon from 'sinon';
import fs from 'fs';
import {XFeatureReporter, TestSuite, TestResult, TEST_TYPE_BEHAVIOR } from './index';


let writeFileSyncStub: sinon.SinonStub;

const featureTitle = 'Feature title';
const subfeatureTitle = 'Subfeature title';
const caseTitle = 'case title';
const passingEmoji = ':white_check_mark:';
const failingEmoji = ':x:';
const skippedEmoji = ':construction:';
const outputFile = 'output.md';

let reporter: XFeatureReporter;

test.beforeEach(() => {
  writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  writeFileSyncStub.returns(undefined);
  reporter = new XFeatureReporter();
});

test.afterEach(() => {
  sinon.restore(); 
});

test.describe("Features", () => {
  test("Suites appear as headings. Nested Suites are nested headings", () => {
    const testSuite: TestSuite = {
      title: featureTitle,
      suites: [],
      tests: []
    };
    const testSuite2: TestSuite = {
      title: subfeatureTitle,
      suites: [],
      tests: []
    };
    testSuite.suites.push(testSuite2);
    const testCase: TestResult = {
      title: caseTitle,
      status: 'passed',
      testType: TEST_TYPE_BEHAVIOR
    };
    testSuite2.tests.push(testCase);
    reporter.generateReport(outputFile, testSuite);

    const expectedMarkdown = `\n## ${featureTitle}\n  ### ${subfeatureTitle}\n  - ${passingEmoji} ${caseTitle}\n`;
    const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
    
    expect(actualMarkdown).toBe(expectedMarkdown);
  });
  test("Suites can be marked as transparent: They will not be printed but their children will be printed", () => {
    const rootSuite: TestSuite = {
      title: 'dont print',
      transparent: true,
      suites: [],
      tests: []
    };

    const testSuite: TestSuite = {
      title: featureTitle,
      suites: [],
      tests: []
    };
    rootSuite.suites.push(testSuite);
    const testCase: TestResult = {
      title: caseTitle,
      status: 'passed',
      testType: TEST_TYPE_BEHAVIOR
    };
    testSuite.tests.push(testCase);
    reporter.generateReport(outputFile, rootSuite);

    const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
    const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
    
    expect(actualMarkdown).toBe(expectedMarkdown);
  });
  test("A link to a full test report will be included when the 'fullReportLink' option is provided", () => {
    const fullReportLink = 'full-report.html';
    const testSuite: TestSuite = {
      title: featureTitle,
      suites: [],
      tests: []
    };
    const testCase: TestResult = {
      title: caseTitle,
      status: 'passed',
      testType: TEST_TYPE_BEHAVIOR
    };
    testSuite.tests.push(testCase);
    reporter.generateReport(outputFile, testSuite, fullReportLink);

    const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n\n[Test report](${fullReportLink})\n`;
    const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
    
    expect(actualMarkdown).toBe(expectedMarkdown);
  });
});