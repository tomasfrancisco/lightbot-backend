const Visitor = require("./Visitor");
const { Validator } = require("../util");

/**
 * Validate a few smaller things after transformation and normalization
 */
class TransformedValidator extends Visitor {
  visitAgent(agent) {
    Validator.agentTransformed(agent.data);
  }

  visitEntity(entity) {
    Validator.entityTransformed(entity.data);
  }

  visitIntent(intent) {
    Validator.intentTransformed(intent.data);
  }
}

module.exports = TransformedValidator;
