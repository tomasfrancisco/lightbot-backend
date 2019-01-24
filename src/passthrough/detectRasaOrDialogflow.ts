import { isNil } from "lodash";
import { Agent, AgentData } from "~/database/entities";
import { DeployPlatform } from "~/passthrough/interface";
import { HttpError } from "~/server";

export function detectRasaOrDialogflow(agent: Agent): DeployPlatform {
  if (isNil(agent)) {
    throw new HttpError(401, "Invalid agent id");
  }

  const agentData = AgentData.toObject(agent.uuid, agent.data);

  return agentData.deployedOnPlatform as DeployPlatform;
}
