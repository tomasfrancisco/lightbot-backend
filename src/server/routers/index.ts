import * as KoaRouter from "koa-router";
import { passthroughRouter } from "~/server/routers/passthrough";
import { userRouter } from "~/server/routers/user";
import { getEditorRoutes } from "./editor";

// Simple one step solution to bind routers.
export const bindRouter = (app: any, router: KoaRouter) => {
  app.use(router.middleware()).use(router.allowedMethods());
};

const mainRouter = new KoaRouter({ prefix: "/" });

bindRouter(mainRouter, userRouter);
bindRouter(mainRouter, getEditorRoutes());
bindRouter(mainRouter, passthroughRouter);

export { mainRouter };
