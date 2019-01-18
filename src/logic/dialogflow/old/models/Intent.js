class Intent {
  constructor(fileData) {
    this.fileData = fileData;

    this.data = {};

    /**
     * @type {IntentBuilder}
     */
    this.builder = null;
  }

  accept(visitor) {
    return visitor.visitIntent(this);
  }
}

module.exports = Intent;
