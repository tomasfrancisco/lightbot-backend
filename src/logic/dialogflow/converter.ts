import { camelCase, capitalize, isEmpty, isNil } from "lodash";
import { Agent, AgentData, Dictionary, Intent, IntentTrigger } from "~/database/entities";
import { getDictionaryRepo, getIntentRepo } from "~/database/repositories";
import { IntentTriggerType } from "~/types";

const camelCaseString = (str: string) =>
  camelCase(
    str
      .split(" ")
      .map(it => capitalize(it))
      .join(""),
  );

export async function convertToDialogflow(agent: Agent): Promise<object> {
  agent.intents = await getIntentRepo().findByAgent(agent);
  await addIntentParents(agent);
  const dictionaries = await getDictionaryRepo().findByAgent(agent);

  const agentData = AgentData.toObject(agent.uuid, agent.data);

  return {
    gcpData: agentData.gcpData,
    agent: convertAgentToConverter(agent),
    context: {},
    intents: await convertIntentsToConverter(agent.intents),
    entities: convertDictionariesToConverter(dictionaries),
  };
}

async function addIntentParents(agent: Agent): Promise<void[]> {
  return Promise.all(
    agent.intents.map(async it => {
      if (!isNil(it.parentId)) {
        it.parent = await getIntentRepo().findOneById(it.parentId, new Error());
      }
    }),
  );
}

function convertAgentToConverter(agent: Agent): object {
  return {
    name: agent.name,
    description: `Lightbot: ${agent.name}`,
    languages: ["nl"],
  };
}

async function convertIntentsToConverter(intents: Intent[]): Promise<object[]> {
  return Promise.all(
    intents.map(async intent => {
      const events = intent.events || [];
      events.push(`Trigger-${camelCaseString(intent.name)}`);

      return {
        [camelCaseString(intent.name)]: {
          events,
          action: intent.action || undefined,
          fallback: intent.isFallback || false,
          parent: !isNil(intent.parentId)
            ? camelCaseString(intent.parent!.name)
            : undefined,
          triggers: convertTriggersToConverter(intent.triggers),
          outputs: await convertOutputsToConverter(intent.outputs),
        },
      };
    }),
  );
}

function convertTriggersToConverter(triggers: IntentTrigger[]): any[] | undefined {
  if (isNil(triggers) || isEmpty(triggers)) {
    return;
  }

  return triggers.map(it => {
    switch (it.type) {
      case IntentTriggerType.Plain:
        return it.value[0];
      case IntentTriggerType.Combination:
        return { combination: it.value };
    }
  });
}

async function convertOutputsToConverter(outputs: any[]): Promise<any[] | undefined> {
  if (isNil(outputs) || isEmpty(outputs)) {
    return;
  }

  return Promise.all(
    outputs.map(async it => {
      switch (it.type) {
        case "JUMPS":
          return {
            jumps: await convertJumpsToConverter(it.value.jumps),
          };
        case "LINK":
          return {
            type: "link",
            ...it.value,
          };
        case "PLAIN":
          return it.value.label;
        default:
          return {
            [it.type.toLowerCase()]: {
              ...it.value,
              type: undefined,
            },
          };
      }
    }),
  );
}

async function convertJumpsToConverter(jumps: any[]): Promise<any[]> {
  return Promise.all(
    jumps.map(async it => {
      const intent = await getIntentRepo().findOneById(it.intentId, new Error());

      return {
        label: it.label,
        intentId: camelCaseString(intent.name),
      };
    }),
  );
}

function convertDictionariesToConverter(dictionaries: Dictionary[]): any[] | undefined {
  if (isNil(dictionaries) || isEmpty(dictionaries)) {
    return undefined;
  }

  return dictionaries.map(dict => ({
    [camelCaseString(dict.name)]: {
      [camelCaseString(dict.name)]: dict.values.map(it => it.value),
    },
  }));
}
