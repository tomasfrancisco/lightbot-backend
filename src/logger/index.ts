import { IS_PRODUCTION } from "~/utils";
import { logger, LogLevel } from "./Logger";

export function setupDefaultLogger(): void {
  logger.setLogLevel(IS_PRODUCTION ? LogLevel.INFO : LogLevel.DEBUG);
}

export { logger, LogLevel };
