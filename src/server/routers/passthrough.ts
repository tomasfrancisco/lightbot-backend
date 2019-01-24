import * as KoaRouter from "koa-router";
import { getAgentRepo } from "~/database/repositories";
import {
  DeployPlatform,
  detectRasaOrDialogflow,
  dialogflowImplementation,
  rasaImplementation,
} from "~/passthrough";
import { HttpError } from "~/server";
import { Context, Joi, NextFunction, bodyValidator } from "~/server/middleware";

const passthroughRouter = new KoaRouter({ prefix: "v1/passthrough" });

const baseInfoValidation = Joi.object({
  lightbot_agent_id: Joi.string().required(),
  session_id: Joi.string().required(),
});

passthroughRouter.get(
  "/agent-data",
  bodyValidator(
    Joi.object({
      lightbot_agent_id: Joi.string().required(),
    }),
  ),
  async (ctx: Context, next: NextFunction) => {
    const agent = await getAgentRepo().findOneById(
      { uuid: ctx.query.lightbot_agent_id },
      new HttpError(400, "Unknown agent."),
    );
    const platform = detectRasaOrDialogflow(agent);

    let result: any;
    if (platform === DeployPlatform.Rasa) {
      result = await rasaImplementation.getAgentData(agent);
    } else if (platform === DeployPlatform.Dialogflow) {
      result = await dialogflowImplementation.getAgentData(agent);
    } else {
      throw new HttpError(400, "Invalid agent.");
    }

    ctx.status = 200;
    ctx.body = result;

    return next();
  },
);

passthroughRouter.post(
  "/start",
  bodyValidator(baseInfoValidation),
  async (ctx: Context, next: NextFunction) => {
    const agent = await getAgentRepo().findOneById(
      { uuid: ctx.request.body.lightbot_agent_id },
      new HttpError(400, "Unknown agent."),
    );
    const platform = detectRasaOrDialogflow(agent);
    console.log(platform);
    let result: any;
    if (platform === DeployPlatform.Rasa) {
      result = await rasaImplementation.triggerEvent(
        agent,
        ctx.request.body.session_id,
        "LIGHTBOT_WELCOME",
      );
    } else if (platform === DeployPlatform.Dialogflow) {
      result = await dialogflowImplementation.triggerEvent(
        agent,
        ctx.request.body.session_id,
        "LIGHTBOT_WELCOME",
      );
    } else {
      throw new HttpError(400, "Invalid agent.");
    }

    ctx.status = 200;
    ctx.body = { bot: result };

    return next();
  },
);

passthroughRouter.post(
  "/",
  bodyValidator(
    baseInfoValidation.keys({
      human: Joi.string().required(),
      user_id: Joi.string().required(),
    }),
  ),
  async (ctx: Context, next: NextFunction) => {
    const agent = await getAgentRepo().findOneById(
      { uuid: ctx.request.body.lightbot_agent_id },
      new HttpError(400, "Unknown agent."),
    );
    const platform = detectRasaOrDialogflow(agent);

    let result: any;
    if (platform === DeployPlatform.Rasa) {
      result = await rasaImplementation.answerUserQuery(
        agent,
        ctx.request.body.session_id,
        ctx.request.body.user_id,
        ctx.request.body.human,
      );
    } else if (platform === DeployPlatform.Dialogflow) {
      result = await dialogflowImplementation.answerUserQuery(
        agent,
        ctx.request.body.session_id,
        ctx.request.body.user_id,
        ctx.request.body.human,
      );
    } else {
      throw new HttpError(400, "Invalid agent.");
    }

    ctx.status = 200;
    ctx.body = { bot: result };

    return next();
  },
);

passthroughRouter.post(
  "/jump",
  bodyValidator(
    baseInfoValidation.keys({
      user_id: Joi.string().required(),
      event: Joi.string().required(),
    }),
  ),
  async (ctx: Context, next: NextFunction) => {
    const agent = await getAgentRepo().findOneById(
      { uuid: ctx.request.body.lightbot_agent_id },
      new HttpError(400, "Unknown agent."),
    );
    const platform = detectRasaOrDialogflow(agent);

    let result: any;
    if (platform === DeployPlatform.Rasa) {
      result = await rasaImplementation.triggerEvent(
        agent,
        ctx.request.body.session_id,
        ctx.request.body.event,
      );
    } else if (platform === DeployPlatform.Dialogflow) {
      result = await dialogflowImplementation.triggerEvent(
        agent,
        ctx.request.body.session_id,
        ctx.request.body.event,
      );
    } else {
      throw new HttpError(400, "Invalid agent.");
    }

    ctx.status = 200;
    ctx.body = { bot: result };

    return next();
  },
);

export { passthroughRouter };
