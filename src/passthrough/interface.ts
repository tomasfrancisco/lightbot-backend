import { Agent } from "~/database/entities";

export enum DeployPlatform {
  Rasa = "RASA",
  Dialogflow = "DIALOGFLOW",
}

export interface AgentData {
  name: string;
  avatar: string;
  widgetInputPlaceholder: string;
  widgetThemeData: string;
  widgetTeaser: string;
  widgetHotspotIcon: string;
}

export interface BotResponse {
  type: "plain" | "link" | "jump";
  label?: string;
  link?: string;
  jumps?: { label: string; event: string }[];
}

export interface PassthroughInterface {
  getAgentData(agent: Agent): Promise<AgentData>;

  triggerEvent(
    agent: Agent,
    sessionId: string,
    eventName: string,
  ): Promise<BotResponse[]>;

  answerUserQuery(
    agent: Agent,
    sessionId: string,
    userId: string,
    human: string,
  ): Promise<BotResponse[]>;
}
