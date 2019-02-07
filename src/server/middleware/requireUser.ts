import { GraphError } from "~/graph";
import { HttpError } from "~/server";
import { ErrorCode } from "~/types";
import { Context, NextFunction } from "./types";

export const authorizeUser = ({
  throwIfNull,
  throwGraphError,
}: {
  throwIfNull: boolean;
  throwGraphError: boolean;
}) => async (ctx: Context, next: NextFunction) => {
  if (throwIfNull && !ctx.isAuthenticated()) {
    ctx.logout();
    if (throwGraphError) {
      throw new GraphError(ErrorCode.InvalidAuth, "Missing valid Authorization.");
    } else {
      throw new HttpError(401, "Missing valid Authorization.");
    }
  } else {
    (ctx as any).user = ctx.state.user;
  }

  return next();
};
