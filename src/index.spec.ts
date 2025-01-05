import { test, expect } from '@playwright/test';
import sinon from 'sinon';
import fs from 'fs';
import {XFeatureReporter, XTestSuite, XTestResult, TEST_TYPE_BEHAVIOR, XAdapter } from './index';
import { CHANGE_PREFIX_ADDED, MarkdownAdapter, TEST_PREFIX_FAILED, TEST_PREFIX_PASSED, TEST_PREFIX_SKIPPED } from './adapters/markdown';
import { JsonAdapter } from './adapters/json';


let writeFileSyncStub: sinon.SinonStub;

const featureTitle = 'Feature title';
const subfeatureTitle = 'Subfeature title';
const caseTitle = 'case title';
const caseTitle2 = 'case title 2';

let reporter: XFeatureReporter;
const testAdapter = new class implements XAdapter {
  report: XTestSuite[] = [];
  generateReport(results: XTestSuite[]): void {
    this.report = results;
  }
  getReport() {
    return this.report;
  }
}
test.describe("Core features", () => {
  test.beforeEach(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    writeFileSyncStub.returns(undefined);
    reporter = new XFeatureReporter();
  });
  test.afterEach(() => {
    sinon.restore(); 
  });
  test.describe("Merging", () => {
    test("Merge suites with the same lineage and name. merge their results under the same suite (lineage = parents suite names)", () => {
      const rootSuite: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [],
        tests: []
      };
      
      const testSuite1: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testSuite2: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      rootSuite.suites.push(testSuite1);
      rootSuite.suites.push(testSuite2);
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite1.tests.push(testCase1);
      const testCase2: XTestResult = {
        title: caseTitle2,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite2.tests.push(testCase2);
      reporter.generateReport(rootSuite);
      
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Merge suites with the same name and the same lineage on different lineage branches", () => {
      const rootSuite: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [],
        tests: []
      };
      const parentSuite1: XTestSuite = {
        title: 'dont print 1',
        transparent: true,
        suites: [],
        tests: []
      };
      const parentSuite2: XTestSuite = {
        title: 'dont print 1',
        transparent: true,
        suites: [],
        tests: []
      };
      
      const testSuite1: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testSuite2: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      rootSuite.suites.push(parentSuite1);
      rootSuite.suites.push(parentSuite2);
      parentSuite1.suites.push(testSuite1);
      parentSuite2.suites.push(testSuite2);
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite1.tests.push(testCase1);
      const testCase2: XTestResult = {
        title: caseTitle2,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite2.tests.push(testCase2);
      reporter.generateReport(rootSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Don't merge suites with the same name but different lineage", () => {
      const rootSuite: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [],
        tests: []
      };
      const parentSuite1: XTestSuite = {
        title: 'dont print 1',
        transparent: true,
        suites: [],
        tests: []
      };
      const parentSuite2: XTestSuite = {
        title: 'dont print 2',
        transparent: true,
        suites: [],
        tests: []
      };
      
      const testSuite1: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testSuite2: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      rootSuite.suites.push(parentSuite1);
      rootSuite.suites.push(parentSuite2);
      parentSuite1.suites.push(testSuite1);
      parentSuite2.suites.push(testSuite2);
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite1.tests.push(testCase1);
      const testCase2: XTestResult = {
        title: caseTitle2,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite2.tests.push(testCase2);
      reporter.generateReport(rootSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("Transparency", () => {
    test("Don't output suites marked as transparent. Their children will be outputted", () => {
      const rootSuite: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [],
        tests: []
      };
      
      const testSuite: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      rootSuite.suites.push(testSuite);
      const testCase: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      testSuite.tests.push(testCase);
      reporter = new XFeatureReporter(new JsonAdapter());
      reporter.generateReport(rootSuite);
      
      const expectedMarkdown = `[{"title":"Feature title","suites":[],"tests":[{"title":"case title","status":"passed","testType":"behavior"}]}]`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("Test types", () => {
    test("Only tests with testType 'behavior' appear as features. Non-behavioral tests aren't shown in the report (if testType is not specified, it's assumed to be 'behavior')", () => {
      const testSuite: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: 'edge-case'
      };
      const testCase2: XTestResult = {
        title: caseTitle2,
        status: 'passed'
      };
      testSuite.tests.push(testCase1);
      testSuite.tests.push(testCase2);
      reporter.generateReport(testSuite);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Don't output suites containing only non-behavioral tests", () => {
      const testSuite1: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: []
      };
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: 'edge-case'
      };
      testSuite1.tests.push(testCase1);
      reporter = new XFeatureReporter(new JsonAdapter());
      reporter.generateReport(testSuite1);
      const expectedOutput = `[]`;
      const actualOutput = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualOutput).toBe(expectedOutput);
    });
    test("Don't output suites containing suits containing only non-behavioral tests",
      {annotation: [{type: 'test-type', description: 'edge-case'}]}, () => {
        const testSuite1: XTestSuite = {
          title: featureTitle,
          suites: [],
          tests: []
        };
        const testSuite2: XTestSuite = {
          title: subfeatureTitle,
          suites: [],
          tests: []
        };
        const testCase1: XTestResult = {
          title: caseTitle,
          status: 'passed',
          testType: 'edge-case'
        };
        testSuite2.tests.push(testCase1);
        testSuite1.suites.push(testSuite2);
        reporter = new XFeatureReporter(new JsonAdapter());
        reporter.generateReport(testSuite1);
        const expectedOutput = `[]`;
        const actualOutput = writeFileSyncStub.getCall(0)?.args[1];
        expect(actualOutput).toBe(expectedOutput);
      });
    });
  });
  test.describe("Change detection", () => {
    
    test.beforeEach(() => {
      reporter = new XFeatureReporter(testAdapter);
    });
    test("A new suite is marked as 'added'", () => {
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      const newSuite: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: [testCase1],
      };
      const rootSuite2: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [newSuite],
        tests: []
      };
      reporter.generateReport(rootSuite2, []);
      const report = testAdapter.getReport();
      expect(report[0].change).toBe('added');
    });
    test("A new test is marked as 'added'", () => {
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      const newSuite: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: [testCase1],
      };
      reporter.generateReport(newSuite, []);
      const report = testAdapter.getReport();
      expect(testCase1.change).toBe('added');
    });
    test("An exsiting suite isn't marked", () => {
      const testCase1: XTestResult = {
        title: caseTitle,
        status: 'passed',
        testType: TEST_TYPE_BEHAVIOR
      };
      const newSuite: XTestSuite = {
        title: featureTitle,
        suites: [],
        tests: [testCase1],
      };
      const rootSuite2: XTestSuite = {
        title: 'dont print',
        transparent: true,
        suites: [newSuite],
        tests: []
      };
      reporter.generateReport(rootSuite2, []);
      const oldReport = testAdapter.getReport();
      const newSuite2: XTestSuite = {
        title: subfeatureTitle,
        suites: [newSuite],
        tests: []
      };
      rootSuite2.suites = [newSuite2];
      rootSuite2.suites[0] = newSuite2;
      newSuite.change = undefined;
      reporter.generateReport(rootSuite2, oldReport);
      const newReport = testAdapter.getReport();
      expect(newSuite.change).toBe(undefined);
    });
    
  });
  test.describe("Markdown generation", () => {
    test.beforeEach(() => {
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
      writeFileSyncStub.returns(undefined);
      reporter = new XFeatureReporter();
    });
    test.afterEach(() => {
      sinon.restore(); 
    });
    test.describe("Suites (headings)", () => {
      test("tests nest correctly", 
        {annotation: [{type: 'test-type', description: 'regression'}]}, () => {
          const json = [{"title":"Features","transparent":false,"suites":[{"title":"Suite A","transparent":false,"suites":[],"tests":[{"title":"Test A","status":"passed"}]},{"title":"Suite B","transparent":false,"suites":[],"tests":[{"title":"Test B","status":"passed"}]}],"tests":[]}];
          const mdAdapter = new MarkdownAdapter();
          mdAdapter.generateReport(json as XTestSuite[]);
          expect(mdAdapter._getStringBuilder()).toBe(`\n## Features\n### Suite A\n - ${TEST_PREFIX_PASSED} Test A\n### Suite B\n - ${TEST_PREFIX_PASSED} Test B\n`);
        });
        test("Suites appear as headings. Nested Suites are nested headings", () => {
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const testSuite2: XTestSuite = {
            title: subfeatureTitle,
            suites: [],
            tests: []
          };
          testSuite.suites.push(testSuite2);
          const testCase: XTestResult = {
            title: caseTitle,
            status: 'passed',
            testType: TEST_TYPE_BEHAVIOR
          };
          testSuite2.tests.push(testCase);
          reporter.generateReport(testSuite);
          
          const expectedMarkdown = `\n## ${featureTitle}\n### ${subfeatureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
        test("New suites are marked as such", () => {
          const testCase: XTestResult = {
            title: caseTitle,
            status: 'passed',
            testType: TEST_TYPE_BEHAVIOR,
            change: 'added'
          };
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: [testCase]
          };
          reporter.generateReport(testSuite, []);
          const expectedMarkdown = `\n## ${CHANGE_PREFIX_ADDED} ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
        
      });
      
      
      test.describe("Tests (features)", () => {
        test(`Tests appear as list items representing features. Each feature is visually marked as Passing ${TEST_PREFIX_PASSED}, Failing ${TEST_PREFIX_FAILED} or Skipped ${TEST_PREFIX_SKIPPED}`, () => {
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const failedCase: XTestResult = {
            title: caseTitle,
            status: 'failed',
          };
          const skippedCase: XTestResult = {
            title: caseTitle2,
            status: 'skipped',
          };
          testSuite.tests.push(failedCase);
          testSuite.tests.push(skippedCase);
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_FAILED} ${caseTitle}\n - ${TEST_PREFIX_SKIPPED} ${caseTitle2}\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
        test("Features can nest under other features using a '-' prefix", () => {
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          
          const testCase1: XTestResult = {
            title: caseTitle,
            status: 'passed',
          };
          const testCase2: XTestResult = {
            title: `- ${caseTitle2}`,
            status: 'passed',
          };
          testSuite.tests.push(testCase1);
          testSuite.tests.push(testCase2);
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
        test("- Features can nest multiple levels deep using multiple '-' prefixes", () => {
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          
          const testCase1: XTestResult = {
            title: caseTitle,
            status: 'passed',
          };
          const testCase2: XTestResult = {
            title: `-- ${caseTitle2}`,
            status: 'passed',
          };
          testSuite.tests.push(testCase1);
          testSuite.tests.push(testCase2);
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
      });
      test.describe("Embedding the report in an existing file", () => {
        const embeddingPlaceholder = "<!-- x-feature-reporter--start -->";
        const embeddingPlaceholderEnd = "<!-- x-feature-reporter--end -->";
        test("The features list is embedded in an existing file between placeholders", () => {
          const initialContent = "This is static content in the header";
          const additionalContent = "this is additional content in the footer";
          const oldContent = "this is old generated content";
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const testCase1: XTestResult = {
            title: caseTitle,
            status: 'passed',
          };
          testSuite.tests.push(testCase1);
          sinon.stub(fs, 'existsSync').returns(true);
          sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd+additionalContent);
          
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
          const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd + additionalContent;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedContent);
        });
        test("The closing placeholder can be ommitted if the feature list is intended as the last content in the file", () => {
          const initialContent = "This is static content";
          const oldContent = "this is old generated content";
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const testCase1: XTestResult = {
            title: caseTitle,
            status: 'passed',
          };
          testSuite.tests.push(testCase1);
          sinon.stub(fs, 'existsSync').returns(true);
          sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd);
          
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
          const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedContent);
        });
        
      });
      
      test.describe("Options", () => {
        test("Placeholder prefix can be specified using the 'embeddingPlaceholder' option", () => {
          const customEmbeddingPlaceholder = 'custom-feature-reporter';
          const embeddingPlaceholder = `<!-- ${customEmbeddingPlaceholder}--start -->`;
          const embeddingPlaceholderEnd = `<!-- ${customEmbeddingPlaceholder}--end -->`;
          reporter = new XFeatureReporter(new MarkdownAdapter({outputFile: 'report.md', embeddingPlaceholder:customEmbeddingPlaceholder}));
          
          const initialContent = "This is static content";
          const oldContent = "this is old generated content";
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const testCase1: XTestResult = {
            title: caseTitle,
            status: 'passed',
          };
          testSuite.tests.push(testCase1);
          sinon.stub(fs, 'existsSync').returns(true);
          sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd);
          
          reporter.generateReport(testSuite);
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
          const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          expect(actualMarkdown).toBe(expectedContent);
        });
        test("A link to a full test report will be included when the 'fullReportLink' option is provided", () => {
          const fullReportLink = 'full-report.html';
          reporter = new XFeatureReporter(new MarkdownAdapter({outputFile: 'report.md', fullReportLink}));
          const testSuite: XTestSuite = {
            title: featureTitle,
            suites: [],
            tests: []
          };
          const testCase: XTestResult = {
            title: caseTitle,
            status: 'passed',
            testType: TEST_TYPE_BEHAVIOR
          };
          testSuite.tests.push(testCase);
          
          reporter.generateReport(testSuite);
          
          const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n\n[Test report](${fullReportLink})\n`;
          const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
          
          expect(actualMarkdown).toBe(expectedMarkdown);
        });
      });
    });
    
    test.describe("JSON generation", () => {
      test.beforeEach(() => {
        writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
        writeFileSyncStub.returns(undefined);
        reporter = new XFeatureReporter(new JsonAdapter());
      });
      test.afterEach(() => {
        sinon.restore(); 
      });
      test("Generates a JSON file", () => {
        const json = {"title":"","transparent":true,"suites":[{"title":"no-browser","transparent":true,"suites":[{"title":"index.spec.ts","transparent":true,"suites":[{"title":"Features","transparent":false,"suites":[{"title":"Suite A","transparent":false,"suites":[],"tests":[{"title":"Test A","status":"passed"}]},{"title":"Suite B","transparent":false,"suites":[],"tests":[{"title":"Test B","status":"passed"}]}],"tests":[]}],"tests":[]}],"tests":[]}],"tests":[]};
        const suite = json as XTestSuite;
        reporter.generateReport(suite as XTestSuite);
        const fileContent = writeFileSyncStub.getCall(0)?.args[1];
        const strippedJson = "[{\"title\":\"Features\",\"transparent\":false,\"suites\":[{\"title\":\"Suite A\",\"transparent\":false,\"suites\":[],\"tests\":[{\"title\":\"Test A\",\"status\":\"passed\"}]},{\"title\":\"Suite B\",\"transparent\":false,\"suites\":[],\"tests\":[{\"title\":\"Test B\",\"status\":\"passed\"}]}],\"tests\":[]}]";
        expect(fileContent).toBe(strippedJson);
      });
    });