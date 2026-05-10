import { ConversionOptions, convertDocument, DocumentFormat } from "@/index";
import { FileUtils } from "@lib/file-utils";
import { Command } from "commander";
import path from "path";
import { createCLILogger, ProgressIndicator } from "../utils";

const logger = createCLILogger("convert");

/**
 * Convert command options
 */
interface ConvertOptions {
  output?: string;
  format?: string;
  quality?: "low" | "medium" | "high";
  compress?: boolean;
  preserveFormatting?: boolean;
  pageRanges?: string;
  password?: string;
  verbose?: boolean;
}

/**
 * Convert command implementation
 */
export function createConvertCommand(): Command {
  return new Command("convert")
    .description("Convert a document from one format to another")
    .argument("<input>", "Input file path")
    .argument(
      "[output]",
      "Output file path (optional, auto-generated if not provided)",
    )
    .option(
      "-f, --format <format>",
      "Target format (pdf, md, html, docx, pptx, txt)",
    )
    .option(
      "-q, --quality <quality>",
      "Conversion quality: low, medium, high",
      "medium",
    )
    .option("-c, --compress", "Compress output file", false)
    .option("--preserve-formatting", "Preserve original formatting", true)
    .option("-p, --page-ranges <ranges>", 'Page ranges (e.g., "1-5,7,9-12")')
    .option("--password <password>", "Password for protected documents")
    .option("-v, --verbose", "Verbose output", false)
    .action(
      async (
        input: string,
        output: string | undefined,
        options: ConvertOptions,
      ) => {
        const progress = new ProgressIndicator();

        try {
          // Validate input file exists
          progress.start("Validating input file...");
          const inputInfo = await FileUtils.getFileInfo(input);
          progress.succeed(
            `Input: ${inputInfo.name} (${inputInfo.format}, ${formatFileSize(inputInfo.size)})`,
          );

          // Determine output path and format
          let outputPath: string;
          let targetFormat: DocumentFormat;

          if (output) {
            outputPath = output;
            const ext = path.extname(output).slice(1);
            targetFormat = FileUtils.getFormatFromExtension(ext);
          } else if (options.format) {
            targetFormat = FileUtils.getFormatFromExtension(options.format);
            outputPath = FileUtils.generateOutputFilename(input, targetFormat);
          } else {
            throw new Error("Either output path or --format must be specified");
          }

          logger.step(`Converting ${inputInfo.format} → ${targetFormat}`);

          // Build conversion options
          const conversionOptions: ConversionOptions = {
            quality: options.quality,
            compress: options.compress,
            preserveFormatting: options.preserveFormatting,
            pageRanges: options.pageRanges,
            password: options.password,
          };

          if (options.verbose) {
            logger.debug("Conversion options", conversionOptions);
          }

          // Perform conversion
          progress.start(`Converting to ${targetFormat}...`);
          const result = await convertDocument(
            input,
            outputPath,
            conversionOptions,
          );

          if (result.success) {
            const outputInfo = await FileUtils.getFileInfo(outputPath);
            progress.succeed(
              `Converted successfully → ${outputInfo.name} (${formatFileSize(outputInfo.size)})`,
            );

            if (result.processingTime) {
              logger.info(
                `Processing time: ${(result.processingTime / 1000).toFixed(2)}s`,
              );
            }

            if (result.warnings && result.warnings.length > 0) {
              logger.warn("Warnings during conversion:");
              result.warnings.forEach((warning) =>
                console.log(`  - ${warning}`),
              );
            }
          } else {
            progress.fail("Conversion failed");
            if (result.error) {
              logger.error("Error:", result.error);
            }
            process.exit(1);
          }
        } catch (error) {
          progress.fail("Conversion failed");
          logger.error("Error:", error as Error);
          process.exit(1);
        }
      },
    );
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
