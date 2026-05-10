import { Logger } from "@lib/logger";
import chalk from "chalk";

/**
 * CLI-specific logger with colored output
 */
export class CLILogger extends Logger {
  constructor(context: string) {
    super(context);
  }

  /**
   * Log info message with green color
   */
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(chalk.green("✓"), message);
    if (meta && process.env.DEBUG) {
      console.log(chalk.gray(JSON.stringify(meta, null, 2)));
    }
  }

  /**
   * Log warning with yellow color
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(chalk.yellow("⚠"), message);
    if (meta) {
      console.warn(chalk.gray(JSON.stringify(meta, null, 2)));
    }
  }

  /**
   * Log error with red color
   */
  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    console.error(chalk.red("✗"), message);
    if (error) {
      console.error(chalk.red(error.message));
      if (process.env.DEBUG && error.stack) {
        console.error(chalk.gray(error.stack));
      }
    }
    if (meta) {
      console.error(chalk.gray(JSON.stringify(meta, null, 2)));
    }
  }

  /**
   * Log debug message with gray color
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
      console.log(chalk.gray("•"), chalk.gray(message));
      if (meta) {
        console.log(chalk.gray(JSON.stringify(meta, null, 2)));
      }
    }
  }

  /**
   * Log success message
   */
  success(message: string): void {
    console.log(chalk.green("✓"), chalk.bold(message));
  }

  /**
   * Log step in a process
   */
  step(message: string): void {
    console.log(chalk.blue("→"), message);
  }

  /**
   * Log header/title
   */
  header(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.gray("─".repeat(message.length)));
  }
}

/**
 * Create CLI logger instance
 */
export function createCLILogger(context: string): CLILogger {
  return new CLILogger(context);
}
