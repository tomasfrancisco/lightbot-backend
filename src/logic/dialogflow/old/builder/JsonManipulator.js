const _ = require("lodash");

class JsonManipulator {
  static getMainLanguage(languages) {
    return _.isArray(languages) && !_.isEmpty(languages) ? languages[0] : "nl";
  }

  /**
   * Create an object with the language as key and the value array.
   * normalizeLanguage(['nl'], ['Hi']) -> {nl: ['Hi']}
   * normalizeLanguage(['nl', 'en'], ['Hi']) -> Error
   * normalizeLanguage(['nl', 'en'], {nl: ['Hoi'], en: ['Hi']}) -> Correct
   */
  static normalizeLanguage(languages, data) {
    const mainLanguage = JsonManipulator.getMainLanguage(languages);

    if (_.isArray(data) && languages.length === 1) {
      return { [mainLanguage]: data };
    }
    if (_.isArray(data) && languages.length > 1) {
      throw new Error(
        "When defining multiple languages in agent.yaml, you got to fill them in everywhere.",
      );
    }

    for (const lang of languages) {
      if (_.isNil(data[lang]) || !_.isArray(data[lang])) {
        throw new Error(
          `Expecting to have multiple language definitions. Missing ${lang}`,
        );
      }
    }
    return data;
  }
}

module.exports = JsonManipulator;
