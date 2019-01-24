import { User } from "~/database/entities";
import { getAgentRepo } from "~/database/repositories";
import { GraphError } from "~/graph";
import { logger } from "~/logger";
import { convertToDialogflow } from "~/logic/dialogflow/converter";
import { ErrorCode } from "~/types";

// tslint:disable-next-line:no-require-imports no-var-requires
const lightbotCLI = require("./old");

export async function deployDialogflow(agentId: string, user: User): Promise<void> {
  const agent = await getAgentRepo().findByUserAndId(
    user,
    {uuid: agentId},
    new GraphError(ErrorCode.InvalidAgent, "Invalid agent."),
  );
  logger.log(`Converting data from ${agent.name} to dialogflow.`);
  const data = await convertToDialogflow(agent);
  logger.log(`Deploying ${agent.name} to dialogflow.`);

  try {
    await lightbotCLI.runFromData(data, "/tmp/output/");
  } catch (e) {
    console.error(e);
    throw new GraphError(ErrorCode.DeployAgent, "Could not deploy agent.", e);
  }
}
