import { isNil } from "lodash";
import { Dictionary } from "~/database/entities";
import { getDictionaryRepo, getDictionaryValueRepo } from "~/database/repositories";
import {
  ActionType,
  BatchDictionaryData,
  CreateDictionaryData,
  DeleteDictionaryData,
  DictionaryValueData,
  Input,
} from "~/graph";
import {
  dictionaryExists,
  dictionaryNameValidation,
  dictionaryValidateValueInput,
} from "~/logic";
import { Context } from "~/server/middleware";

export const dictionaryMutations = {
  createDictionary: async (
    __: never,
    { input }: Input<CreateDictionaryData>,
    context: Context,
  ) => {
    await dictionaryNameValidation(input.name, context.user, true);
    const result = await getDictionaryRepo().createByName(
      input.name,
      context.user.companyId,
    );

    return result.toGraphType();
  },

  batchDictionary: async (
    __: never,
    { input }: Input<BatchDictionaryData>,
    context: Context,
  ) => {
    const dictionaryValueAction = (
      dictionary: Dictionary,
      value: DictionaryValueData,
    ) => {
      const dictValueRepo = getDictionaryValueRepo();
      switch (value.actionType) {
        case ActionType.Create:
          return dictValueRepo.save(
            dictValueRepo.create({
              value: value.value!,
              dictionary,
            }),
          );
        case ActionType.Update:
          return dictValueRepo.update(
            { id: value.id!, dictionary },
            { value: value.value! },
          );
        case ActionType.Delete:
          return dictValueRepo.delete({
            id: value.id!,
            dictionary,
          });
      }
    };

    const dict = await dictionaryExists(input.id, context.user);
    dictionaryValidateValueInput(input.values);

    if (!isNil(input.name) && dict.name !== input.name) {
      await dictionaryNameValidation(input.name, context.user, true);
      dict.name = input.name;
      await getDictionaryRepo().save(dict);
    }

    const promises: Promise<any>[] = (input.values || []).map(it =>
      dictionaryValueAction(dict, it),
    );
    await Promise.all(promises);

    const result = await getDictionaryRepo().findByIdAndUser(
      dict.id,
      context.user,
      undefined,
    );

    return result ? result.toGraphType() : undefined;
  },

  deleteDictionary: async (
    __: never,
    { input }: Input<DeleteDictionaryData>,
    context: Context,
  ) => {
    await dictionaryExists(input.id, context.user);
    await getDictionaryRepo().delete(input.id);
  },
};
