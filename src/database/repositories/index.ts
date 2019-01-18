import { getCustomRepository } from "typeorm";
import { AgentDataRepo } from "./AgentDataRepo";
import { AgentRepo } from "./AgentRepo";
import { CompanyRepo, DictionaryValueRepo, IntentTriggerRepo } from "./BaseRepo";
import { DictionaryRepo } from "./DictionaryRepo";
import { IntentRepo } from "./IntentRepo";
import { LoginTokenRepo } from "./LoginTokenRepo";
import { UnknownTriggerRepo } from "./UnknownTriggerRepo";

export const getAgentDataRepo = () => getCustomRepository(AgentDataRepo);
export const getAgentRepo = () => getCustomRepository(AgentRepo);
export const getCompanyRepo = () => getCustomRepository(CompanyRepo);
export const getDictionaryValueRepo = () => getCustomRepository(DictionaryValueRepo);
export const getIntentTriggerRepo = () => getCustomRepository(IntentTriggerRepo);
export const getDictionaryRepo = () => getCustomRepository(DictionaryRepo);
export const getIntentRepo = () => getCustomRepository(IntentRepo);
export const getLoginTokenRepo = () => getCustomRepository(LoginTokenRepo);
export const getUnknownTriggerRepo = () => getCustomRepository(UnknownTriggerRepo);
