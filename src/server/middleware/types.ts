import * as Koa from "koa";
import { IRouterContext } from "koa-router";
import { User } from "~/database/entities";

export type NextFunction = () => Promise<any | void>;

export type Context = Koa.ParameterizedContext<{}, IRouterContext & { user: User }>;
