const { join, dirname } = require("path");
const fs = require("fs");

const schemaFile = {
  src: "./node_modules/lightbot-ssot/schema.graphql",
  dest: "./build/schema.graphql"
};

[schemaFile].forEach(copyFile);

function copyFile(partialPath) {
  const fileContents = fs.readFileSync(partialPath.src);

  const writePath = join(partialPath.dest);
  try {
    fs.mkdirSync(dirname(writePath));
  } catch (e) {} // Probably already exists

  fs.writeFileSync(writePath, fileContents);
}
