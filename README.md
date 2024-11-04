
## Features
  ### Suites (headings)
  - :white_check_mark: Suites appear as headings. Nested Suites are nested headings
  - :white_check_mark: Suites can be marked as transparent: They will not be printed but their children will be printed
  - :white_check_mark: Suites with the same name have their results merged, and the heading is shown only once
  - :white_check_mark: Suites containing only non-behavioral tests are not shown in the report
  ### TestResults (features)
  - :white_check_mark: TestResults appear as list items representing features. Each feature is visually marked as Passing :white_check_mark:, Failing :x: or Skipped :construction:
  - :white_check_mark: Only TestResults with testType 'behavior' appear as features. If testType is note specified, it's assumed to be 'behavior'
  - :white_check_mark: Features can nest under other features using a '-' prefix
    - :white_check_mark: Features can nest multiple levels deep using multiple '-' prefixes
  ### Embedding
  - :white_check_mark: The features list is embedded in an existing file between placeholders
  - :white_check_mark: The closing placeholder can be ommitted if the feature list is intended as the last content in the file
  ### Options
  - :white_check_mark: A link to a full test report will be included when the 'fullReportLink' option is provided

[Test report](https://raw.githack.com/royk/x-feature-reporter/refs/heads/main/playwright-report/index.html)
