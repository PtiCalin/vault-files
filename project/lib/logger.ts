/**
 * Logger utility for structured logging
 */
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(this.formatMessage('INFO', message, meta))
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatMessage('WARN', message, meta))
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const errorMeta = error
      ? {
          ...meta,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }
      : meta

    console.error(this.formatMessage('ERROR', message, errorMeta))
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, meta))
    }
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}
