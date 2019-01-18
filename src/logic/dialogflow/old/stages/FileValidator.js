const Visitor = require("./Visitor");
const { Validator } = require("../util");

/**
 * Validate every file with Joi
 */
class FileValidator extends Visitor {
  visitAgent(agent) {
    Validator.agentFile(agent.fileData);
  }

  visitEntity(entity) {
    Validator.entityFile(entity.fileData);
  }

  visitIntent(intent) {
    Validator.intentFile(intent.fileData);
  }
}

module.exports = FileValidator;
