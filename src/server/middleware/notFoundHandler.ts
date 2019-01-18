import { HttpError } from "~/server";
import { Context, NextFunction } from "./types";

/**
 * Middleware almost at the top of the stack to switch to a 404 if no other status
 * is set.
 * Depends on a error handler to deal with status and message.
 */
export const notFoundHandler = async (context: Context, next: NextFunction) => {
  await next();
  context.status = context.status || 404;
  if (context.status === 404) {
    throw HttpError.notFoundError();
  }
};
