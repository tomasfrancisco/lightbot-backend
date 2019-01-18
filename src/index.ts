// tslint:disable-next-line:no-var-requires no-require-imports
require("./prepareAndModifyProcess");

import { isNil } from "lodash";
import { createDatabaseConnection } from "~/database";
import { logger, setupDefaultLogger } from "~/logger";
import { getApp } from "~/server/app";
import { IS_PRODUCTION, IS_TEST } from "~/utils";

const REQUIRED_ENV_KEYS = [
  "NODE_ENV",
  "SERVER_PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASS",
];

const checkRequiredEnvKeys = () => {
  for (const key of REQUIRED_ENV_KEYS) {
    if (isNil(process.env[key])) {
      throw new Error(`Missing ${key} in environment!`);
    }
  }
};

// Should load loggers, error reporters, databases, and of course the app itself
export async function bootstrap(): Promise<void> {
  setupDefaultLogger();
  logger.log(
    `Bootstrapping app at ${new Date().toLocaleString("nl-NL")}. Running in ${
      IS_PRODUCTION ? "production" : IS_TEST ? "test" : "development"
    }.`,
  );

  checkRequiredEnvKeys();

  await createDatabaseConnection();

  const app = await getApp();
  app.listen(process.env.SERVER_PORT, () =>
    logger.log("Listening on port", process.env.SERVER_PORT),
  );
}

bootstrap().catch(e => logger.error("APP CRASH", e));
