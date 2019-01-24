import fetch from "node-fetch";
import { User } from "~/database/entities";
import { getAgentRepo, getCompanyRepo } from "~/database/repositories";
import { GraphError } from "~/graph";
import { logger } from "~/logger";
import { convertToRasa } from "~/logic/rasa/converter";
import { ErrorCode } from "~/types";

export async function deployRasa(agentId: string, user: User): Promise<void> {
  const agent = await getAgentRepo().findByUserAndId(
    user,
    {uuid: agentId},
    new GraphError(ErrorCode.InvalidAgent, "Invalid agent."),
  );
  const data = await convertToRasa(agent);

  const company = await getCompanyRepo().findOne(agent.companyId);
  const projectName = `${company!.name}-${agent.name}`;
  await sendToServer(projectName, data.data);
}

export async function sendToServer(project: string, data: object): Promise<void> {
  const result = await fetch(
    `http://${process.env.RASA_URL}:5000/train?project=${project}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-yml",
      },
      body: `
language: "nl"
pipeline: "spacy_sklearn"
data: ${JSON.stringify(data, null, 2)}`,
    },
  );

  logger.log(result.ok);
  logger.log(await result.json());
  logger.log(result.headers);
  logger.log(result.status);
}
