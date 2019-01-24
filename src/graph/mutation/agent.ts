import { isNil } from "lodash";
import { In } from "typeorm";
import {
  getAgentDataRepo,
  getAgentRepo,
  getIntentRepo,
  getUnknownTriggerRepo,
} from "~/database/repositories";
import { GraphError } from "~/graph";

import { agentAddAndRemoveUnknownTriggers, intentThrowIfNameExists } from "~/logic";
import { Context } from "~/server/middleware";
import {
  CreateIntentWithUnknownTriggers,
  DeleteUnknownTriggers,
  ErrorCode,
  Input,
  MoveUnknownTriggersToIntentDataInput,
  UpdateWidgetData,
} from "~/types";

export const agentMutations = {
  updateWidgetData: async (
    __: never,
    { input }: Input<UpdateWidgetData>,
    { user }: Context,
  ) => {
    const agent = await getAgentRepo().findByUserAndId(
      user,
      { uuid: input.agentId },
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );
    const dataRepo = getAgentDataRepo();
    const existingData = await dataRepo.findForAgent(agent);

    const updateSingleProp = async (propName: keyof UpdateWidgetData) => {
      if (!isNil(input[propName])) {
        const existing =
          existingData.find(it => it.key === propName) ||
          dataRepo.create({
            agent,
            key: propName,
          });
        existing.data = input[propName] as any;
        await dataRepo.save(existing);
      }
    };

    await updateSingleProp("widgetHotspotIcon");
    await updateSingleProp("widgetInputPlaceholder");
    await updateSingleProp("widgetTeaser");
    await updateSingleProp("widgetThemeData");
  },

  moveUnknownTriggersToIntent: async (
    __: never,
    { input }: Input<MoveUnknownTriggersToIntentDataInput>,
    { user }: Context,
  ) => {
    const agent = await getAgentRepo().findByUserAndId(
      user,
      { uuid: input.agentId },
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );
    const intent = await getIntentRepo().findOneByUserAndId(
      user,
      input.intentId,
      new GraphError(ErrorCode.InvalidIntent, "Intent not found."),
    );

    await agentAddAndRemoveUnknownTriggers(input.unknownTriggerIds, agent, intent);

    return (await getIntentRepo().findOneById(intent.id, undefined))!.toGraphType();
  },
  createIntentWithUnknownTriggers: async (
    __: never,
    { input }: Input<CreateIntentWithUnknownTriggers>,
    { user }: Context,
  ) => {
    const agent = await getAgentRepo().findByUserAndId(
      user,
      { uuid: input.agentId },
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );

    await intentThrowIfNameExists(input.intentName, user);
    const intentRepo = getIntentRepo();

    const intent = await intentRepo.save(
      intentRepo.create({
        agent,
        name: input.intentName,
      }),
      { reload: true },
    );

    await agentAddAndRemoveUnknownTriggers(input.unknownTriggers, agent, intent);

    return (await intentRepo.findOneById(intent.id, undefined))!.toGraphType();
  },

  deleteUnknownTriggers: async (
    __: never,
    { input }: Input<DeleteUnknownTriggers>,
    { user }: Context,
  ) => {
    const agent = await getAgentRepo().findByUserAndId(
      user,
      { uuid: input.agentId },
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );
    await getUnknownTriggerRepo().delete({
      agent,
      id: In(input.unknownTriggerIds),
    });
  },
};
