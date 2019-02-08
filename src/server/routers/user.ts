import { hash } from "bcrypt";
import * as passport from "koa-passport";
import * as KoaRouter from "koa-router";
import { isNil } from "lodash";
import * as uuid from "uuid";
import { Mailer } from "~/auth";
import { getCompanyRepo, getUserRepo } from "~/database/repositories";
import { HttpError } from "~/server";
import { bodyValidator, Context, Joi, NextFunction } from "~/server/middleware";

// tslint:disable-next-line:no-var-requires no-require-imports
const RateLimit = require("koa2-ratelimit").RateLimit;

const userRouter = new KoaRouter({ prefix: "v1/user" });

userRouter.use(
  RateLimit.middleware({
    interval: { min: 10 },
    max: 10, // Max 10 requests per 10 minutes,
  }),
);

userRouter.post("/logout", async (ctx: Context, next: NextFunction) => {
  ctx.logout();

  ctx.status = 200;
  ctx.body = {
    message: "Logged out successfully.",
  };

  return next();
});

userRouter.get("/logged-in", async (ctx: Context, next: NextFunction) => {
  ctx.body = {
    auth: ctx.isAuthenticated(),
  };

  return next();
});

const logOut = async (ctx: Context, next: NextFunction) => {
  ctx.logout();

  return next();
};

userRouter.post(
  "/register",
  logOut,
  bodyValidator(
    Joi.object({
      email: Joi.string()
        .email()
        .required(),
      companyToken: Joi.string().uuid({ version: "uuidv4" }),
    }),
  ),
  async (ctx: Context, next: NextFunction) => {
    const userRepo = getUserRepo();
    const companyRepo = getCompanyRepo();
    const { email, companyToken } = ctx.request.body;
    const userExists = await userRepo.getByEmail(email);
    if (!isNil(userExists)) {
      throw new HttpError(400, "Something went wrong.");
    } else {
      const company = await (isNil(companyToken)
        ? companyRepo.save(
            companyRepo.create({
              name: "private",
            }),
          )
        : companyRepo.findOne({
            where: { uniqueToken: companyToken },
          }));
      if (!isNil(companyToken) && isNil(company)) {
        throw new HttpError(400, "Invalid company token.");
      }

      const user = userRepo.create({
        company,
        email,
        password: "reset...",
        resetToken: uuid(),
      });
      await userRepo.save(user, { reload: true });
      if (isNil(companyToken)) {
        company!.admin = user;
        company!.regenerateToken();
        await companyRepo.save(company!);
      }

      const mailer = new Mailer();
      await mailer.sendAccountActivate(user.email, user.resetToken!);

      ctx.status = 200;
      ctx.body = {
        success: true,
      };

      return next();
    }
  },
);

userRouter.post(
  "/reset",
  logOut,
  bodyValidator(
    Joi.object({
      token: Joi.string()
        .uuid({ version: "uuidv4" })
        .required(),
      password: Joi.string()
        .min(6)
        .required(),
    }),
  ),
  async (ctx: Context, next: NextFunction) => {
    const userRepo = getUserRepo();
    const { token, password } = ctx.request.body;
    const user = await userRepo.getByToken(token);
    if (!user) {
      throw new HttpError(400, "Invalid token.");
    }
    user.isActivated = true;
    user.resetToken = null;
    user.password = await hash(password, 11);

    await userRepo.save(user);

    ctx.status = 200;
    ctx.body = {
      success: true,
    };

    return next();
  },
);

userRouter.post(
  "/reset-password",
  logOut,
  bodyValidator({
    email: Joi.string()
      .email()
      .required(),
  }),
  async (ctx: Context, next: NextFunction) => {
    const { email } = ctx.request.body;
    const userRepo = getUserRepo();
    const user = await userRepo.getByEmail(email);
    if (isNil(user)) {
      throw new HttpError(400, "Something went wrong.");
    } else {
      user.resetToken = uuid();
      await userRepo.save(user);

      const mailer = new Mailer();
      await mailer.sendPasswordResetMail(user.email, user.resetToken);

      ctx.status = 200;
      ctx.body = {
        success: true,
      };

      return next();
    }
  },
);

userRouter.post("/login", logOut, async (ctx: Context, next: NextFunction) =>
  // tslint:disable-next-line
  passport.authenticate("local", (err, user) => {
    if (err) {
      ctx.logout();
      throw err;
    } else if (user === false || isNil(user)) {
      ctx.logout();
      throw new HttpError(401, "Invalid email or password.");
    } else {
      ctx.body = {
        message: "Login successful",
      };

      // tslint:disable-next-line
      return ctx.login(user).then(() => next());
    }
  })(ctx, next),
);

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  async (ctx: Context, next: NextFunction) => {
    if (!isNil(ctx.state.user) && ctx.isAuthenticated()) {
      await ctx.login(ctx.state.user);
    }

    ctx.redirect(
      `${process.env.EDITOR_URL}/auth/callback?success=${ctx.isAuthenticated()}`,
    );

    return next();
  },
);

userRouter.get(
  "/auth/google",
  logOut,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

export { userRouter };
