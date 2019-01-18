// tslint:disable no-var-requires no-require-imports

/**
 * This file contains process related modifications
 * This is not interesting to run as standalone.
 */

const { config } = require("dotenv");
const { join } = require("path");

/**
 * Modify the require mechanism to support the weird thing that tsconfig#paths leaves
 * behind.
 */
function registerTsconfigPaths(): void {
  const baseUrl = process.cwd().includes("build") ? "./" : "./build";

  require("tsconfig-paths").register({
    paths: {
      "~/*": ["*"],
    },
    baseUrl,
  });
}

/**
 * Modify process listener count, add general event listeners
 */
function setProcessListeners(): void {
  process.setMaxListeners(0);
  process.on("unhandledRejection", (reason, promise) => console.error(reason, promise));
  process.on("exit", code =>
    console.log(`Exiting at ${new Date().toLocaleString("nl-NL")} with code: ${code}.`),
  );
}

/**
 * Append `.env` contents to process#env
 */
function loadDotEnv(): void {
  config({
    path: join(__dirname, "/../.env"),
  });
}

// Just error when running as `node prepareAndModifyProcess.js`
if (require.main === module) {
  console.error(
    __filename,
    "can't be started directly but should be required as the" +
      " first statement in a file.",
  );
  process.exit(1);
}

// Call all functions
registerTsconfigPaths();
setProcessListeners();
loadDotEnv();
