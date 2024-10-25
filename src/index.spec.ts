import { test, expect } from '@playwright/test';
import sinon from 'sinon';
import fs from 'fs';
import XFeatureReporter, { TestSuite, TestResult, TEST_TYPE_BEHAVIOR } from './index';


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

test.describe("Features", () => {
  test("Describe blocks appear as headings. Nested describe blocks are nested headings", () => {
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
});