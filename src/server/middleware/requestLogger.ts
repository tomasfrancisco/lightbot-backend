import { get, isNil } from "lodash";
import { logger } from "~/logger";
import { Context, NextFunction } from "./types";

/**
 * Middleware for logging request and response info.
 * Is the most usefull as first item on the stack.
 * This method should never throw.
 */
export const requestLogger = async (context: Context, next: NextFunction) => {
  const start = Date.now();
  await next();
  let responseLength = get(context, "response.length");
  if (isNil(responseLength) && !isNil(context.body)) {
    if (!isNil(get(context.body, "_writableState.length", null))) {
      responseLength = context.body._writableState.length;
    }
  }

  if (isNil(responseLength)) {
    logger.log(
      `${context.method} ${context.url} ${context.ip} ${context.status} ${Date.now() -
        start} ms`,
    );
  } else {
    logger.log(
      `${context.method} ${context.url} ${context.ip} ${context.status} ${Date.now() -
        start} ms. ${responseLength / 1000} KB`,
    );
  }
};
