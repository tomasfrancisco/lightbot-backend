import { isNil } from "lodash";
import { User } from "~/database/entities";
import { getDictionaryRepo } from "~/database/repositories";
import { GraphError } from "~/graph";
import { ActionType, DictionaryValueData, ErrorCode } from "~/types";

export const dictionaryNameValidation = async (
  name: string,
  user: User,
  isNewName: boolean,
) => {
  if (isNewName) {
    const existing = await getDictionaryRepo().findByNameAndUser(name, user, undefined);
    if (!isNil(existing)) {
      throw new GraphError(ErrorCode.DictionaryName, "Dictionary name already in use.");
    }
  }
};

export const dictionaryExists = async (id: number, user: User) => {
  const exists = await getDictionaryRepo().findByIdAndUser(id, user, undefined);
  if (!isNil(exists)) {
    return exists;
  } else {
    throw new GraphError(ErrorCode.InvalidDictionary, "Can't find Dictionary.");
  }
};

export const dictionaryValidateValueInput = (values: DictionaryValueData[]) => {
  if (isNil(values)) {
    return;
  }
  values.forEach(value => {
    switch (value.actionType) {
      case ActionType.Create:
        if (isNil(value.value)) {
          throw new GraphError(
            ErrorCode.InvalidDictionary,
            "Value is required when creating",
          );
        }
        break;
      case ActionType.Update:
        if (isNil(value.id) || isNil(value.value)) {
          throw new GraphError(
            ErrorCode.InvalidDictionary,
            "Value and Id are required when updating",
          );
        }
        break;
      case ActionType.Delete:
        if (isNil(value.id)) {
          throw new GraphError(
            ErrorCode.InvalidDictionary,
            "Id is required when deleting.",
          );
        }
    }
  });
};
