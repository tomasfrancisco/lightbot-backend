import { cloneDeep, flatten, flattenDeep, isNil, isString } from "lodash";
import { Agent } from "~/database/entities";
import { getDictionaryRepo, getIntentRepo } from "~/database/repositories";

export interface TrainData {
  agent: string;
  data: object;
}

interface CleanEntity {
  value: string;
  synonyms: string[];
}

interface CleanIntent {
  text: string;
  intent: string;
  entities: IntentEntities[];
}

interface IntentEntities {
  start: number;
  end: number;
  value: string;
  entity: string;
}

export async function convertToRasa(agent: Agent): Promise<TrainData> {
  const entities = await getAndCleanEntities(agent);
  const intents = await getAndCleanIntents(agent);

  const result = {
    common_examples: flatten(intents.map(it => replaceEntitiesInIntent(it, entities))),
    regex_features: [],
    lookup_tables: [],
    entity_synonyms: entities,
  };

  return {
    agent: agent.name,
    data: {
      rasa_nlu_data: result,
    },
  };
}

async function getAndCleanEntities(agent: Agent): Promise<CleanEntity[]> {
  const dictionaries = await getDictionaryRepo().findByAgent(agent);

  return dictionaries.map(it => {
    const synonyms = it.values.map(value => value.value);

    if (it.name.split(" ").length === 1) {
      synonyms.push(it.name);
    }

    return {
      value: it.name,
      synonyms,
    };
  });
}

async function getAndCleanIntents(agent: Agent): Promise<CleanIntent[]> {
  const intents = await getIntentRepo().findByAgent(agent);

  const intermediate: CleanIntent[][] = intents.map(intent =>
    intent.triggers.map(trigger => ({
      text: trigger.value as any,
      entities: [],
      intent: intent.name,
    })),
  );

  return flatten(intermediate);
}

function replaceEntitiesInIntent(
  intent: CleanIntent,
  entities: CleanEntity[],
): CleanIntent[] {
  const result: CleanIntent[] = [];

  const handleSentence = () => {
    if (intent.text.includes("$")) {
      result.push(...extractEntitiesInSentence(intent, entities));
    } else {
      result.push(intent);
    }
  };

  const handleCombination = () => {
    const resultSet = [];
    const listSize = intent.text.length;
    const combinationCount = Math.pow(2, intent.text.length);
    let combination;

    for (let i = 1; i < combinationCount; i += 1) {
      combination = [];
      for (let j = 0; j < combinationCount; j += 1) {
        const intermediate = Math.pow(2, j);

        if (i % (intermediate * 2) > intermediate - 1) {
          combination.push(intent.text[j]);
        }
      }

      if (combination.length === listSize) {
        resultSet.push(combination.join(" "));
      }
    }

    result.push(
      ...flatten(
        resultSet.map(it =>
          extractEntitiesInSentence(
            {
              text: it,
              intent: intent.intent,
              entities: [],
            },
            entities,
          ),
        ),
      ),
    );
  };

  if (Array.isArray(intent.text)) {
    if (intent.text.length === 1) {
      intent.text = intent.text[0];
      handleSentence();
    } else if (intent.text.length > 4) {
      throw new Error("TOO LOONG COMBINATION");
    } else {
      handleCombination();
    }
  } else if (isString(intent.text)) {
    handleSentence();
  } else {
    throw new Error("No plain text, no combination");
  }

  return flattenDeep(result);
}

/**
 * Input: intentName, some $string with $possibly multiple $currencySigns
 * Output: List of CleanIntent without any dollar signs and with anotated entities
 */
function extractEntitiesInSentence(
  nonClean: CleanIntent,
  entities: CleanEntity[],
): CleanIntent[] {
  if (!nonClean.text.includes("$")) {
    return [nonClean];
  }

  const startIdx = nonClean.text.indexOf("$");
  const customRegex = new RegExp(
    `.{${startIdx + 1}}(sys[a-zA-Z-]*)?([a-zA-Z-]*)?(.*)?`,
    "i",
  );
  const [input, sysEntity, regularEntity, extra] = customRegex.exec(nonClean.text)!;

  const firstPart = nonClean.text.substr(0, startIdx - 1);

  let rawEntity = regularEntity;
  if (sysEntity) {
    rawEntity = sysEntity;
  }

  const secondPart = nonClean.text.substr(startIdx + 1 + rawEntity.length);
  const entityName = rawEntity;
  const entity = entities.find(
    value =>
      value.value === entityName ||
      value.value.toLowerCase() === entityName.toLowerCase(),
  );
  if (isNil(entity)) {
    throw new Error("Can't find entity.");
  }

  const samples = pickSampleEntityValues(entity);

  return flatten(
    samples
      .map(it => {
        const copy = copyIntent(nonClean);

        copy.text = firstPart + it + (secondPart.length === 0 ? "" : ` ${secondPart}`);
        copy.entities.push({
          entity: entity.value,
          start: firstPart.length,
          end: firstPart.length + it.length,
          value: it,
        });

        return copy;
      })
      .map(it => extractEntitiesInSentence(it, entities)),
  );
}

function pickSampleEntityValues(entity: CleanEntity): string[] {
  const randomItem = () =>
    entity.synonyms[Math.floor(Math.random() * entity.synonyms.length) - 1];

  // Return 4 or the amount of synonyms as sample entity values
  const totalLength = Math.min(4, entity.synonyms.length);
  const result = [];
  for (let i = totalLength; i > 0; i -= 1) {
    result.push(randomItem());
  }

  return result.filter(it => !isNil(it));
}

function copyIntent(intent: CleanIntent): CleanIntent {
  return cloneDeep(intent);
}
