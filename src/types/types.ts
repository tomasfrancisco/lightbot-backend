// Generated in 2019-01-24T10:39:04+01:00
// THIS FILE IS GENERATED
/* tslint:disable */

export type Input<T> = { input: T };
export type Where<T> = { where: T };

export type Maybe<T> = T | null;

export interface SearchIntent {
  id: Maybe<number>;

  agentId: Maybe<string>;

  isTopLevel: Maybe<boolean>;
}

export interface SearchIntentTrigger {
  id: Maybe<number>;

  value: Maybe<string>;

  type: Maybe<string>;
}

export interface IntentExpression {
  intentExpression: Maybe<string>;

  agentId: Maybe<string>;

  isTopLevel: Maybe<boolean>;
}

export interface AgentId {
  agentId: string;
}

export interface SearchSingleDictionary {
  id: number;
}

export interface CreateIntent {
  agentId: string;

  name: string;

  parentId: Maybe<number>;

  triggers: CreateIntentTriggerDataInput[];

  outputs: Json[];
}

export interface CreateIntentTriggerDataInput {
  type: IntentTriggerType;

  value: string[];
}

export interface UpdateIntent {
  id: number;

  name: Maybe<string>;

  isTopLevel: Maybe<boolean>;

  parentId: Maybe<number>;

  triggers: Maybe<IntentTriggerDataInput[]>;

  outputs: Maybe<Json[]>;
}

export interface IntentTriggerDataInput {
  id: Maybe<number>;

  type: Maybe<IntentTriggerType>;

  value: Maybe<string[]>;

  actionType: ActionType;
}

export interface DeleteIntent {
  id: number;

  withChildren: boolean;
}

export interface UpdateWidgetData {
  agentId: string;

  widgetInputPlaceholder: string;

  widgetTeaser: string;

  widgetHotspotIcon: string;

  widgetThemeData: string;
}

export interface MoveUnknownTriggersToIntentDataInput {
  agentId: string;

  unknownTriggerIds: number[];

  intentId: number;
}

export interface CreateIntentWithUnknownTriggers {
  agentId: string;

  unknownTriggers: number[];

  intentName: string;
}

export interface DeleteUnknownTriggers {
  unknownTriggerIds: number[];

  agentId: string;
}

export interface CreateDictionaryData {
  name: string;
}

export interface BatchDictionaryData {
  id: number;

  name: Maybe<string>;

  values: DictionaryValueData[];
}

export interface DictionaryValueData {
  actionType: ActionType;

  id: Maybe<number>;

  value: Maybe<string>;
}

export interface DeleteDictionaryData {
  id: number;
}

export enum IntentTriggerType {
  Plain = "PLAIN",
  Combination = "COMBINATION",
}

export enum ActionType {
  Create = "CREATE",
  Update = "UPDATE",
  Delete = "DELETE",
}

export enum ErrorCode {
  InvalidAuth = "INVALID_AUTH",
  InvalidIntent = "INVALID_INTENT",
  InvalidUnknownTrigger = "INVALID_UNKNOWN_TRIGGER",
  InvalidParent = "INVALID_PARENT",
  InvalidAgent = "INVALID_AGENT",
  InvalidDictionary = "INVALID_DICTIONARY",
  DictionaryName = "DICTIONARY_NAME",
  DeployAgent = "DEPLOY_AGENT",
}

export type Json = any;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  _dummy: Maybe<boolean>;

  me: Maybe<User>;

  intents: Intent[];

  findIntentsByExpression: Intent[];

  agents: Agent[];

  findAgent: Agent;

  dictionaries: Dictionary[];

  dictionary: Maybe<Dictionary>;
}

export interface User {
  id: number;
}

export interface Intent {
  id: number;

  name: string;

  parentId: Maybe<number>;

  isTopLevel: boolean;

  isFallback: boolean;

  isWelcome: boolean;

  children: Intent[];

  triggers: IntentTrigger[];

  outputs: Json[];
}

export interface IntentTrigger {
  id: number;

  type: IntentTriggerType;

  value: string[];
}

export interface Agent {
  id: string;

  name: string;

  data: Maybe<AgentData>;

  unknownTriggers: UnknownTrigger[];

  unknownTriggersCount: number;

  deploy: Maybe<Agent>;
}

export interface AgentData {
  widgetInputPlaceholder: Maybe<string>;

  widgetTeaser: Maybe<string>;

  widgetHotspotIcon: Maybe<string>;

  widgetThemeData: Maybe<Json>;
}

export interface UnknownTrigger {
  id: number;

  createdAt: number;

  value: Maybe<string>;
}

export interface Dictionary {
  id: number;

  name: Maybe<string>;

  values: DictionaryValue[];
}

export interface DictionaryValue {
  id: number;

  value: Maybe<string>;
}

export interface Mutation {
  _dummy: Maybe<boolean>;

  createIntent: Maybe<Intent>;

  updateIntent: Maybe<Intent>;

  deleteIntent: Maybe<Intent>;

  updateWidgetData: Maybe<AgentData>;

  moveUnknownTriggersToIntent: Maybe<Intent>;

  createIntentWithUnknownTriggers: Maybe<Intent>;

  deleteUnknownTriggers: Maybe<UnknownTrigger>;

  createDictionary: Maybe<Dictionary>;

  batchDictionary: Maybe<Dictionary>;

  deleteDictionary: Maybe<Dictionary>;
}

// ====================================================
// Arguments
// ====================================================

export interface IntentsQueryArgs {
  where: Maybe<SearchIntent>;
}
export interface FindIntentsByExpressionQueryArgs {
  input: IntentExpression;
}
export interface FindAgentQueryArgs {
  input: AgentId;
}
export interface DictionaryQueryArgs {
  where: SearchSingleDictionary;
}
export interface TriggersIntentArgs {
  where: Maybe<SearchIntentTrigger>;
}
export interface CreateIntentMutationArgs {
  input: CreateIntent;
}
export interface UpdateIntentMutationArgs {
  input: UpdateIntent;
}
export interface DeleteIntentMutationArgs {
  input: DeleteIntent;
}
export interface UpdateWidgetDataMutationArgs {
  input: UpdateWidgetData;
}
export interface MoveUnknownTriggersToIntentMutationArgs {
  input: MoveUnknownTriggersToIntentDataInput;
}
export interface CreateIntentWithUnknownTriggersMutationArgs {
  input: CreateIntentWithUnknownTriggers;
}
export interface DeleteUnknownTriggersMutationArgs {
  input: DeleteUnknownTriggers;
}
export interface CreateDictionaryMutationArgs {
  input: CreateDictionaryData;
}
export interface BatchDictionaryMutationArgs {
  input: BatchDictionaryData;
}
export interface DeleteDictionaryMutationArgs {
  input: DeleteDictionaryData;
}
