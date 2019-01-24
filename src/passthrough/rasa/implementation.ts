import { isNil, pick } from "lodash";
import { Agent, AgentData as AgentDataEntity, Intent } from "~/database/entities";
import { getCompanyRepo, getIntentRepo } from "~/database/repositories";
import { AgentData, BotResponse, PassthroughInterface } from "~/passthrough";
import { cache } from "~/passthrough/rasa/ChatCache";
import { doUserQuery, transformOutputs } from "~/passthrough/rasa/utils";
import { HttpError } from "~/server";

export const implementation = {
  async triggerEvent(
    agent: Agent,
    sessionId: string,
    eventName: string,
  ): Promise<BotResponse[]> {
    let intent: Intent | undefined;

    if (eventName.startsWith("rasa___")) {
      const intentId = parseInt(eventName.substr(7), 10);
      intent = await getIntentRepo().findOne({
        where: {
          id: intentId,
          agent,
        },
      });
    } else {
      const possibleIntents = await getIntentRepo().findWithEvent(agent, eventName);

      if (possibleIntents.length !== 1) {
        throw new HttpError(400, `Impossible to fire event with name ${eventName}`);
      }
      intent = possibleIntents[0];
    }

    if (isNil(intent)) {
      throw new HttpError(400, "Can't find an intent to trigger.");
    }

    cache.addIntentToUser(sessionId, intent.id);

    return transformOutputs(intent.outputs);
  },
  async answerUserQuery(
    agent: Agent,
    sessionId: string,
    userId: string,
    human: string,
  ): Promise<BotResponse[]> {
    const company = await getCompanyRepo().findOne(agent.companyId);

    return doUserQuery(company!, agent, sessionId, human);
  },
  async getAgentData(agent: Agent): Promise<AgentData> {
    return (pick(AgentDataEntity.toObject(agent.uuid, agent.data), [
      "avatar",
      "name",
      "widgetHotspotIcon",
      "widgetInputPlaceholder",
      "widgetTeaser",
      "widgetThemeData",
    ]) as unknown) as AgentData;
  },
} as PassthroughInterface;
