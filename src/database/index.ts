import { createConnection } from "typeorm";
import { logger } from "~/logger";

export const createDatabaseConnection = async () => {
  logger.log("Creating database connection.");
  const cfgModule = await import("./ormconfig");

  return createConnection(cfgModule.config);
};
