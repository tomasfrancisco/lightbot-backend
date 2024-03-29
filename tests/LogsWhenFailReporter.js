// Unresolved modules are all dependencies from Jest so they should be installed anyway

const chalk = require("chalk");
const { getConsoleOutput } = require("jest-util");

const DefaultReporter = require("jest-cli/build/reporters/default_reporter").default;
const getResultHeader = require("jest-cli/build/reporters/get_result_header").default;

const TITLE_BULLET = chalk.bold("\u25cf ");

// This Jest reporter does not output any console.log except when the tests are
// failing, see: https://github.com/mozilla/addons-frontend/issues/2980.

class LogsWhenFailReporter extends DefaultReporter {
  printTestFileHeader(testPath, config, result) {
    this.log(getResultHeader(result, this._globalConfig, config));
    const consoleBuffer = result.console;
    const testFailed = result.numFailingTests > 0;
    if (testFailed && consoleBuffer && consoleBuffer.length) {
      this.log(
        `  ${TITLE_BULLET}Console\n\n${getConsoleOutput(
          config.cwd,
          !!this._globalConfig.verbose,
          consoleBuffer,
        )}`,
      );
    }
  }
}

module.exports = LogsWhenFailReporter;
