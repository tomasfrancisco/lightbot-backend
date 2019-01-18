const {
  Builder,
  ConversationFlow,
  FileValidator,
  PostProcess,
  TransformedValidator,
  Transformer,
  Writer,
} = require("./stages");
const { Agent, Entity, Intent } = require("./models");
const { FileUtil } = require("./util");
const _ = require("lodash");

/**
 * Process manager
 * Defines the order in which the processing classes get called.
 */
class Converter {
  constructor() {
    this.inputDirectory = "";
    this.outputDirectory = "";

    this.rawData = {
      agent: {},
      intents: [],
      entities: [],
      context: {},
    };

    this.data = {
      agent: {},
      intents: [],
      entities: [],
    };

    /**
     * Extra data can be used for in memory runs or other non stand-alone runs
     */
    this.extraData = {};
  }

  static run(inputDirectories, outputDirectory) {
    inputDirectories = inputDirectories.map(it => {
      if (!it.endsWith("/")) {
        return `${it}/`;
      }
      return it;
    });

    if (_.isNil(outputDirectory)) {
      outputDirectory = `${inputDirectories[0]}output/`;
    }
    if (!outputDirectory.endsWith("/")) {
      outputDirectory = `${outputDirectory}/`;
    }

    const converter = new Converter();
    [converter.inputDirectory] = inputDirectories;
    converter.outputDirectory = outputDirectory;

    converter.rawData = {
      agent: new Agent(FileUtil.getAgentFile(converter.inputDirectory)),
      context: _.merge(...inputDirectories.map(it => FileUtil.getContextFile(it))),
      intents: [],
      entities: [],
    };

    inputDirectories.forEach(dir => {
      converter.rawData.intents.push(
        ...FileUtil.getIntents(dir).map(intent => new Intent(intent)),
      );
      converter.rawData.entities.push(
        ...FileUtil.getEntities(dir).map(entity => new Entity(entity)),
      );
    });

    converter
      .convert()
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.error("Non-catched error:", err);
      });
  }

  static runFromData(data, outputDir) {
    const converter = new Converter();

    converter.outputDirectory = outputDir;
    converter.extraData = {
      gcpData: data.gcpData,
    };
    converter.rawData = {
      agent: new Agent(data.agent),
      context: data.context,
      intents: data.intents.map(it => new Intent(it)),
      entities: data.entities.map(it => new Entity(it)),
    };

    return new Promise((resolve, reject) => {
      try {
        converter.convert().then(resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * The 'brain'
   */
  convert() {
    console.log("Starting conversions.");

    // Validation
    const fileValidator = new FileValidator();
    this.visitRaw(fileValidator);

    // Normalize and generation
    console.log("Transforming and normalizing intents and entities");
    const transformer = new Transformer();
    this.data.agent = this.rawData.agent.accept(transformer);

    this.rawData.entities.forEach(it => {
      this.data.entities.push(...it.accept(transformer));
    });

    this.rawData.intents.forEach(it => {
      this.data.intents.push(...it.accept(transformer));
    });

    // Context and parents
    console.log("Building and writing files");
    const conversationFlow = new ConversationFlow(
      this.rawData.context,
      this.data.intents,
    );
    this.visit(conversationFlow);

    const entityNames = this.data.entities.map(it => it.getName());

    const steps = [
      new TransformedValidator(),
      new Builder(this.data.agent.languages, entityNames),
    ];

    steps.push(new Writer(this.outputDirectory));
    steps.forEach(it => this.visit(it));
    return PostProcess.run(this.outputDirectory, this.data.agent.data, this.extraData);
  }

  visitRaw(visitor) {
    this.rawData.agent.accept(visitor);

    this.rawData.intents.forEach(it => it.accept(visitor));
    this.rawData.entities.forEach(it => it.accept(visitor));
  }

  visit(visitor) {
    this.data.agent.accept(visitor);
    this.data.intents.forEach(it => it.accept(visitor));
    this.data.entities.forEach(it => it.accept(visitor));
  }
}

module.exports = Converter;
