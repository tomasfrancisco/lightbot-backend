import { GraphError } from "~/graph";
import { HttpError } from "~/server";
import { IS_PRODUCTION } from "~/utils";
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

    if (e instanceof GraphError) {
      e.logError();

      context.status = 200;
      context.body = {
        errors: [
          {
            message: e.message,
            code: e.code,
            stack: IS_PRODUCTION ? undefined : e.stack,
            extensions: {
              code: e.code,
            },
          },
        ],
      };
    } else {
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
  }
};
