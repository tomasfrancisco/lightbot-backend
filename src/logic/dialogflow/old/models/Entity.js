class Entity {
  constructor(fileData) {
    this.fileData = fileData;

    this.data = {};

    /**
     * @type {EntityBuilder}
     */
    this.builder = null;
  }

  accept(visitor) {
    return visitor.visitEntity(this);
  }

  getName() {
    return this.data.name;
  }
}

module.exports = Entity;
