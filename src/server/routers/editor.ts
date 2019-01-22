import { readFileSync } from "fs";
import { makeExecutableSchema } from "graphql-tools";
import { Request, Response } from "koa";
// @ts-ignore
import * as graphqlHTTP from "koa-graphql";
import * as KoaRouter from "koa-router";
import { isNil, merge } from "lodash";
import { join } from "path";
import { mutations, queries } from "~/graph";
import { logger } from "~/logger";
import { Context } from "~/server/middleware";
import { authorizeUser } from "~/server/middleware/requireUser";
import { IS_PRODUCTION } from "~/utils";

const typeDefs = readFileSync(join(__dirname, "../../@lightbot/schema.graphql"), "utf8");

export const getSchema = () => {
  const resolvers = merge({}, queries, mutations);

  return makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as any,
  });
};

export const getEditorRoutes = () => {
  const router = new KoaRouter({ prefix: "editor" });

  router.use(authorizeUser({ throwIfNull: IS_PRODUCTION, throwGraphError: true }));

  router.all(
    "/",
    graphqlHTTP(async (request: Request, response: Response, context: Context) => ({
      schema: getSchema(),
      graphiql: true,
      formatError: (error: any) => {
        // On production no error message should leak through
        // For development we give all raw data for now.
        // We could setup a staging environment that does something in between.
        // For production it would be handy if we could synchronize errors
        logger.error({
          type: error.type || "INTERNAL_ERROR",
          message: error.message,
          locations: error.locations,
          stack: error.stack ? error.stack.split("\n") : [],
          path: error.path,
        });

        const code = error.type || error.code || "INTERNAL_ERROR";

        if (IS_PRODUCTION) {
          return {
            code,
          };
        } else {
          return {
            ...error,
            code,
            extensions: {
              code,
            },
          };
        }
      },
      context,
      // extensions
      // validationRules
      // fieldResolver
    })),
  );

  return router;
};
