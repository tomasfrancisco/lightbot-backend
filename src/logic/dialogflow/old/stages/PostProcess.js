const archiver = require("archiver");
const _ = require("lodash");
const dialogflow = require("dialogflow");
const fs = require("fs");
const path = require("path");
const { logger } = require("~/logger");


/**
 * Some small post processing tasks
 */
class PostProcess {
  static run(outputDirectory, agent, extraData) {
    return PostProcess.zipOutput(outputDirectory, agent.name).then(zipPath => {
      if (_.isNil(agent.gcpProject) && _.isNil(extraData.gcpData)) {
        return;
      }
      logger.log("ZIP:", zipPath, "AgentData:", agent.gcpProject, extraData.gcpData);
      return PostProcess.upload(zipPath, agent.gcpProject, extraData.gcpData);
    });
  }

  static zipOutput(outputDirectory, agentName = "output") {
    logger.log("Zipping output...");
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(path.join(outputDirectory, `${agentName}.zip`));
      const archive = archiver("zip");

      output.on("close", () => {
        resolve(`${outputDirectory + agentName}.zip`);
      });

      archive.on("error", err => {
        logger.error(err);
        reject(err);
      });

      archive.pipe(output);
      // archive.directory(outputDirectory, false);
      archive.glob(`**/*.json`, { cwd: outputDirectory });
      archive.finalize();
    });
  }

  static upload(zipPath, project, gcpData) {
    logger.log("Uploading...");
    return new Promise((resolve, reject) => {
      const keyPath = _.isNil(gcpData)
        ? `${__dirname}../../../Upload${project}.json`
        : `${zipPath.substring(0, zipPath.lastIndexOf("/"))}/../tmp.json`;

      if (!_.isNil(gcpData)) {
        fs.writeFileSync(keyPath, JSON.stringify(gcpData), "utf8");
      }

      fs.readFile(zipPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const bufferedData = Buffer.from(data).toString("base64");

          const df = new dialogflow.v2.AgentsClient({ keyFilename: keyPath });
          df.restoreAgent(
            {
              parent: `projects/${project || gcpData.project_id}`,
              agentContent: bufferedData,
            },
            dfErr => {
              if (dfErr) {
                reject(dfErr);
              } else {
                logger.log("Done uploading!");
                resolve();
              }
            },
          );
        }
      });
    });
  }
}

module.exports = PostProcess;
