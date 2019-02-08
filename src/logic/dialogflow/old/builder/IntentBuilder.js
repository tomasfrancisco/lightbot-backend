/* eslint-disable func-style */
const Builder = require("./Builder");
const _ = require("lodash");
const { FileUtil } = require("../util");
const JsonManipulator = require("./JsonManipulator");
const { logger } = require("~/logger");

class IntentBuilder extends Builder {
  static hasLoggedEntities = false;

  constructor(intent, agentLanguages, entityNames) {
    super();
    this.intent = { ...intent };
    this.agentLanguages = agentLanguages;

    this.intentFile = {};
    this.intentLangFiles = {};

    this.entityNames = entityNames.map(it => it.toLowerCase());

    if (!IntentBuilder.hasLoggedEntities) {
      logger.log("Entities: ", this.entityNames);
      IntentBuilder.hasLoggedEntities = true;
    }

    this.validateLanguages();
  }

  /**
   * Simple normalization for the languages
   * This happens in the constructor so we can skip that in other parts.
   */
  validateLanguages() {
    if (_.has(this.intent, "outputs") && !_.isNil(this.intent.outputs)) {
      this.intent.outputs = JsonManipulator.normalizeLanguage(
        this.agentLanguages,
        this.intent.outputs || [],
      );
    }

    if (_.has(this.intent, "triggers") && !_.isNil(this.intent.triggers)) {
      this.intent.triggers = JsonManipulator.normalizeLanguage(
        this.agentLanguages,
        this.intent.triggers,
      );
    }

    this.intent.events = this.intent.events || [];
  }

  build() {
    this.buildIntentFile();
    this.buildLangFiles();
  }

  /**
   * The full dialogflow 'response' value
   */
  createResponse() {
    return {
      resetContexts: this.intent.destroyContext || false,
      action: this.intent.action || "",
      affectedContexts: _.get(this.intent, "outputContext", []).map(it => ({
        name: _.isString(it) ? it : it.name,
        parameters: {},
        lifespan: _.isString(it) ? 3 : it.lifespan,
      })),
      parameters: this.parseVariables(),
      messages: this.parseMessages(),
      defaultResponsePlatforms: {},
      speech: [],
    };
  }

  /**
   * (Almost) 'Static' conversion to dialogflow file format
   */
  buildIntentFile() {
    this.intentFile = {
      id: this.intent.id,
      name: this.intent.name,
      auto: true,
      contexts: this.intent.inputContext || [],
      responses: [this.createResponse()],
      priority: 500000,
      webhookUsed: !_.isNil(this.intent.action),
      webhookForSlotFilling: false,
      fallbackIntent: this.intent.fallback || false,
      events: (this.intent.events || []).map(it => ({
        name: it,
      })),
    };

    if (!_.isNil(this.intent.parentId)) {
      this.intentFile.parentId = this.intent.parentId;
    }

    if (!_.isNil(this.intent.rootId)) {
      this.intentFile.rootParentId = this.intent.rootId;
    }
  }

  /**
   * Parse all the defined variables.
   */
  parseVariables() {
    const result = [];
    if (_.isNil(this.intent.variables)) {
      return result;
    }

    for (const key in this.intent.variables) {
      if (!Object.hasOwnProperty.call(this.intent.variables, key)) {
        continue;
      }
      const currentVariable = this.intent.variables[key];
      if (_.isNil(currentVariable.value)) {
        result.push({
          required: !_.isNil(currentVariable.insists),
          dataType: `@${currentVariable.entityType}`,
          name: key,
          value: `$${key}`,
          prompts: this.createPrompts(currentVariable.insists),
          isList: false,
        });
      } else {
        result.push({
          required: false,
          name: key,
          value: currentVariable.value,
          isList: false,
        });
      }
    }

    return result;
  }

  /**
   * Parse 'outputs'
   * Custom payload also needs to be parsed here.
   */
  parseMessages() {
    const messages = [];

    const data = this.intent.outputs;
    if (_.isNil(data)) {
      const [lang] = this.agentLanguages;
      messages.push({
        type: 0,
        lang,
        speech: [],
      });
      return messages;
    }

    for (const langName in data) {
      if (!Object.hasOwnProperty.call(data, langName)) {
        continue;
      }

      for (const item of data[langName]) {
        if (_.isString(item)) {
          messages.push({
            type: 0,
            lang: langName,
            speech: item,
          });
        } else if (_.isPlainObject(item) || _.isArray(item)) {
          const result = this.handleMessageObjects(langName, item);
          if (!_.isNil(result)) {
            messages.push(result);
          }
        }
      }
    }

    return messages;
  }

  handleMessageObjects(language, item) {
    if (_.isObject(item) && _.has(item, "choices") && _.isArray(item.choices)) {
      return {
        type: 0,
        lang: language,
        speech: _.get(item, "choices", []),
      };
    } else if (_.isObject(item) && _.has(item, "jumps") && _.isArray(item.jumps)) {
      return this.createType4Response(language, this.constructJumps(item));
    } else if (_.isObject(item) && _.has(item, "link")) {
      return this.createType4Response(language, this.constructLink(item));
    } else if (_.isObject(item) && _.has(item, "objects")) {
      return this.createType4Response(language, {
        type: "decorated",
        label: item.label,
        objects: (item.objects || []).map(it => {
          if (_.has(it, "link")) {
            return this.constructLink(it);
          } else if (_.has(it, "jumps")) {
            return this.constructJumps(it);
          }
          throw new Error(
            `Unknown data in decorated type in Intent output: ${this.intent.name}`,
          );
        }),
      });
    }
  }

  createType4Response(language, item) {
    return {
      type: 4,
      lang: language,
      payload: {
        lightbot: {
          response: [item],
        },
      },
    };
  }

  /**
   *
   * @param item
   * @param item.jumps
   * @param item.jumps[].label
   * @param item.jumps[].intentId
   */
  constructJumps(item) {
    return {
      type: "jump",
      jumps: (item.jumps || []).map(it => ({
        label: it.label,
        event: `Trigger-${it.intentId}`,
      })),
    };
  }

  constructLink(item) {
    return {
      type: "link",
      label: _.get(item, "label", item.link),
      link: item.link,
    };
  }

  /**
   * Convert insists to dialogflow prompts
   */
  createPrompts(data) {
    const prompts = [];
    if (_.isNil(data)) {
      return prompts;
    }

    data = JsonManipulator.normalizeLanguage(this.agentLanguages, data);

    for (const langName in data) {
      if (!Object.hasOwnProperty.call(data, langName)) {
        continue;
      }
      for (const item of data[langName]) {
        prompts.push({
          lang: langName,
          value: item,
        });
      }
    }
    return prompts;
  }

  /**
   * Skips invalid triggers and expand the 'template' triggers that have arrays by the 'accept' key
   */
  normalizeTriggers(lang) {
    const result = [];
    for (const item of this.intent.triggers[lang]) {
      if (_.isString(item)) {
        result.push(item);
      } else if (_.isPlainObject(item) && _.has(item, "accepts")) {
        const params = item.accepts;
        const keys = Object.keys(params);
        if (keys.length === 0) {
          logger.log(`Skipping trigger in  ${this.intent.name} because it is invalid.`);
          continue;
        }

        const amount = _.get(params, `${keys[0]}`, []).length;
        for (let i = 0; i < amount; i += 1) {
          result.push({
            input: item.input,
            accepts: _.zipObject(keys, keys.map(it => _.get(params, `${it}[${i}]`, ""))),
          });
        }
      } else if (_.isPlainObject(item) && _.has(item, "combination")) {
        result.push(...this.generateWildcardCombinations(item.combination));
      } else {
        logger.log(`Skipping trigger in  ${this.intent.name} because it is invalid.`);
      }
    }
    return result;
  }

  /**
   * Generates all combinations and all permutations of a given array.
   * Not the most efficient but pretty readable
   * i.e. Using about 0.35 mb for all permutations of values.length === 5 and result.length === 288
   * @param values
   * @returns {Array}
   */
  generateWildcardCombinations(values) {
    if (values.length > 4) {
      // Dialogflow accepts 2000 triggers. 4 items and the added wildcards generate 1900 ish items
      throw new Error("Combination of more than 4 items is unsupported at the moment!");
    }

    let zeroOrOne = 0;
    let multiple = 0;

    if (values.length === 4) {
      zeroOrOne = 1;
      multiple = 2;
    } else {
      zeroOrOne = Math.max(values.length - 1, 2);
      multiple = zeroOrOne;
    }
    const valueArr = [
      ...values,
      ...Array(zeroOrOne).fill("*"),
      Array(multiple).fill("**"),
    ];

    const combinations = [];
    logger.log("Memory before:", process.memoryUsage());
    /**
     * Make sure that wildcards dont followup on each other at the start or end
     * And then save the value
     * @param value
     */
    const addCombination = value => {
      value = value.trim();
      value = value
        .replace("** *", "**")
        .replace("* **", "**")
        .replace("* *", "*")
        .replace("** **", "**");

      // Only save when at least to entities are used
      if (value.split("$").length >= 3) {
        combinations.push(value);
      }
    };

    /**
     * The recursive combination and permutation generator.
     * @param currentValue
     * @param items
     */
    const generator = (currentValue, items) => {
      if (items.length > 0) {
        for (let i = 0; i < items.length; i += 1) {
          const val = `${currentValue} ${items[i]}`;
          addCombination(val);
          const cp = [...items];
          cp.splice(i, 1);
          generator(val, cp);
        }
      }
    };
    generator("", valueArr);
    logger.log("Memory after:", process.memoryUsage());

    logger.log(
      `Generated ${combinations.length} combinations for input: ${values.join(", ")}`,
    );
    return combinations;
  }

  /**
   * Parse all the triggers for all languages
   */
  buildLangFiles() {
    if (_.isNil(this.intent.triggers)) {
      return;
    }

    for (const lang in this.intent.triggers) {
      if (!Object.hasOwnProperty.call(this.intent.triggers, lang)) {
        continue;
      }
      this.intentLangFiles[lang] = [];
      const normalizedArray = this.normalizeTriggers(lang);

      for (const item of normalizedArray) {
        if (_.isString(item) && item.indexOf("$") === -1) {
          this.intentLangFiles[lang].push({
            data: [
              {
                text: item,
                userDefined: false,
              },
            ],
            isTemplate: false,
            count: 0,
          });
        } else if (_.isString(item) && item.indexOf("$") >= 0) {
          this.intentLangFiles[lang].push({
            data: this.splitOutEntityTemplates(item),
            isTemplate: true,
          });
        } else if (_.isPlainObject(item)) {
          this.intentLangFiles[lang].push({
            data: this.parseTriggerObjects(item),
            isTemplate: false,
          });
        } else {
          throw new Error(`Unknown value in ${this.intent.name}.triggers`);
        }
      }
    }
  }

  /**
   * Replace trigger variables with their entity name
   */
  splitOutEntityTemplates(item) {
    const parts = item.split(" ");
    for (let i = 0; i < parts.length; i += 1) {
      if (parts[i].startsWith("$")) {
        const raw = parts[i].substr(1).trim();

        const matchRegExp = new RegExp(/(sys[a-zA-Z-]*)?([a-zA-Z-]*)?(.*)?/i);
        const [input, sysEntity, regularEntity, extra] = matchRegExp.exec(raw);

        let entity = regularEntity;
        if (sysEntity) {
          entity = this.transformSysNotation(sysEntity);
        }

        if (_.isNull(extra)) {
          // input === entity, but eslint didn't agree with me not using the input variable
          parts[i] = this.findEntityTypeViaParameterName(input);
        } else {
          parts[i] = [this.findEntityTypeViaParameterName(entity), extra];
        }
      }
    }
    return [
      {
        text: _.flattenDeep(parts)
          .join(" ")
          .trim(),
      },
    ];
  }

  /**
   * Transforms entity reserved prefix "sys" (case insensitive) to "sys." notation
   * @param entity
   */
  transformSysNotation(entity) {
    return entity.replace(/sys/i, "sys.");
  }

  /**
   * Build an array with sentence parts. Every 'parameter' get its own part with alias and entity name.
   * All the text before and after a parameter are 'joined' together
   * @param item
   */
  parseTriggerObjects(item) {
    const parts = item.input.split(" ");
    const result = [];
    let lastIndex = 0;
    for (let i = 0; i < parts.length; i += 1) {
      if (parts[i].startsWith("$")) {
        const originalText = parts[i].substr(1);
        result.push({
          text: ` ${parts.slice(lastIndex, i).join(" ")} `,
        });

        let meta = this.findEntityTypeViaParameterName(originalText, false);
        if (!meta.startsWith("@")) {
          meta = `@${meta}`;
        }

        result.push({
          text: String(item.accepts[originalText]),
          alias: originalText,
          meta,
        });
        lastIndex = i + 1;
      }
    }
    result.push({
      text: ` ${parts.slice(lastIndex).join(" ")} `,
    });
    return result.filter(it => !_.isEmpty(it.text.trim()));
  }

  findEntityTypeViaParameterName(name, addName = true) {
    let str = _.get(this.intent.variables, `${name}.entityType`, null);
    if (_.isNil(str)) {
      str = `@${name}`;
    } else if (addName) {
      str = `@${str}:${name}`;
    }

    this.checkIfEntityExists(str);

    return str;
  }

  checkIfEntityExists(entityName) {
    if (entityName.startsWith("sys.") || entityName.startsWith("@sys.")) {
      return;
    }
    if (entityName.indexOf(":") > -1) {
      [entityName] = entityName.split(":");
    }
    const entity = entityName.startsWith("@") ? entityName.substring(1) : entityName;
    if (this.entityNames.indexOf(entity.toLowerCase()) === -1) {
      throw new Error(`Can't find '${entity}' entity.`);
    }
  }

  writeToFile(outputDirectory) {
    const dir = `${outputDirectory}intents/`;
    FileUtil.writeToFile(`${dir}${this.intent.name}.json`, this.intentFile);
    for (const key in this.intentLangFiles) {
      if (
        !Object.hasOwnProperty.call(this.intentLangFiles, key) ||
        _.isEmpty(this.intentLangFiles[key])
      ) {
        continue;
      }
      FileUtil.writeToFile(
        `${dir}${this.intent.name}_usersays_${key}.json`,
        this.intentLangFiles[key],
      );
    }
  }
}

module.exports = IntentBuilder;
