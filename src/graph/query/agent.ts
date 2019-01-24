import { isNil } from "lodash";
import { AgentData } from "~/database/entities";
import { getAgentDataRepo } from "~/database/repositories";
import { deployDialogflow } from "~/logic/dialogflow/deploy";
import { deployRasa } from "~/logic/rasa/deploy";
import { DeployPlatform } from "~/passthrough";
import { Context } from "~/server/middleware";
import { Agent } from "~/types";

export const agentQueries = {
  deploy: async (agent: Agent, __: never, { user }: Context) => {
    const agentDataRepo = getAgentDataRepo();
    const rawAgentData = await agentDataRepo.findForAgent({ uuid: agent.id });
    const agentData = AgentData.toObject(agent.id, rawAgentData);

    if (agentData.deployedOnPlatform === DeployPlatform.Rasa) {
      await deployRasa(agent.id, user);
    } else if (agentData.deployedOnPlatform === DeployPlatform.Dialogflow) {
      await deployDialogflow(agent.id, user);
    } else if (isNil(agentData.deployedOnPlatform) && !isNil(agentData.gcpData)) {
      await agentDataRepo.save(
        agentDataRepo.create({
          agent: {
            uuid: agent.id,
          },
          key: "deployedOnPlatform",
          data: "DIALOGFLOW",
        }),
      );
      await deployDialogflow(agent.id, user);
    } else {
      await agentDataRepo.save(
        agentDataRepo.create({
          agent: {
            uuid: agent.id,
          },
          key: "deployedOnPlatform",
          data: "RASA",
        }),
      );
      await deployRasa(agent.id, user);
    }

    return agent;
  },
};
