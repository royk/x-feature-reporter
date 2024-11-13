# X-Feature Reporter
Generates or updates a Markdown file with the results of a test run.
Not intended to be used directly. Rather, use it as a base for your custom reporter.

The below features section was generated using [Playwright-feature-reporter](https://github.com/royk/playwright-feature-reporter), which is based on this library.

<!-- playwright-feature-reporter--start -->
## Markdown generation
  ### Suites (headings)
  - ✅ Suites appear as headings. Nested Suites are nested headings
  - ✅ Suites can be marked as transparent: They will not be printed but their children will be printed
  - ✅ Suites with the same name have their results merged, and the heading is shown only once
  - ✅ Suites containing only non-behavioral tests are not shown in the report
  ### TestResults (features)
  - ✅ TestResults appear as list items representing features. Each feature is visually marked as Passing ✅, Failing ❌ or Skipped 🚧
  - ✅ Only TestResults with testType 'behavior' appear as features. If testType is note specified, it's assumed to be 'behavior'
  - ✅ Features can nest under other features using a '-' prefix
    - ✅ Features can nest multiple levels deep using multiple '-' prefixes
  ### Embedding
  - ✅ The features list is embedded in an existing file between placeholders
  - ✅ The closing placeholder can be ommitted if the feature list is intended as the last content in the file
  ### Options
  - ✅ Placeholder prefix can be specified using the 'embeddingPlaceholder' option
  - ✅ A link to a full test report will be included when the 'fullReportLink' option is provided
## JSON generation
- ✅ Generates a JSON file
- 🚧 Suites can be marked as transparent: They will not be printed but their children will be printed

[Test report](playwright-report/index.html)
