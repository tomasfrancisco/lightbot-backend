import { HttpError } from "~/server";
import { Context, NextFunction } from "./types";

/**
 * Catches and logs every error in the server layer.
 * Returns HttpError#status or 500 if it is not a HttpError
 */
export const errorHandler = async (context: Context, next: NextFunction) => {
  try {
    await next();
  } catch (e) {
    let err = e;
    if (!(e instanceof HttpError)) {
      err = new HttpError(500, "Error not caught.", e);
    }

    err.logError();
    if (err.code === 500) {
      err.message = "Internal server error.";
    }
    context.status = err.code;
    context.body = {
      message: err.message,
    };
  }
};
