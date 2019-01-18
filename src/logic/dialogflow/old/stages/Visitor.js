/* eslint-disable */

/**
 * Should be an abstract class!
 * Simple visitor base class
 */
class Visitor {
  // Don't need this one  because we keep intents, entities and agent separate
  // visit(it) {
  //   it.accept(this);
  // }

  /**
   * @param agent {Agent}
   */
  visitAgent(agent) {
    // Implement in sub class
  }

  /**
   * @param entity {Entity}
   */
  visitEntity(entity) {
    // Implement in sub class
  }

  /**
   * @param intent {Intent}
   */
  visitIntent(intent) {
    // Implement in sub class
  }
}

module.exports = Visitor;
