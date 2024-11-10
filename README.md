# X-Feature Reporter
Generates or updates a Markdown file with the results of a test run.
Not intended to be used directly. Rather, use it as a base for your custom reporter.

The below features section was generated using [Playwright-feature-reporter](https://github.com/royk/playwright-feature-reporter), which is based on this library.

<!-- playwright-feature-reporter--start -->
## Markdown generation
  ### Suites (headings)
  - :white_check_mark: Suites appear as headings. Nested Suites are nested headings
  - :white_check_mark: Suites can be marked as transparent: They will not be printed but their children will be printed
  - :white_check_mark: Suites with the same name have their results merged, and the heading is shown only once
  - :white_check_mark: Suites containing only non-behavioral tests are not shown in the report
  ### TestResults (features)
  - :white_check_mark: TestResults appear as list items representing features. Each feature is visually marked as Passing ✅, Failing ❌ or Skipped 🚧
  - :white_check_mark: Only TestResults with testType 'behavior' appear as features. If testType is note specified, it's assumed to be 'behavior'
  - :white_check_mark: Features can nest under other features using a '-' prefix
    - :white_check_mark: Features can nest multiple levels deep using multiple '-' prefixes
  ### Embedding
  - :white_check_mark: The features list is embedded in an existing file between placeholders
  - :white_check_mark: The closing placeholder can be ommitted if the feature list is intended as the last content in the file
  ### Options
  - :white_check_mark: Placeholder prefix can be specified using the 'embeddingPlaceholder' option
  - :white_check_mark: A link to a full test report will be included when the 'fullReportLink' option is provided
## JSON generation
- :white_check_mark: Generates a JSON file
- :construction: Suites can be marked as transparent: They will not be printed but their children will be printed

[Test report](https://raw.githack.com/royk/x-feature-reporter/refs/heads/main/playwright-report/index.html)
