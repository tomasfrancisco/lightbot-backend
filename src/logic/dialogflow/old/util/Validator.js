const Joi = require("joi");
const supportedLanguagesPattern = /^(nl|en)$/;
const _ = require("lodash");

// =============================
// Agent
// =============================

const AgentFileSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  languages: Joi.array()
    .items(Joi.string().regex(supportedLanguagesPattern))
    .min(1)
    .required(),
  fulfillment: Joi.object({
    url: Joi.string().required(),
    authorization: Joi.string().required(),
  }),
  gcpProject: Joi.string(),
});

module.exports.agentFile = agent => {
  const { err } = Joi.validate(agent, AgentFileSchema);
  if (!_.isNil(err)) {
    throw new Error("Agent does not match the required schema.");
  }
};

// =============================
// Entities
// =============================

const entityItemArray = Joi.array()
  .items(Joi.string())
  .min(1);

const EntityFileSchema = Joi.object().pattern(
  /\w/,
  Joi.object()
    .keys({
      autoExpand: Joi.boolean(),
    })
    .pattern(/\w/, [
      Joi.object().pattern(supportedLanguagesPattern, entityItemArray),
      entityItemArray,
    ]),
);

const MultipleEntityFileSchema = Joi.object({
  entities: Joi.array()
    .items(EntityFileSchema)
    .min(1),
});

module.exports.entityFile = entity => {
  const { err } = Joi.validate(entity, [EntityFileSchema, MultipleEntityFileSchema]);
  if (!_.isNil(err)) {
    throw new Error(
      `Entity ${Object.keys(entity).join(",")} does not match the required schema.`,
    );
  }
};

// =============================
// Intents
// =============================

const IFTriggerSchema = Joi.array().items([
  Joi.string(),
  Joi.object({
    combination: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
  }),
  Joi.object({
    input: Joi.string().required(),
    accepts: Joi.object().pattern(/\w/, Joi.array().items([Joi.string(), Joi.number()])),
  }),
]);

const IntentFileTriggerSchema = [
  IFTriggerSchema,
  Joi.object().pattern(supportedLanguagesPattern, IFTriggerSchema),
];

const variableInsistsSchema = Joi.array()
  .items([Joi.string()])
  .min(1);

const IntentFileVariableSchema = Joi.object().pattern(
  /\w/,
  Joi.object()
    .keys({
      entityType: Joi.string(),
      value: Joi.string(),
      insists: [
        variableInsistsSchema,
        Joi.object().pattern(supportedLanguagesPattern, variableInsistsSchema),
      ],
    })
    .xor("entityType", "value"),
);

const lightbotCustomTypesSchema = [
  // Jumps
  Joi.object({
    jumps: Joi.array()
      .min(1)
      .items(
        Joi.object({
          label: Joi.string().required(),
          intentId: Joi.string(),
        }),
      )
      .required(),
  }),

  // Link
  Joi.object({
    link: Joi.string()
      .uri({ scheme: "https" })
      .required(),
    label: Joi.string(),
  }),
];

const IntentOutputItemSchema = [
  ...lightbotCustomTypesSchema,
  // Plain text
  Joi.string(),
  // Choices, dialogflow picks random
  Joi.object({
    choices: Joi.array()
      .min(1)
      .items(Joi.string()),
  }),
  // Decorated
  Joi.object({
    label: Joi.string().required(),
    objects: Joi.array()
      .required()
      .min(1)
      .items(lightbotCustomTypesSchema),
  }),
];

const IntentFileSchema = Joi.object().pattern(
  /\w/,
  Joi.object()
    .keys({
      fallback: [
        Joi.string(),
        Joi.boolean(),
        Joi.object({
          name: Joi.string().required(),
          triggers: IntentFileTriggerSchema,
        }),
      ],
      parent: Joi.string(),
      events: Joi.array().items([Joi.string()]),
      triggers: IntentFileTriggerSchema,
      action: Joi.string(),
      variables: IntentFileVariableSchema,
      outputs: Joi.array().items(IntentOutputItemSchema),
    })
    .or("events", "triggers", "fallback")
    .or("action", "outputs"),
);

const MultipleIntentFileSchema = Joi.object({
  stories: Joi.array()
    .items(IntentFileSchema)
    .min(1)
    .required(),
});

module.exports.intentFile = intent => {
  const { err } = Joi.validate(intent, [MultipleIntentFileSchema, IntentFileSchema]);
  if (!_.isNil(err)) {
    throw new Error(`Intent ${Object.keys(intent)} is invalid.`);
  }
};

// ###########################################
// TRANSFORMED VALIDATION
// ###########################################

module.exports.agentTransformed = agent => {
  // Just check if no one changed some data of this.
  module.exports.agentFile(agent);
};

const EntityTransformedSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
  })
  .pattern(/\w/, Joi.any());

module.exports.entityTransformed = entity => {
  const { err } = Joi.validate(entity, EntityTransformedSchema);
  if (!_.isNil(err)) {
    throw new Error(`Entity ${entity.name} does not match the required schema.`);
  }
};

const IntentTransformedSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
    id: Joi.string(),
    parentId: Joi.any(),
    rootId: Joi.any(),
  })
  .pattern(/\w/, Joi.any());

module.exports.intentTransformed = intent => {
  const { err } = Joi.validate(intent, IntentTransformedSchema);
  if (!_.isNil(err)) {
    throw new Error(`Intent ${intent.name} does not match the required schema.`);
  }
};
