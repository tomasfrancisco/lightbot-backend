import { get, isEmpty, isNil } from "lodash";
import { Agent, AgentData } from "~/database/entities";
import { logger } from "~/logger";
import { BotResponse } from "~/passthrough";
import { saveFallbackMessage } from "~/passthrough/common";

export const getAllAgentData = (agent: Agent) =>
  AgentData.toObject(agent.uuid, agent.data);

export const handleReponse = async (
  agent: Agent,
  response: any,
  message: string | undefined,
) => {
  const data = get(response, "result.fulfillment", {});

  if (
    !isNil(message) &&
    get(message, "result.metadata.isFallbackIntent", "false") !== "true"
  ) {
    await saveFallbackMessage(agent, message);
  }

  return transformResponse(data);
};

export function transformResponse(message: any): BotResponse[] {
  const result: any[] = [];

  const handleLightbot = (item: any) => {
    result.push(item);
  };

  const handleDialogflow = (item: any) => {
    if (item.type === 0 && !isEmpty(item.speech.trim())) {
      result.push({
        type: "plain",
        label: item.speech,
      });
    } else if (item.type === 4 && !isNil(get(item, "payload.lightbot.response"))) {
      item.payload.lightbot.response.forEach(handleLightbot);
    }
  };

  if (!isEmpty(message.messages)) {
    message.messages.forEach(handleDialogflow);
  }
  if (
    !isNil(get(message, "data.lightbot.response")) &&
    !isEmpty(message.data.lightbot.response)
  ) {
    message.data.lightbot.response.forEach(handleLightbot);
  }

  logger.log(`Transformed from Dialogflow: ${JSON.stringify(result)}`);

  return result;
}
