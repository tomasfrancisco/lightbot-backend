const Visitor = require("./Visitor");
const { uuid } = require("../util");
const _ = require("lodash");

/**
 * Manages contexts, id's, parents etc.
 */
class ConversationFlow extends Visitor {
  constructor(context, intents) {
    super();

    this.context = context;
    this.addedContexts = false;

    this.idMapping = {};
    this.intentMapping = {};
    this.intents = intents;
    this.intents.forEach(it => {
      this.idMapping[it.data.name] = uuid();
      this.intentMapping[it.data.name] = it;
    });
    this.intents.forEach(it => {
      if (!_.isNil(it.data.parent) && !_.isNil(this.intentMapping[it.data.parent])) {
        this.intentMapping[it.data.parent].isParent = true;
      }
    });
  }

  visitIntent(intent) {
    this.parseContexts();
    intent.data.id = this.idMapping[intent.data.name];
    intent.data.parentId = this.idMapping[intent.data.parent] || null;
    if (this.intentMapping[intent.data.name].isParent) {
      if (_.isNil(intent.data.outputContext)) {
        intent.data.outputContext = [];
      }
      intent.data.outputContext.push({
        name: `${intent.data.name}Context`,
        lifespan: 2,
      });
    }

    if (!_.isNil(intent.data.parent)) {
      if (_.isNil(intent.data.inputContext)) {
        intent.data.inputContext = [];
      }

      intent.data.inputContext.push(`${intent.data.parent}Context`);
    }

    intent.data.rootId = this.findRootId(intent);
    if (intent.data.rootId === intent.data.id) {
      intent.data.rootId = null;
    }
  }

  /**
   * Find the root intent id
   */
  findRootId(intent) {
    return _.isNil(intent.data.parent)
      ? intent.data.id
      : this.findRootId(this.intentMapping[intent.data.parent]);
  }

  /**
   * Add the contexts to the intent
   */
  parseContexts() {
    if (!this.addedContexts) {
      for (const intentName in this.context) {
        if (!Object.hasOwnProperty.call(this.context, intentName)) {
          continue;
        }

        const contextData = this.context[intentName];
        const filteredIntents = this.intents.filter(it => it.data.name === intentName);
        if (filteredIntents.length !== 1) {
          throw new Error(`Can't find intent with name ${intentName}.`);
        }
        const [intent] = filteredIntents;

        if (!_.isNil(contextData.in) && _.isArray(contextData.in)) {
          intent.data.inputContext = [...contextData.in];
        }

        if (!_.isNil(contextData.out) && _.isArray(contextData.out)) {
          intent.data.outputContext = [...contextData.out];
        }

        intent.data.destroyContext = !(
          _.isNil(contextData.destroy) || !contextData.destroy
        );
        intent.data.id = this.idMapping[intent.data.name];
      }

      this.addedContexts = true;
    }
  }
}

module.exports = ConversationFlow;
