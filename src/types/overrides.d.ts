declare module "@passport-next/passport-local" {
  // tslint:disable-next-line:no-implicit-dependencies no-duplicate-imports
  import * as passport from "passport";

  export type DoneFunc = (err: Error | undefined, ok: any) => void;

  export interface PassportLocal {
    [s: any]: any;
  }

  export class Strategy implements passport.Strategy {
    public constructor(
      opts: { usernameField?: string; passwordField?: string },
      callback: (username: string, password: string, done: DoneFunc) => void,
    );

    public authenticate(
      this: passport.StrategyCreated<this>,
      req: express.Request,
      options?: any,
    ): any;
  }
}

declare module "@passport-next/passport-google-oauth2" {
  // tslint:disable-next-line:no-implicit-dependencies no-duplicate-imports
  import * as passport from "passport";

  export type DoneFunc = (err: Error | undefined, ok: any) => void;

  export interface PassportLocal {
    [s: any]: any;
  }

  export class Strategy implements passport.Strategy {
    public constructor(
      opts: { clientID: string; clientSecret: string; callbackURL: string },
      callback: (
        access: string,
        refreshToken: string,
        profile: { id: string },
        cb: DoneFunc,
      ) => void,
    );

    public authenticate(
      this: passport.StrategyCreated<this>,
      req: express.Request,
      options?: any,
    ): any;
  }
}
