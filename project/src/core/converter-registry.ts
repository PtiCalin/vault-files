import {
  DocumentFormat,
  DocumentContent,
  ConversionOptions,
  ConversionResult,
  IConverter,
} from '@types/index'
import { createLogger } from '@lib/index'

const logger = createLogger('ConverterRegistry')

/**
 * Registry for managing document converters
 */
export class ConverterRegistry {
  private converters: Map<DocumentFormat, IConverter> = new Map()
  private conversionPaths: Map<DocumentFormat, Set<DocumentFormat>> = new Map()

  /**
   * Register a converter for a format
   */
  register(format: DocumentFormat, converter: IConverter): void {
    this.converters.set(format, converter)
    logger.info('Converter registered', { format })

    // Build conversion paths
    this.updateConversionPaths()
  }

  /**
   * Get converter for a format
   */
  get(format: DocumentFormat): IConverter | undefined {
    return this.converters.get(format)
  }

  /**
   * Check if conversion path exists
   */
  canConvert(from: DocumentFormat, to: DocumentFormat): boolean {
    const paths = this.conversionPaths.get(from)
    return paths?.has(to) || false
  }

  /**
   * Get all supported source formats
   */
  getSupportedFormats(): DocumentFormat[] {
    return Array.from(this.converters.keys())
  }

  /**
   * Get supported target formats for a source format
   */
  getSupportedTargets(sourceFormat: DocumentFormat): DocumentFormat[] {
    const paths = this.conversionPaths.get(sourceFormat)
    return paths ? Array.from(paths) : []
  }

  /**
   * Update conversion paths based on registered converters
   */
  private updateConversionPaths(): void {
    this.conversionPaths.clear()

    // For each converter, check what formats it supports
    for (const [sourceFormat, converter] of this.converters.entries()) {
      const targets = new Set<DocumentFormat>()

      // Check all possible target formats
      for (const targetFormat of Object.values(DocumentFormat)) {
        if (converter.supports(targetFormat)) {
          targets.add(targetFormat)
        }
      }

      this.conversionPaths.set(sourceFormat, targets)
    }

    logger.debug('Conversion paths updated', {
      paths: Array.from(this.conversionPaths.entries()).map(([from, targets]) => ({
        from,
        targets: Array.from(targets),
      })),
    })
  }
}

/**
 * Global converter registry instance
 */
export const converterRegistry = new ConverterRegistry()
