const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const rimraf = require("rimraf");
const { logger } = require("~/logger");


function getFileAndParse(filename) {
  let data = null;
  try {
    data = fs.readFileSync(`${filename}`, "utf8").toString();
  } catch (e) {
    logger.log(`Could not read: ${filename}`);
    return {};
  }
  return yaml.safeLoad(data, { filename });
}

function getDirectoryAndParse(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(it => path.extname(it) === ".yaml" || path.extname(it) === ".yml")
    .map(it => {
      const parsed = path.parse(it);
      return getFileAndParse(dir + parsed.name + parsed.ext);
    });
}

function writeToFile(file, value) {
  return fs.writeFileSync(file, JSON.stringify(value, null, "  "), "utf8");
}

module.exports = {
  getAgentFile: dir => getFileAndParse(`${dir}agent.yaml`),

  getContextFile: dir => getFileAndParse(`${dir}context.yaml`),

  getIntents: dir => getDirectoryAndParse(`${dir}stories/`),

  getEntities: dir => getDirectoryAndParse(`${dir}entities/`),

  prepareOutputDir: dir => {
    if (dir === "." || dir === "/" || dir === __dirname) {
      throw new Error(`Not going to put files in ${dir}.`);
    }
    rimraf.sync(dir);
    fs.mkdirSync(dir);
    fs.mkdirSync(`${dir}entities/`);
    fs.mkdirSync(`${dir}intents/`);
    writeToFile(`${dir}/package.json`, { version: "1.0.0" });
  },

  writeToFile,

  getFileAndParse,
  getDirectoryAndParse,
};
