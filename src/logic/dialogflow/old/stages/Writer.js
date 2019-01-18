const Visitor = require("./Visitor");
const { FileUtil } = require("../util");

/**
 * Write all generated json to the output directory
 */
class Writer extends Visitor {
  constructor(outputDir) {
    super();
    this.outputDirectory = outputDir;

    this.prepareOutputDirectory();
  }

  visitAgent(agent) {
    agent.builder.writeToFile(this.outputDirectory);
  }

  visitEntity(entity) {
    entity.builder.writeToFile(this.outputDirectory);
  }

  visitIntent(intent) {
    intent.builder.writeToFile(this.outputDirectory);
  }

  prepareOutputDirectory() {
    FileUtil.prepareOutputDir(this.outputDirectory);
  }
}

module.exports = Writer;
