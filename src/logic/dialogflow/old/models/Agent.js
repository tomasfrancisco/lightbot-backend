class Agent {
  constructor(fileData) {
    this.fileData = fileData;

    this.data = {};

    /**
     * @type {AgentBuilder}
     */
    this.builder = null;
  }

  get languages() {
    return this.data.languages || [];
  }

  get name() {
    // eslint-disable-next-line no-undefined
    return this.data.name || undefined;
  }

  accept(visitor) {
    return visitor.visitAgent(this);
  }
}

module.exports = Agent;
