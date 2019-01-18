import { isNil } from "lodash";
import fetch from "node-fetch";
import { In } from "typeorm";
import { Agent, Company, Intent } from "~/database/entities";
import { getIntentRepo } from "~/database/repositories";
import { GraphError } from "~/graph";
import { BotResponse } from "~/passthrough";
import { saveFallbackMessage } from "~/passthrough/common";
import { cache } from "~/passthrough/rasa/ChatCache";
import { HttpError } from "~/server";
import { ErrorCode } from "~/types";

export async function transformOutputs(outputs: any): Promise<BotResponse[]> {
  return (Promise.all(
    outputs.map(async (it: any) => {
      switch (it.type) {
        case "PLAIN":
          return {
            type: "plain",
            label: it.value.label,
          };
        case "JUMPS":
          return transformJumps(it.value.jumps);
        case "LINK":
          return {
            type: "link",
            label: it.value.label,
            link: it.value.link,
          };
        default:
          return undefined;
      }
    }),
  ) as Promise<any[]>) as Promise<BotResponse[]>;
}

export async function transformJumps(jumps: any[]): Promise<BotResponse> {
  const intentRepo = getIntentRepo();

  return {
    type: "jump",
    jumps: await Promise.all(
      jumps.map(async it => {
        const intent = await intentRepo.findOneById(
          it.intentId,
          new GraphError(ErrorCode.InvalidIntent, "Unknown intent referenced"),
        );

        return {
          label: it.label,
          event: `rasa___${intent.id}`,
        };
      }),
    ),
  } as BotResponse;
}

export async function doUserQuery(
  company: Company,
  agent: Agent,
  sessionId: string,
  human: string,
): Promise<BotResponse[]> {
  const projectName = `${company.name}-${agent.name}`;
  const result = await fetch(`http://${process.env.RASA_URL}:5000/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: human,
      project: projectName,
    }),
  });

  if (result.ok && result.status === 200) {
    const rawResult = await result.json();
    const intents = [...rawResult.intent_ranking];
    console.log(intents, cache.getUserCache(sessionId));

    if (intents[0].confidence < 0.08) {
      return triggerFallback(agent, sessionId, human);
    } else if (cache.getUserCache(sessionId).intentHistory.length > 1) {
      return triggerBasedOnCache(agent, intents, sessionId);
    } else {
      const intent = await getIntentRepo().findOne({
        where: { agent, name: intents[0].name },
      });

      return intent ? triggerIntent(intent, sessionId) : [];
    }
  } else {
    throw HttpError.internalServerError(
      "Unknown error with Rasa.",
      new Error(
        JSON.stringify({
          headers: result.headers,
          status: result.status,
          data: await result.json(),
        }),
      ),
    );
  }
}

async function triggerIntent(intent: Intent, sessionId: string): Promise<BotResponse[]> {
  cache.addIntentToUser(sessionId, intent.id);

  return transformOutputs(intent.outputs);
}

/**
 * Do some calculations with confidence to get to an educated answer on the user query
 */
async function triggerBasedOnCache(
  agent: Agent,
  possibleIntents: { name: string; confidence: number }[],
  sessionId: string,
): Promise<BotResponse[]> {
  const intentRepo = getIntentRepo();
  const userCache = cache.getUserCache(sessionId);
  const childsOfCache = await intentRepo.find({
    where: {
      agent,
      parent: {
        id: In(cache.getUserCache(sessionId).intentHistory),
      },
    },
  });

  /**
   * Nested array based on position of parent in cache
   * If cache is (79, 81, 23)
   * sortedChilds is [ [{parentId: 23}], [{parentId: 81}], [{parentId: 79}] ]
   */
  const sortedChildsOfCache: Intent[][] = userCache.intentHistory
    .map(it => childsOfCache.filter(intent => intent.parentId === it))
    .reverse();

  sortedChildsOfCache.forEach((array, index) => {
    array.forEach(childIntent => {
      const suggestedIntent = possibleIntents.find(it => it.name === childIntent.name);
      if (!isNil(suggestedIntent)) {
        suggestedIntent.confidence =
          suggestedIntent.confidence +
          (possibleIntents[0].confidence / 100) *
            (sortedChildsOfCache.length - index + 5);
      }
    });
  });
  const finalRecommendedIntent = possibleIntents.sort((a, b) =>
    b.confidence > a.confidence ? 1 : b.confidence === a.confidence ? 0 : -1,
  );
  console.log(finalRecommendedIntent);

  const foundIntent = await intentRepo.findOne({
    where: { agent, name: finalRecommendedIntent[0].name },
  });

  return foundIntent ? triggerIntent(foundIntent, sessionId) : [];
}

async function triggerFallback(
  agent: Agent,
  sessionId: string,
  human: string,
): Promise<BotResponse[]> {
  const fallback = await getIntentRepo().findOne({
    where: { agent, isFallback: true },
  });

  await saveFallbackMessage(agent, human);

  return fallback ? triggerIntent(fallback, sessionId) : [];
}
