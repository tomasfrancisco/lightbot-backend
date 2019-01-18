const Builder = require("./Builder");
const _ = require("lodash");
const { FileUtil } = require("../util");

/**
 * Build the agent file, uses loads of static values
 */
class AgentBuilder extends Builder {
  constructor(agent) {
    super();
    this.agent = agent;

    this.agentFile = {};
  }

  build() {
    // @Improve : Handle start and end intents
    this.agentFile = {
      description: this.agent.description || "",
      language: this.agent.languages[0],
      disableInteractionLogs: false,
      disableStackdriverLogs: true,
      googleAssistant: {
        googleAssistantCompatible: false,
        welcomeIntentSignInRequired: false,
        startIntents: [],
        systemIntents: [],
        endIntentIds: [],
        oAuthLinking: {
          required: false,
          grantType: "AUTH_CODE_GRANT",
        },
        voiceType: "MALE_1",
        capabilities: [],
        protocolVersion: "V2",
        isDeviceAgent: false,
      },
      defaultTimezone: "Europe/Madrid",
      webhook: {
        url: _.isPlainObject(this.agent.fulfillment) ? this.agent.fulfillment.url : "",
        headers: _.isPlainObject(this.agent.fulfillment)
          ? {
              Authorization: this.agent.fulfillment.authorization,
            }
          : {},
        available: _.isPlainObject(this.agent.fulfillment),
        useForDomains: _.isPlainObject(this.agent.fulfillment),
        cloudFunctionsEnabled: false,
        cloudFunctionsInitialized: false,
      },
      isPrivate: false,
      customClassifierMode: "use.after",
      mlMinConfidence: 0.6,

      // Need to copy the array before slicing it, else we loose the languages which we need for the intents
      supportedLanguages: [
        ...(this.agent.languages.length === 1 ? [] : [...this.agent.languages].splice(1)),
      ],
      onePlatformApiVersion: "v2",
    };
  }

  writeToFile(outputDirectory) {
    FileUtil.writeToFile(`${outputDirectory}/agent.json`, this.agentFile);
  }
}

module.exports = AgentBuilder;
