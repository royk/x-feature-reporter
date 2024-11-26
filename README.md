# X-Feature Reporter
Generates or updates documentation with the results of a test run.
Not intended to be used directly. Rather, use it as a base for your custom reporter.

Existing reporters:
- [playwright-feature-reporter](https://github.com/royk/playwright-feature-reporter)
- [jest-feature-reporter](https://github.com/royk/jest-feature-reporter)

(want to add your own? open a PR!)

## Reporters
`x-feature-reporter` accepts a standardized javascript object that represents a test run with results.
It then performs some transformations and hands off the data to an adapter for output.

Usually, a reporter will be created to convert a test framework's native output format into the standardized format. The reporter will instantiate `XFeatureReporter` with an adapter, and then call `generateReport` with the test results, converted to the standardized format.

See usage example below.

## Adapters

`x-feature-reporter` uses adapters to support different output formats.
The default adapter is `Markdown`, but you can easily implement your own adapter.
For example, you could implement an adapter for outputting to Word, PDF, or even publishing via an API to slack or notion.

`x-feature-reporter` is additionally bundled with a `JSON` adapter, which outputs the standardized, transformed data as a JSON file. This can be useful if you want to further process the data (for example, combine it with the results of other test runs).

You can supply your own adapter by implementing the `XAdapter` interface.

## Usage example
In your own reporter, you can use `x-feature-reporter` as follows:

```typescript
const xsuite = {/* your test results */} as XTestSuite;
const reporter = new XFeatureReporter(new MyCustomAdapter({
      ...myCustomAdapterOptions
}));
reporter.generateReport(xsuite);
```

## Features

The below section was generated using [Playwright-feature-reporter](https://github.com/royk/playwright-feature-reporter), which is based on this library.

<!-- playwright-feature-reporter--start -->
## Core features
  ### Suites
  - ✅ Merge suites with the same lineage and name. merge their results under the same suite (lineage = parents suite names)
  - ✅ Merge suites with the same name and the same lineage on different lineage branches
  - ✅ Don't merge suites with the same name but different lineage
## Markdown generation
- ✅ Don't output suites containing only non-behavioral tests
- ✅ Don't output suites marked as transparent. Their children will be outputted
  ### Suites (headings)
  - ✅ Suites appear as headings. Nested Suites are nested headings
  ### TestResults (features)
  - ✅ TestResults appear as list items representing features. Each feature is visually marked as Passing ✅, Failing ❌ or Skipped 🚧
  - ✅ Only XTestResults with testType 'behavior' appear as features. Non-behavioral tests aren't shown in the report (if testType is not specified, it's assumed to be 'behavior')
  - ✅ Features can nest under other features using a '-' prefix
    - ✅ Features can nest multiple levels deep using multiple '-' prefixes
  ### Embedding the report in an existing file
  - ✅ The features list is embedded in an existing file between placeholders
  - ✅ The closing placeholder can be ommitted if the feature list is intended as the last content in the file
  ### Options
  - ✅ Placeholder prefix can be specified using the 'embeddingPlaceholder' option
  - ✅ A link to a full test report will be included when the 'fullReportLink' option is provided
## JSON generation
- ✅ Generates a JSON file
- 🚧 Suites can be marked as transparent: They will not be printed but their children will be printed

[Test report](https://raw.githack.com/royk/x-feature-reporter/refs/heads/main/playwright-report/index.html)
