#!/usr/bin/env node

import { getSupportedFormats } from "@/index";
import chalk from "chalk";
import { Command } from "commander";
import {
  createBatchCommand,
  createConvertCommand,
  createInfoCommand,
} from "../commands";

// Package info
const packageJson = require("../../../packages/package.json");

/**
 * Main CLI program
 */
const program = new Command();

program
  .name("vf")
  .description(
    "vault-files - The ultimate document conversion & management CLI",
  )
  .version(packageJson.version, "-v, --version", "Output the version number")
  .helpOption("-h, --help", "Display help information");

// Add banner
program.addHelpText(
  "beforeAll",
  `
${chalk.bold.cyan("vault-files")} ${chalk.gray(`v${packageJson.version}`)}
${chalk.gray("━".repeat(50))}
${chalk.gray("The ultimate document conversion & management platform")}
${chalk.gray("━".repeat(50))}
`,
);

// Add supported formats info
program.addHelpText(
  "after",
  `
${chalk.bold("Supported Formats:")}
  ${getSupportedFormats().join(", ")}

${chalk.bold("Examples:")}
  $ vf convert document.pdf document.md
  $ vf convert input.md output.html -f html
  $ vf info document.pdf
  $ vf batch "*.md" --to pdf --output ./output
  $ vf convert doc.pdf --page-ranges "1-5,7" output.pdf

${chalk.bold("Environment Variables:")}
  DEBUG=1              Enable debug output
  NODE_ENV=development Enable development mode

${chalk.gray("For more information, visit:")}
${chalk.cyan("https://github.com/PtiCalin/vault-files")}
`,
);

// Register commands
program.addCommand(createConvertCommand());
program.addCommand(createInfoCommand());
program.addCommand(createBatchCommand());

// Handle unknown commands
program.on("command:*", () => {
  console.error(chalk.red("✗"), "Invalid command:", program.args.join(" "));
  console.log(
    chalk.gray("Run"),
    chalk.cyan("vf --help"),
    chalk.gray("for available commands"),
  );
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
