import * as Koa from "koa";
import * as koaBody from "koa-body";
import * as compress from "koa-compress";
import * as helmet from "koa-helmet";
import * as cors from "koa2-cors";
import { errorHandler, notFoundHandler, requestLogger } from "~/server/middleware";
import { bindRouter, mainRouter } from "~/server/routers";

const app = new Koa<{}>();

// App level hooks for logging, error handling and unknown route handling
app.use(requestLogger);
app.use(errorHandler);
app.use(notFoundHandler);

app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin: "*",
  }),
);

app.use(
  koaBody({
    jsonLimit: 5 * 1000 * 1000, // 5mb
  }),
);

app.use(compress());

// Async by design, so some routers can be asynchronous constructed and added to the app.
export const getApp = async () => {
  bindRouter(app, mainRouter);

  return app;
};
