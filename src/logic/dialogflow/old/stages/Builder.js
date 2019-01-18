const Visitor = require("./Visitor");
const { AgentBuilder, EntityBuilder, IntentBuilder } = require("../builder");

/**
 * Build the contents for all the files
 */
class Builder extends Visitor {
  constructor(languages, entityNames) {
    super();
    this.languages = languages;
    this.entityNames = entityNames;
  }

  visitAgent(agent) {
    agent.builder = new AgentBuilder(agent.data);
    agent.builder.build();
  }

  visitEntity(entity) {
    entity.builder = new EntityBuilder(entity.data, this.languages);
    entity.builder.build();
  }

  visitIntent(intent) {
    intent.builder = new IntentBuilder(intent.data, this.languages, this.entityNames);
    intent.builder.build();
  }
}

module.exports = Builder;
