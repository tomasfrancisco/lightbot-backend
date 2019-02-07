require("dotenv").config({
  path: __dirname + "/../../../.env",
});

const mysql = require("mysql");
const fs = require("fs");

/**
 * All known migration files, in the correct order of execution.
 */
const MIGRATION_FILES = ["./001-init.sql"];

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

/**
 * Simple promisify of running queries
 */
async function query(query, args = []) {
  return new Promise((resolve, reject) => {
    pool.query(query, args, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function readAndExecuteSql(fileName) {
  if (fileName.endsWith(".sql")) {
    const fileContents = fs.readFileSync(fileName, { encoding: "utf8" });
    const lines = fileContents
      .split(";\n")
      .filter(it => it.trim().length !== 0)
      .map(it => it + ";");
    lines.push("COMMIT;");
    const p = query("START TRANSACTION;");

    await lines.reduce(
      (previousValue, currentValue) => previousValue.then(() => query(currentValue)),
      p,
    );
  } else if (fileName.endsWith(".js")) {
    const file = require(fileName);
    await file.run(query);
  } else {
    throw new Error(`Unknown file type ${fileName}`);
  }
}

async function runAllMigrations() {
  const p = Promise.resolve();

  await MIGRATION_FILES.reduce(
    (previousValue, currentValue) =>
      previousValue.then(() => readAndExecuteSql(currentValue)),
    p,
  );
}

/**
 * Runs all migration files when cli arg === "all"
 * Also runs the 001-init-data file when cli arg === "dev"
 * Else will check if specified file exists and run it.
 * @returns {Promise<void>}
 */
async function main() {
  if (!process.cwd().endsWith("migrations")) {
    throw new Error(
      "Migration should be started from src/database/migrations directory.",
    );
  }

  const file = process.argv[2];

  if (file === "all") {
    await runAllMigrations();
  } else if (file === "dev") {
    MIGRATION_FILES.splice(1, 0, "./001-init-data.sql");
    await runAllMigrations();
  } else {
    if (!fs.existsSync(file)) {
      throw new Error("File does not exist.");
    } else {
      await readAndExecuteSql(file);
    }
  }
}

main()
  .then(() => {
    pool.end(err => {
      if (err) {
        console.error(err);
      }
      console.log("Migration done.");
    });
  })
  .catch(console.error);
