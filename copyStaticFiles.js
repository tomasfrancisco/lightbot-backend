const { join, dirname } = require("path");
const fs = require("fs");

const schemaFile = "@lightbot/schema.graphql";

[schemaFile].forEach(copyFile);

function copyFile(partialPath) {
  const fileContents = fs.readFileSync(join("./src/", partialPath));

  const writePath = join("./build/", partialPath);
  try {
    fs.mkdirSync(dirname(writePath));
  } catch (e) {} // Probably already exists

  fs.writeFileSync(writePath, fileContents);
}
