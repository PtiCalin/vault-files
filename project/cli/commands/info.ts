import { extractMetadata } from "@/index";
import { FileUtils } from "@lib/file-utils";
import chalk from "chalk";
import { Command } from "commander";
import { createCLILogger, ProgressIndicator } from "../utils";

const logger = createCLILogger("info");

/**
 * Info command options
 */
interface InfoOptions {
  verbose?: boolean;
  json?: boolean;
}

/**
 * Info command implementation
 */
export function createInfoCommand(): Command {
  return new Command("info")
    .description("Display information about a document")
    .argument("<input>", "Input file path")
    .option("-v, --verbose", "Show detailed information", false)
    .option("-j, --json", "Output as JSON", false)
    .action(async (input: string, options: InfoOptions) => {
      const progress = new ProgressIndicator();

      try {
        // Get file info
        progress.start("Reading document...");
        const fileInfo = await FileUtils.getFileInfo(input);
        progress.succeed("Document loaded");

        // Extract metadata
        progress.start("Extracting metadata...");
        const metadata = await extractMetadata(input);
        progress.succeed("Metadata extracted");

        if (options.json) {
          // JSON output
          console.log(
            JSON.stringify(
              {
                file: fileInfo,
                metadata,
              },
              null,
              2,
            ),
          );
        } else {
          // Human-readable output
          logger.header("Document Information");

          console.log(chalk.bold("File:"));
          console.log(`  Name:       ${fileInfo.name}`);
          console.log(`  Path:       ${fileInfo.path}`);
          console.log(`  Format:     ${fileInfo.format}`);
          console.log(`  Size:       ${formatFileSize(fileInfo.size)}`);
          console.log(`  MIME Type:  ${fileInfo.mimeType}`);

          console.log();
          console.log(chalk.bold("Metadata:"));

          if (metadata.title) {
            console.log(`  Title:      ${metadata.title}`);
          }
          if (metadata.author) {
            console.log(`  Author:     ${metadata.author}`);
          }
          if (metadata.subject) {
            console.log(`  Subject:    ${metadata.subject}`);
          }
          if (metadata.keywords && metadata.keywords.length > 0) {
            console.log(`  Keywords:   ${metadata.keywords.join(", ")}`);
          }
          if (metadata.creator) {
            console.log(`  Creator:    ${metadata.creator}`);
          }
          if (metadata.producer) {
            console.log(`  Producer:   ${metadata.producer}`);
          }
          if (metadata.pageCount) {
            console.log(`  Pages:      ${metadata.pageCount}`);
          }
          if (metadata.creationDate) {
            console.log(
              `  Created:    ${metadata.creationDate.toLocaleString()}`,
            );
          }
          if (metadata.modificationDate) {
            console.log(
              `  Modified:   ${metadata.modificationDate.toLocaleString()}`,
            );
          }

          if (options.verbose) {
            console.log();
            console.log(chalk.bold("Additional Information:"));
            console.log(`  Format:     ${metadata.format}`);
            console.log(
              `  File Size:  ${formatFileSize(metadata.fileSize || 0)}`,
            );
          }
        }
      } catch (error) {
        progress.fail("Failed to read document");
        logger.error("Error:", error as Error);
        process.exit(1);
      }
    });
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
