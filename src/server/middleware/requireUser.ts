import { get, isEmpty, isNil } from "lodash";
import { getLoginTokenRepo } from "~/database/repositories";
import { GraphError } from "~/graph";
import { logger } from "~/logger";
import { HttpError } from "~/server";
import { ErrorCode } from "~/types";
import { Context, NextFunction } from "./types";

const getAuthKey = (context: Context) => {
  const key = get(context, "headers.authorization", null);
  if (isNil(key)) {
    return null;
  }

  return key
    .replace("Bearer", "")
    .replace("Basic", "")
    .trim();
};

export const authorizeUser = ({
  throwIfNull,
  throwGraphError,
}: {
  throwIfNull: boolean;
  throwGraphError: boolean;
}) => async (context: Context, next: NextFunction) => {
  const headerValue = getAuthKey(context);
  if (isNil(headerValue) || isEmpty(headerValue)) {
    if (throwIfNull) {
      if (throwGraphError) {
        throw new GraphError(ErrorCode.InvalidAuth, "Missing valid authorization.");
      } else {
        throw new HttpError(401, "Missing valid Authorization header.");
      }
    }

    return next();
  }

  logger.log("Finding user with token:", headerValue);

  const tokenRepo = getLoginTokenRepo();
  const user = await tokenRepo.findUserOrNull(headerValue);

  if (isNil(user)) {
    if (throwIfNull) {
      if (throwGraphError) {
        throw new GraphError(
          ErrorCode.InvalidAuth,
          "Missing valid Authorization header.",
        );
      } else {
        throw new HttpError(401, "Missing valid Authorization header.");
      }
    }

    return next();
  }
  logger.log(`Found user with id: ${user.id}`);
  (context as any).user = user;

  return next();
};
