import * as googleStrat from "@passport-next/passport-google-oauth2";
import * as localStrat from "@passport-next/passport-local";
import { compare } from "bcrypt";
import * as passport from "koa-passport";
import { isNil } from "lodash";
import { User } from "~/database/entities";
import { getCompanyRepo, getUserRepo } from "~/database/repositories";

export const registerStrategies = (localStrategy: boolean, googleStrategy: boolean) => {
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    getUserRepo()
      .findById(id)
      .then(user => {
        if (isNil(user)) {
          done(new Error("Unknown user."));
        } else {
          done(null, user);
        }
      })
      .catch(e => {
        console.error(e);
        done(e, undefined);
      });
  });

  if (localStrategy) {
    passport.use(
      new localStrat.Strategy(
        {
          usernameField: "email",
        },
        (email: string, password: string, done: localStrat.DoneFunc) => {
          const userRepo = getUserRepo();
          userRepo
            .getByEmail(email)
            .then(async user => {
              console.log("user...", user);
              if (isNil(user)) {
                done(undefined, false);
              } else {
                if (await compare(password, user.password)) {
                  done(undefined, user);
                } else {
                  done(undefined, false);
                }
              }
            })
            .catch(err => done(err, false));
        },
      ),
    );
  }
  if (googleStrategy) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SECRET;
    const callbackURL = `${process.env.SERVER_URL}/v1/user/auth/google/callback`;

    if (isNil(clientID) || isNil(clientSecret)) {
      return;
    }
    passport.use(
      new googleStrat.Strategy(
        {
          clientID,
          clientSecret,
          callbackURL,
        },
        (access, refreshToken, profile, cb) => {
          const userRepo = getUserRepo();
          userRepo
            .getByGoogleId(profile.id)
            .then(async user => {
              if (user) {
                cb(undefined, user);
              } else {
                const company = await getCompanyRepo().getNewCompany();
                const realUser = await userRepo.createByGoogleAndCompany(
                  profile,
                  company,
                );
                cb(undefined, realUser);
              }
            })
            .catch(err => cb(err, false));
        },
      ),
    );
  }
};
