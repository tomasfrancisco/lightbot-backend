import { isNil, isPlainObject, isString } from "lodash";
import { Agent, Intent, User } from "~/database/entities";
import { getIntentRepo, getIntentTriggerRepo } from "~/database/repositories";
import {
  ActionType,
  CreateIntentTriggerDataInput,
  GraphError,
  IntentExpression,
  IntentTriggerDataInput,
  SearchIntent,
} from "~/graph";
import { ErrorCode, IntentTriggerType } from "~/types";

export const intentSearchIntents = async (
  searchData: SearchIntent | undefined,
  user: User,
) => {
  if (isNil(searchData)) {
    return getIntentRepo().findByUser(user);
  } else {
    return getIntentRepo().search(user, searchData);
  }
};

export const intentSearchByExpression = async (search: IntentExpression, user: User) => {
  search.intentExpression =
    search.intentExpression && search.intentExpression.trim().length > 0
      ? `%${search.intentExpression}%`
      : null;

  return getIntentRepo().searchExpression(user, search);
};

export const intentThrowIfNameExists = async (name: string, user: User) => {
  const result = await getIntentRepo().findOne({
    where: {
      name,
      agent: {
        company: {
          id: user.companyId,
        },
      },
    },
  });

  if (!isNil(result)) {
    throw new GraphError(ErrorCode.InvalidIntent, "Name exists");
  }
};

export const intentValidateOutputs = (output: any[]) => {
  const collectedJumpIntents: string[] = [];
  const result = output.map(it => {
    if (!isPlainObject(it)) {
      throw new GraphError(ErrorCode.InvalidIntent, "Intent#output should be an object");
    }
    if (isNil(it.type)) {
      throw new GraphError(ErrorCode.InvalidIntent, "Intent#output expecting type");
    }
    switch (it.type) {
      case "PLAIN":
        if (isNil(it.value) || !isString(it.value.label)) {
          throw new GraphError(ErrorCode.InvalidIntent, "Invalid PLAIN output");
        }

        return {
          type: "PLAIN",
          value: {
            label: it.value.label,
          },
        };
      case "LINK":
        if (isNil(it.value) || !isString(it.value.label) || !isString(it.value.link)) {
          throw new GraphError(ErrorCode.InvalidIntent, "Invalid LINK output");
        }

        return {
          type: "LINK",
          value: {
            label: it.value.label,
            link: it.value.link,
          },
        };
      case "JUMPS":
        if (isNil(it.jumps) || !Array.isArray(it.jumps)) {
          throw new GraphError(ErrorCode.InvalidIntent, "Invalid JUMPS output");
        }

        return {
          type: "JUMPS",
          jumps: it.jumps.map((jmp: any) => {
            if (!isPlainObject(jmp) || !isString(jmp.intentId) || !isString(jmp.label)) {
              throw new GraphError(ErrorCode.InvalidIntent, "Invalid JUMPS output");
            }
            collectedJumpIntents.push(jmp.intentId);

            return {
              intentId: jmp.intentId,
              label: jmp.label,
            };
          }),
        };
      default:
        throw new GraphError(ErrorCode.InvalidIntent, "Invalid Intent#outputs");
    }
  });

  return {
    referenced: collectedJumpIntents,
    outputs: result,
  };
};

export const intentCheckReferencedIds = async (agent: Agent, referenced: string[]) => {
  const ids = referenced.map(it => parseInt(it, 10));
  const intermediate = await getIntentRepo().findIds(agent, ids);

  if (ids.length !== intermediate.length) {
    throw new GraphError(
      ErrorCode.InvalidIntent,
      "Unknown id referenced in Intent#output.",
    );
  }
};

export const intentCheckAndSaveTriggers = async (
  intent: Intent,
  triggers: CreateIntentTriggerDataInput[],
) => {
  triggers.forEach(it => {
    if (!["PLAIN", "COMBINATION"].includes(it.type)) {
      throw new GraphError(ErrorCode.InvalidIntent, "Unknown Trigger#type.");
    }
  });

  const triggerRepo = getIntentTriggerRepo();

  await triggerRepo.save(
    triggers.map(it =>
      triggerRepo.create({
        intent,
        type:
          it.type === "COMBINATION"
            ? IntentTriggerType.Combination
            : IntentTriggerType.Plain,
        value: it.value,
      }),
    ),
  );
};

export const intentUpdateTriggers = async (
  intent: Intent,
  triggers: IntentTriggerDataInput[],
) => {
  const triggerRepo = getIntentTriggerRepo();

  const createTrigger = async (trigger: IntentTriggerDataInput) => {
    if (isNil(trigger.type) || isNil(trigger.value)) {
      throw new GraphError(
        ErrorCode.InvalidIntent,
        "Create trigger needs type and value.",
      );
    }

    return triggerRepo.save(
      triggerRepo.create({
        intent,
        type:
          trigger.type === "COMBINATION"
            ? IntentTriggerType.Combination
            : IntentTriggerType.Plain,
        value: trigger.value,
      }),
    );
  };

  const triggerExists = async (id: number | undefined | null) => {
    const err = new Error("Trigger does not exists");
    if (isNil(id)) {
      throw err;
    } else {
      const result = await triggerRepo.findOne(id, {
        where: {
          intent,
        },
      });
      if (isNil(result)) {
        throw err;
      } else {
        return result;
      }
    }
  };

  const updateTrigger = async (trigger: IntentTriggerDataInput) => {
    const loaded = await triggerExists(trigger.id);

    if (!isNil(trigger.type)) {
      loaded.type =
        trigger.type === "COMBINATION"
          ? IntentTriggerType.Combination
          : IntentTriggerType.Plain;
    }
    if (!isNil(trigger.value)) {
      loaded.value = trigger.value;
    }

    return triggerRepo.save(loaded);
  };

  const deleteTrigger = async (trigger: IntentTriggerDataInput) => {
    const loaded = await triggerExists(trigger.id);

    return triggerRepo.remove(loaded);
  };

  await Promise.all(
    triggers.map(async it => {
      switch (it.actionType) {
        case ActionType.Create:
          return createTrigger(it);
        case ActionType.Update:
          return updateTrigger(it);
        case ActionType.Delete:
          return deleteTrigger(it);
      }
    }),
  );
};

export const intentRemoveIntent = async (
  intent: Intent | number,
  withChildren: boolean,
) => {
  const id = typeof intent === "number" ? intent : intent.id;

  await getIntentTriggerRepo().delete({
    intent: {
      id,
    },
  });
  if (withChildren) {
    const children = await getIntentRepo().findChildren(id);
    await Promise.all(children.map(async it => intentRemoveIntent(it, true)));
  } else {
    await getIntentRepo().update(
      {
        parent: {
          id,
        },
      },
      { parent: null },
    );
  }

  await getIntentRepo().delete({
    id,
  });
};
