import { isNil } from "lodash";
import { logger } from "~/logger";

export class HttpError extends Error {
  public static internalServerError(message: string, originalError: Error): HttpError {
    return new HttpError(500, message, originalError);
  }

  public static notFoundError(): HttpError {
    return new HttpError(404, "Not found");
  }
  public constructor(
    public code: number,
    public message: string,
    public originalError?: Error,
  ) {
    super(message);

    // In the constructor of Error it's is doing stuff with the prototype. This
    // affects `instanceof` checks.
    // super() calls the Error constructor so we have to revert the prototype change.
    // We can safely set the prototype of this instance back to HttpError
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  public logError(): void {
    logger.error("HttpError {code:", this.code, ", message:", this.message, "})");
    if (!isNil(this.originalError)) {
      logger.error(this.originalError);
    }
  }
}
