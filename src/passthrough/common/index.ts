import { Agent } from "~/database/entities";
import { getUnknownTriggerRepo } from "~/database/repositories";

export async function saveFallbackMessage(agent: Agent, message: string): Promise<void> {
  const repo = getUnknownTriggerRepo();
  await repo.save(repo.create({ value: message, agent }));
}
