import { isNil } from "lodash";
import { logger } from "~/logger";
import { ErrorCode } from "~/types";

export class GraphError extends Error {
  public constructor(
    public code: ErrorCode,
    public message: string,
    public originalError?: Error,
  ) {
    super(message);

    // In the constructor of Error it's is doing stuff with the prototype. This
    // affects `instanceof` checks.
    // super() calls the Error constructor so we have to revert the prototype change.
    // We can safely set the prototype of this instance back to GraphError
    Object.setPrototypeOf(this, GraphError.prototype);
  }

  public logError(): void {
    logger.error("GraphError {code:", this.code, ", message:", this.message, "})");
    if (!isNil(this.originalError)) {
      logger.error(this.originalError);
    }
  }
}
