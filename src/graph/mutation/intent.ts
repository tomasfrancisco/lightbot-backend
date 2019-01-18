import { isNil } from "lodash";
import { getAgentRepo, getIntentRepo } from "~/database/repositories";
import { CreateIntent, DeleteIntent, GraphError, Input, UpdateIntent } from "~/graph";
import {
  intentCheckAndSaveTriggers,
  intentCheckReferencedIds,
  intentRemoveIntent,
  intentThrowIfNameExists,
  intentUpdateTriggers,
  intentValidateOutputs,
} from "~/logic";
import { Context } from "~/server/middleware";
import { ErrorCode } from "~/types";

export const intentMutations = {
  createIntent: async (__: never, { input }: Input<CreateIntent>, { user }: Context) => {
    const intentRepo = getIntentRepo();

    const agent = await getAgentRepo().findByUserAndId(
      user,
      input.agentId,
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );
    const parent = !isNil(input.parentId)
      ? await intentRepo.findByIdAndAgent(input.parentId, agent, undefined)
      : undefined;

    // Check for duplicate intent names
    await intentThrowIfNameExists(input.name, user);
    const outputsResult = intentValidateOutputs(input.outputs);
    await intentCheckReferencedIds(agent, outputsResult.referenced);

    const intent = intentRepo.create({
      agent,
      name: input.name,
      events: [],
      action: undefined,
      parent,
      outputs: outputsResult.outputs,
    });

    await intentRepo.save(intent, { reload: true });
    await intentCheckAndSaveTriggers(intent, input.triggers);

    return (await intentRepo.findOneById(intent.id, undefined))!.toGraphType();
  },

  updateIntent: async (__: never, { input }: Input<UpdateIntent>, { user }: Context) => {
    const intentRepo = getIntentRepo();
    const intent = await getIntentRepo().findOneByUserAndId(
      user,
      input.id,
      new GraphError(ErrorCode.InvalidIntent, "Intent not found."),
    );
    const agent = await getAgentRepo().findByUserAndId(
      user,
      intent.agentId,
      new GraphError(ErrorCode.InvalidAgent, "Agent not found."),
    );

    if (!isNil(input.name)) {
      await intentThrowIfNameExists(input.name, user);
      intent.name = input.name;
    }

    if (!isNil(input.isTopLevel)) {
      if (!!input.isTopLevel) {
        intent.parent = null;
      } else {
        if (!isNil(input.parentId)) {
          await getIntentRepo().findOneByUserAndId(
            user,
            input.parentId,
            new GraphError(ErrorCode.InvalidIntent, "Intent parent not found."),
          );

          intent.parent = intentRepo.create({ id: input.parentId });
        } else {
          throw new GraphError(ErrorCode.InvalidParent, "Invalid parentID");
        }
      }
    }

    if (!isNil(input.outputs)) {
      const outputsResult = intentValidateOutputs(input.outputs);
      intent.outputs = outputsResult.outputs;
      await intentCheckReferencedIds(agent, outputsResult.referenced);
    }

    await intentRepo.save(intent);

    if (!isNil(input.triggers)) {
      await intentUpdateTriggers(intent, input.triggers);
    }

    const result = await intentRepo.findOneById(intent.id, undefined);

    return result ? result.toGraphType() : undefined;
  },

  deleteIntent: async (__: never, { input }: Input<DeleteIntent>, { user }: Context) => {
    const intent = await getIntentRepo().findOneByUserAndId(
      user,
      input.id,
      new GraphError(ErrorCode.InvalidIntent, "Intent not found."),
    );

    await intentRemoveIntent(intent, input.withChildren);
  },
};
