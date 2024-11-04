import { test, expect } from '@playwright/test';
import sinon from 'sinon';
import fs from 'fs';
import {XFeatureReporter, TestSuite, TestResult, TEST_TYPE_BEHAVIOR, embeddingPlaceholder, embeddingPlaceholderEnd, XFeatureReporterOptions } from './index';


let writeFileSyncStub: sinon.SinonStub;

const featureTitle = 'Feature title';
const subfeatureTitle = 'Subfeature title';
const caseTitle = 'case title';
const caseTitle2 = 'case title 2';
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
  test.describe("Suites (headings)", () => {
    test("Transparent suites don't affect nesting levels", 
      {annotation: [{type: 'test-type', description: 'edge-case'}]}, () => {
        const suite = {"title":"","transparent":true,"suites":[{"title":"Mobile Chrome","transparent":true,"suites":[{"title":"index.spec.ts","transparent":true,"suites":[{"title":"Welcome screen","transparent":false,"suites":[],"tests":[{"title":"Has a button that directs the user to the signup page","status":"passed"}]}],"tests":[]},{"title":"register-screen.spec.ts","transparent":true,"suites":[{"title":"Signup screen","transparent":false,"suites":[],"tests":[{"title":"When the user fills in the form and clicks the signup button, they are taken to the profile creation page","status":"passed"}]}],"tests":[]}],"tests":[]}],"tests":[]};
        // an exception would be thrown if this is not handled correctly (nestedLevel goes below 0)
        reporter.generateReport(outputFile, suite as TestSuite);
      });
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
    test("Suites with the same name have their results merged, and the heading is shown only once", () => {
      const rootSuite: TestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [],
        tests: []
      };
  
      const testSuite1: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testSuite2: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      rootSuite.suites.push(testSuite1);
      rootSuite.suites.push(testSuite2);
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite1.tests.push(testCase1);
      const testCase2: TestResult = {
        title: caseTitle2,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite2.tests.push(testCase2);
      reporter.generateReport(outputFile, rootSuite);

      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n- ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Suites containing only non-behavioral tests are not shown in the report", () => {
      const testSuite1: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
        testType: 'edge-case'
      };
      testSuite1.tests.push(testCase1);
      reporter.generateReport(outputFile, testSuite1);
      const expectedMarkdown = `\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("TestResults (features)", () => {
    test(`TestResults appear as list items representing features. Each feature is visually marked as Passing ${passingEmoji}, Failing ${failingEmoji} or Skipped ${skippedEmoji}`, () => {
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const failedCase: TestResult = {
        title: caseTitle,
        status: 'failed',
      };
      const skippedCase: TestResult = {
        title: caseTitle2,
        status: 'skipped',
      };
      testSuite.tests.push(failedCase);
      testSuite.tests.push(skippedCase);
      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${failingEmoji} ${caseTitle}\n- ${skippedEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Only TestResults with testType 'behavior' appear as features. If testType is note specified, it's assumed to be 'behavior'", () => {
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
        testType: 'edge-case'
      };
      const testCase2: TestResult = {
        title: caseTitle2,
        status: 'passed'
      };
      testSuite.tests.push(testCase1);
      testSuite.tests.push(testCase2);
      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Features can nest under other features using a '-' prefix", () => {
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };

      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
      };
      const testCase2: TestResult = {
        title: `- ${caseTitle2}`,
        status: 'passed',
      };
      testSuite.tests.push(testCase1);
      testSuite.tests.push(testCase2);
      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n  - ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("- Features can nest multiple levels deep using multiple '-' prefixes", () => {
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };

      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
      };
      const testCase2: TestResult = {
        title: `-- ${caseTitle2}`,
        status: 'passed',
      };
      testSuite.tests.push(testCase1);
      testSuite.tests.push(testCase2);
      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n    - ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("Embedding", () => {
    test("The features list is embedded in an existing file between placeholders", () => {
      const initialContent = "This is static content in the header";
      const additionalContent = "this is additional content in the footer";
      const oldContent = "this is old generated content";
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
      };
      testSuite.tests.push(testCase1);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd+additionalContent);
      
      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd + additionalContent;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    test("The closing placeholder can be ommitted if the feature list is intended as the last content in the file", () => {
      const initialContent = "This is static content";
      const oldContent = "this is old generated content";
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
      };
      testSuite.tests.push(testCase1);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd);

      reporter.generateReport(outputFile, testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
  });
  
  test.describe("Options", () => {
    test.skip("Placeholder prefix can be specified using the 'embeddingPlaceholder' option", () => {
      const customEmbeddingPlaceholder = 'x-feature-reporter';
      const embeddingPlaceholder = `<!-- ${customEmbeddingPlaceholder}--start -->`;
      const embeddingPlaceholderEnd = `<!-- ${customEmbeddingPlaceholder}--end -->`;

      const initialContent = "This is static content";
      const oldContent = "this is old generated content";
      const testSuite: TestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: TestResult = {
        title: caseTitle,
        status: 'passed',
      };
      testSuite.tests.push(testCase1);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd);
      const options = {embeddingPlaceholder: customEmbeddingPlaceholder} as XFeatureReporterOptions;
      reporter.generateReport(outputFile, testSuite, options);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
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
      const options = {fullReportLink: fullReportLink} as XFeatureReporterOptions;
      reporter.generateReport(outputFile, testSuite, options);

      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n\n[Test report](${fullReportLink})\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
});