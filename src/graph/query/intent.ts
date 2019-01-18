import { isNil } from "lodash";
import { getIntentRepo } from "~/database/repositories";
import { Intent, SearchIntentTrigger, Where } from "~/graph";
import { Context } from "~/server/middleware";

export const intentQueries = {
  children: async (intent: Intent, __: never, context: Context) => {
    const result = await getIntentRepo().findChildren(intent.id);

    return result.map(it => it.toGraphType());
  },
  triggers: async (
    intent: Intent,
    { where }: Where<SearchIntentTrigger>,
    context: Context,
  ) => {
    if (isNil(where)) {
      return intent.triggers;
    } else {
      return intent.triggers.filter(it => {
        let returnValue = true;

        if (!isNil(where.id)) {
          returnValue = it.id === where.id;
        }

        if (!isNil(where.type)) {
          returnValue = it.type === where.type && returnValue;
        }

        if (!isNil(where.value)) {
          returnValue = it.value.includes(where.value) && returnValue;
        }

        return returnValue;
      });
    }
  },
};
