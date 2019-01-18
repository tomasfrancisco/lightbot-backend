const { isEmpty } = require("lodash");

const program = require("commander");

const packageJSON = require("../package");
const Converter = require("./Converter");

program.version(packageJSON.version).description(packageJSON.description);

program
  .command("agent <inputDir> [otherDirs...]")
  .action((inputDir, otherDirs, commandOptions) => {
    const input = [inputDir, ...(otherDirs || [])];
    const output = commandOptions.outputDirectory;

    if (isEmpty(input)) {
      commandOptions.outputHelp();
      return;
    }
    Converter.run(input, output);
  })
  // Using the first input directory if output directory is not defined
  .option(
    "-o, --output-directory [dir]",
    "Specify the output directory for the agent files",
  )
  .option("--write-ts", "Write a ts file for this agent.")
  .option("--skip-setup", "Skip file setup...")
  .description("Convert a complete agent to JSON");

program.parse(process.argv);
