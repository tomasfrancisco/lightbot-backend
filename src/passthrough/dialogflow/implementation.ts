import * as apiai from "apiai";
import { pick } from "lodash";
import { Agent } from "~/database/entities";
import { AgentData, BotResponse, PassthroughInterface } from "~/passthrough";
import { getAllAgentData, handleReponse } from "~/passthrough/dialogflow/utils";
import { HttpError } from "~/server";

export const implementation = {
  async triggerEvent(
    agent: Agent,
    sessionId: string,
    eventName: string,
  ): Promise<BotResponse[]> {
    const agentData = getAllAgentData(agent);

    const api = apiai(agentData.dialogFlowAccessToken!, { language: "nl" });
    const request = api.eventRequest({ name: eventName }, { sessionId });

    return new Promise((resolve, reject) => {
      request.on("error", (error: Error) => {
        reject(
          HttpError.internalServerError("Could not get dialogflow response.", error),
        );
      });

      request.on("response", message => {
        // tslint:disable-next-line:no-floating-promises
        handleReponse(agent, message, undefined).then(resolve);
      });

      request.end();
    });
  },
  async getAgentData(agent: Agent): Promise<AgentData> {
    const agentData = getAllAgentData(agent);

    return (pick(agentData, [
      "avatar",
      "name",
      "widgetHotspotIcon",
      "widgetInputPlaceholder",
      "widgetTeaser",
      "widgetThemeData",
    ]) as unknown) as AgentData;
  },
  async answerUserQuery(
    agent: Agent,
    sessionId: string,
    userId: string,
    human: string,
  ): Promise<BotResponse[]> {
    const agentData = getAllAgentData(agent);

    const api = apiai(agentData.dialogFlowAccessToken!, { language: "nl" });
    const request = api.textRequest(human, { sessionId });

    return new Promise((resolve, reject) => {
      request.on("error", (error: Error) => {
        reject(
          HttpError.internalServerError("Could not get dialogflow response.", error),
        );
      });

      request.on("response", message => {
        // tslint:disable-next-line:no-floating-promises
        handleReponse(agent, message, human).then(resolve);
      });

      request.end();
    });
  },
} as PassthroughInterface;
