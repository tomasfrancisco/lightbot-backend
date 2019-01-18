const Builder = require("./Builder");
const _ = require("lodash");
const { FileUtil } = require("../util");
const JsonManipulator = require("./JsonManipulator");

/**
 * Build entity and entity language files.
 */
class EntityBuilder extends Builder {
  constructor(entity, agentLanguages) {
    super();

    this.entity = { ...entity };
    this.agentLanguages = agentLanguages;

    this.entityFile = {};
    this.entityLangFiles = {};
  }

  build() {
    this.buildEntityFile();
    this.buildLanguageFiles();
  }

  buildEntityFile() {
    this.entityFile = {
      name: this.entity.name,
      isOverridable: true,
      isEnum: false,
      automatedExpansion: this.entity.autoExpand || false,
    };
  }

  /**
   * Pass every  'key' in an entity to createWithLanguage separately
   */
  buildLanguageFiles() {
    const keys = { ...this.entity };
    if (!_.isNil(keys.autoExpand)) {
      delete keys.autoExpand;
    }
    delete keys.name;

    for (const key in keys) {
      if (!Object.hasOwnProperty.call(keys, key)) {
        continue;
      }

      const values = JsonManipulator.normalizeLanguage(this.agentLanguages, keys[key]);
      for (const langKey in values) {
        if (!Object.hasOwnProperty.call(values, langKey)) {
          continue;
        }
        this.createWithLanguage(langKey, key, values[langKey]);
      }
    }
  }

  createWithLanguage(language, key, values) {
    this.prepareLanguageFileData(language);

    const obj = {
      value: key,
      synonyms: [...values, key],
    };
    this.entityLangFiles[language].push(obj);
  }

  prepareLanguageFileData(language) {
    if (_.isNil(this.entityLangFiles[language])) {
      this.entityLangFiles[language] = [];
    }
  }

  writeToFile(outputDirectory) {
    const dir = `${outputDirectory}entities/`;
    FileUtil.writeToFile(`${dir}${this.entity.name}.json`, this.entityFile);

    for (const key in this.entityLangFiles) {
      if (!Object.hasOwnProperty.call(this.entityLangFiles, key)) {
        continue;
      }
      FileUtil.writeToFile(
        `${dir}${this.entity.name}_entries_${key}.json`,
        this.entityLangFiles[key],
      );
    }
  }
}

module.exports = EntityBuilder;
