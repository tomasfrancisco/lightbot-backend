import * as Koa from "koa";
import * as koaBody from "koa-body";
import * as compress from "koa-compress";
import * as helmet from "koa-helmet";
import * as koaSession from "koa-session";
import * as cors from "koa2-cors";
import { isEmpty } from "lodash";
import * as uuid from "uuid";
import { registerStrategies } from "~/auth";
import { errorHandler, notFoundHandler, requestLogger } from "~/server/middleware";
import { bindRouter, mainRouter } from "~/server/routers";

const app = new Koa<{}>();

app.proxy = true;

// App level hooks for logging, error handling and unknown route handling
app.use(requestLogger);
app.use(errorHandler);
app.use(notFoundHandler);

app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin: ctx => ctx.request.get("origin"),
  }),
);

app.use(
  koaBody({
    jsonLimit: 5 * 1000 * 1000, // 5mb
  }),
);

// Session
// Random key per startup. This forces a relogin for everyone, which should be fine for now.
app.keys = [uuid()];
app.use(
  koaSession(
    {
      key: "lightbot:sess",
      maxAge: 5 * 24 * 3600 * 1000, // 2 weeks or when the app is
      // redeployed
      renew: true, // Automatically renew when needed
    },
    app as any,
  ),
);

registerStrategies(
  true,
  !isEmpty(process.env.GOOGLE_CLIENT_ID) && !isEmpty(process.env.GOOGLE_SECRET),
);

// Not sure if the local imports fixes anything but should be good for now.
// tslint:disable-next-line:no-var-requires no-require-imports
const passport = require("koa-passport");
app.use(passport.initialize());
app.use(passport.session());

app.use(compress());

// Async by design, so some routers can be asynchronous constructed and added to the app.
export const getApp = async () => {
  bindRouter(app, mainRouter);

  return app;
};
