import { ConversionOptions, convertDocument, DocumentFormat } from "@/index";
import { FileUtils } from "@lib/file-utils";
import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";
import path from "path";
import { createCLILogger, ProgressIndicator } from "../utils";

const logger = createCLILogger("batch");

/**
 * Batch command options
 */
interface BatchOptions {
  to: string;
  output?: string;
  quality?: "low" | "medium" | "high";
  compress?: boolean;
  parallel?: number;
  verbose?: boolean;
}

/**
 * Batch convert command implementation
 */
export function createBatchCommand(): Command {
  return new Command("batch")
    .description("Batch convert multiple files")
    .argument("<pattern>", 'File pattern (e.g., "*.md", "docs/**/*.pdf")')
    .requiredOption(
      "--to <format>",
      "Target format (pdf, md, html, docx, pptx, txt)",
    )
    .option("-o, --output <dir>", "Output directory (default: same as input)")
    .option(
      "-q, --quality <quality>",
      "Conversion quality: low, medium, high",
      "medium",
    )
    .option("-c, --compress", "Compress output files", false)
    .option("-p, --parallel <count>", "Number of parallel conversions", "3")
    .option("-v, --verbose", "Verbose output", false)
    .action(async (pattern: string, options: BatchOptions) => {
      const progress = new ProgressIndicator();

      try {
        // Find matching files
        progress.start("Finding files...");
        const files = await glob(pattern, { nodir: true });

        if (files.length === 0) {
          progress.fail("No files found matching pattern");
          process.exit(1);
        }

        progress.succeed(`Found ${files.length} file(s)`);

        // Determine target format
        const targetFormat = FileUtils.getFormatFromExtension(options.to);

        // Process files
        logger.header("Batch Conversion");
        console.log(
          chalk.gray(`Converting ${files.length} files to ${targetFormat}...`),
        );
        console.log();

        const results: Array<{
          file: string;
          success: boolean;
          error?: Error;
        }> = [];
        const parallelCount = parseInt(options.parallel, 10);

        // Process in batches
        for (let i = 0; i < files.length; i += parallelCount) {
          const batch = files.slice(
            i,
            Math.min(i + parallelCount, files.length),
          );
          const batchResults = await Promise.all(
            batch.map((file) => processFile(file, targetFormat, options)),
          );
          results.push(...batchResults);

          // Log progress
          const completed = i + batch.length;
          console.log(chalk.gray(`Progress: ${completed}/${files.length}`));
        }

        // Summary
        console.log();
        logger.header("Summary");

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        console.log(chalk.green(`✓ Successful: ${successful}`));
        if (failed > 0) {
          console.log(chalk.red(`✗ Failed: ${failed}`));

          if (options.verbose) {
            console.log();
            console.log(chalk.red("Failed files:"));
            results
              .filter((r) => !r.success)
              .forEach((r) => {
                console.log(`  - ${r.file}`);
                if (r.error) {
                  console.log(chalk.gray(`    ${r.error.message}`));
                }
              });
          }
        }

        if (failed > 0) {
          process.exit(1);
        }
      } catch (error) {
        progress.fail("Batch conversion failed");
        logger.error("Error:", error as Error);
        process.exit(1);
      }
    });
}

/**
 * Process a single file
 */
async function processFile(
  filePath: string,
  targetFormat: DocumentFormat,
  options: BatchOptions,
): Promise<{ file: string; success: boolean; error?: Error }> {
  try {
    // Determine output path
    const outputDir = options.output || path.dirname(filePath);
    const outputPath = path.join(
      outputDir,
      path.basename(filePath, path.extname(filePath)) + `.${targetFormat}`,
    );

    // Build conversion options
    const conversionOptions: ConversionOptions = {
      quality: options.quality,
      compress: options.compress,
    };

    // Convert
    const result = await convertDocument(
      filePath,
      outputPath,
      conversionOptions,
    );

    if (result.success) {
      console.log(
        chalk.green("✓"),
        path.basename(filePath),
        "→",
        path.basename(outputPath),
      );
      return { file: filePath, success: true };
    } else {
      console.log(chalk.red("✗"), path.basename(filePath));
      return { file: filePath, success: false, error: result.error };
    }
  } catch (error) {
    console.log(chalk.red("✗"), path.basename(filePath));
    return { file: filePath, success: false, error: error as Error };
  }
}
