import { DocumentFormat, ValidationError } from '@types/index'

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate buffer is not empty
   */
  static validateBuffer(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) {
      throw new ValidationError('Input buffer is empty or invalid')
    }
  }

  /**
   * Validate format is supported
   */
  static validateFormat(format: DocumentFormat, supportedFormats: DocumentFormat[]): void {
    if (!supportedFormats.includes(format)) {
      throw new ValidationError(
        `Format ${format} is not supported. Supported formats: ${supportedFormats.join(', ')}`
      )
    }
  }

  /**
   * Validate conversion path exists
   */
  static validateConversionPath(
    sourceFormat: DocumentFormat,
    targetFormat: DocumentFormat,
    supportedPaths: Map<DocumentFormat, DocumentFormat[]>
  ): void {
    const targets = supportedPaths.get(sourceFormat)
    if (!targets || !targets.includes(targetFormat)) {
      throw new ValidationError(
        `Conversion from ${sourceFormat} to ${targetFormat} is not supported`
      )
    }
  }

  /**
   * Validate page range format
   */
  static validatePageRange(pageRange: string, totalPages: number): number[] {
    const pages: number[] = []
    const parts = pageRange.split(',')

    for (const part of parts) {
      const trimmed = part.trim()

      // Single page
      if (/^\d+$/.test(trimmed)) {
        const page = parseInt(trimmed, 10)
        if (page < 1 || page > totalPages) {
          throw new ValidationError(`Page ${page} is out of range (1-${totalPages})`)
        }
        pages.push(page)
        continue
      }

      // Page range (e.g., "1-5")
      if (/^\d+-\d+$/.test(trimmed)) {
        const [start, end] = trimmed.split('-').map((n) => parseInt(n, 10))
        if (start < 1 || end > totalPages || start > end) {
          throw new ValidationError(
            `Page range ${start}-${end} is invalid (total pages: ${totalPages})`
          )
        }
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        continue
      }

      throw new ValidationError(`Invalid page range format: ${trimmed}`)
    }

    return [...new Set(pages)].sort((a, b) => a - b)
  }

  /**
   * Validate quality option
   */
  static validateQuality(quality: string): void {
    const validQualities = ['low', 'medium', 'high']
    if (!validQualities.includes(quality)) {
      throw new ValidationError(
        `Invalid quality: ${quality}. Must be one of: ${validQualities.join(', ')}`
      )
    }
  }

  /**
   * Validate DPI value
   */
  static validateDPI(dpi: number): void {
    if (dpi < 72 || dpi > 600) {
      throw new ValidationError(`DPI must be between 72 and 600, got: ${dpi}`)
    }
  }
}
