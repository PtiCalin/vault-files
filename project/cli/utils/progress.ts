import chalk from "chalk";
import ora, { Ora } from "ora";

/**
 * Progress indicator for CLI operations
 */
export class ProgressIndicator {
  private spinner: Ora | null = null;
  private startTime: number = 0;

  /**
   * Start progress indicator
   */
  start(message: string): void {
    this.startTime = Date.now();
    this.spinner = ora({
      text: message,
      color: "cyan",
    }).start();
  }

  /**
   * Update progress message
   */
  update(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  /**
   * Mark operation as successful
   */
  succeed(message?: string): void {
    if (this.spinner) {
      const elapsed = this.getElapsedTime();
      const finalMessage = message
        ? `${message} ${chalk.gray(`(${elapsed})`)}`
        : `${this.spinner.text} ${chalk.gray(`(${elapsed})`)}`;
      this.spinner.succeed(finalMessage);
      this.spinner = null;
    }
  }

  /**
   * Mark operation as failed
   */
  fail(message?: string): void {
    if (this.spinner) {
      const elapsed = this.getElapsedTime();
      const finalMessage = message
        ? `${message} ${chalk.gray(`(${elapsed})`)}`
        : `${this.spinner.text} ${chalk.gray(`(${elapsed})`)}`;
      this.spinner.fail(finalMessage);
      this.spinner = null;
    }
  }

  /**
   * Mark operation as warned
   */
  warn(message?: string): void {
    if (this.spinner) {
      const elapsed = this.getElapsedTime();
      const finalMessage = message
        ? `${message} ${chalk.gray(`(${elapsed})`)}`
        : `${this.spinner.text} ${chalk.gray(`(${elapsed})`)}`;
      this.spinner.warn(finalMessage);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner without status
   */
  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * Get elapsed time since start
   */
  private getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    if (elapsed < 1000) {
      return `${elapsed}ms`;
    }
    return `${(elapsed / 1000).toFixed(2)}s`;
  }
}

/**
 * Multi-step progress tracker
 */
export class MultiStepProgress {
  private steps: Array<{
    name: string;
    status: "pending" | "running" | "done" | "failed";
  }> = [];
  private currentIndex: number = -1;

  constructor(steps: string[]) {
    this.steps = steps.map((name) => ({ name, status: "pending" }));
  }

  /**
   * Start next step
   */
  nextStep(): void {
    if (this.currentIndex >= 0) {
      this.steps[this.currentIndex]!.status = "done";
    }
    this.currentIndex++;
    if (this.currentIndex < this.steps.length) {
      this.steps[this.currentIndex]!.status = "running";
      this.render();
    }
  }

  /**
   * Mark current step as failed
   */
  failCurrentStep(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
      this.steps[this.currentIndex]!.status = "failed";
      this.render();
    }
  }

  /**
   * Render progress
   */
  private render(): void {
    console.log();
    this.steps.forEach((step, index) => {
      let icon = chalk.gray("○");
      let text = chalk.gray(step.name);

      if (step.status === "running") {
        icon = chalk.cyan("◉");
        text = chalk.cyan(step.name);
      } else if (step.status === "done") {
        icon = chalk.green("✓");
        text = chalk.gray(step.name);
      } else if (step.status === "failed") {
        icon = chalk.red("✗");
        text = chalk.red(step.name);
      }

      console.log(`${icon} ${text}`);
    });
  }
}
