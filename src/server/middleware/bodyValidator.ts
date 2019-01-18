import * as Joi from "joi";
import { get } from "lodash";
import { HttpError } from "~/server";
import { Context, NextFunction } from "~/server/middleware/types";

export const bodyValidator = (schema: Joi.SchemaLike) => async (
  ctx: Context,
  next: NextFunction,
) => {
  const rawData: object = { ...ctx.request.body, ...ctx.request.query };

  const { error } = Joi.validate(rawData, schema, {
    abortEarly: true,
    allowUnknown: true,
  });
  if (error) {
    throw new HttpError(400, get(error, "details[0].message", "ValidationError"), error);
  }

  return next();
};

export { Joi };
