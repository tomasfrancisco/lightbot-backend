import { getAgentRepo, getDictionaryRepo } from "~/database/repositories";
import { intentSearchByExpression, intentSearchIntents } from "~/logic/intent";
import { Context } from "~/server/middleware";
import {
  AgentId,
  Input,
  IntentExpression,
  SearchIntent,
  SearchSingleDictionary,
  Where,
} from "~/types";

export const rootQueries = {
  me: (__: never, ___: never, context: Context) => context.user.toGraphType(),

  dictionaries: async (__: never, ___: never, context: Context) => {
    const values = await getDictionaryRepo().findWithValues(context.user.companyId);

    return values.map(it => it.toGraphType());
  },
  dictionary: async (
    __: never,
    { where: { id } }: Where<SearchSingleDictionary>,
    context: Context,
  ) => {
    const result = await getDictionaryRepo().findByIdAndUser(id, context.user, undefined);

    return result ? result.toGraphType() : undefined;
  },

  intents: async (
    __: never,
    { where }: Where<SearchIntent | undefined>,
    context: Context,
  ) => {
    const result = await intentSearchIntents(where, context.user);

    return result.map(it => it.toGraphType());
  },
  findIntentsByExpression: async (
    __: never,
    { input }: Input<IntentExpression>,
    context: Context,
  ) => {
    const result = await intentSearchByExpression(input, context.user);

    return result.map(it => it.toGraphType());
  },

  agents: async (__: never, ___: never, { user }: Context) => {
    const agents = await getAgentRepo().findForUser(user);

    return agents.map(it => it.toGraphType());
  },

  findAgent: async (__: never, { input }: Input<AgentId>, { user }: Context) => {
    const agent = await getAgentRepo().findByUserAndId(
      user,
      { uuid: input.agentId },
      undefined,
    );

    return agent ? agent.toGraphType() : undefined;
  },
};
