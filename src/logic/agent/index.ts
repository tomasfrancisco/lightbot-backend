import { In } from "typeorm";
import { Agent, Intent } from "~/database/entities";
import { getIntentTriggerRepo, getUnknownTriggerRepo } from "~/database/repositories";

export const agentAddAndRemoveUnknownTriggers = async (
  triggerIds: number[],
  agent: Agent,
  intent: Intent,
) => {
  const filteredUnknownTriggers = agent.unknownTriggers.filter(it =>
    triggerIds.includes(it.id),
  );

  const triggerRepo = getIntentTriggerRepo();
  const triggers = filteredUnknownTriggers.map(it =>
    triggerRepo.create({
      intent,
      value: [it.value],
    }),
  );
  await triggerRepo.save(triggers);
  await getUnknownTriggerRepo().delete({
    agent,
    id: In(triggerIds),
  });
};
