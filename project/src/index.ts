/**
 * vault-files - The ultimate file conversion & document management ecosystem
 * Main entry point
 */

import { DocumentProcessor, converterRegistry } from './core'
import { PDFConverter, MarkdownConverter, DOCXConverter, PPTXConverter } from './converters'
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  DocumentContent,
  DocumentMetadata,
} from './types'
import { FileUtils, ValidationUtils, createLogger } from '@lib/index'

const logger = createLogger('VaultFiles')

/**
 * Initialize converters
 */
function initializeConverters(): void {
  converterRegistry.register(DocumentFormat.PDF, new PDFConverter())
  converterRegistry.register(DocumentFormat.MARKDOWN, new MarkdownConverter())
  converterRegistry.register(DocumentFormat.DOCX, new DOCXConverter())
  converterRegistry.register(DocumentFormat.PPTX, new PPTXConverter())

  logger.info('Converters initialized', {
    formats: converterRegistry.getSupportedFormats(),
  })
}

// Initialize on module load
initializeConverters()

/**
 * Convert a document from one format to another
 */
export async function convertDocument(
  inputPath: string,
  outputPath: string,
  options?: ConversionOptions
): Promise<ConversionResult> {
  logger.info('Converting document', { inputPath, outputPath, options })

  try {
    // Get input file info
    const fileInfo = await FileUtils.getFileInfo(inputPath)
    const targetFormat = FileUtils.getFormatFromExtension(
      outputPath.split('.').pop() || ''
    )

    // Get appropriate converter
    const converter = converterRegistry.get(fileInfo.format)
    if (!converter) {
      throw new Error(`No converter available for format: ${fileInfo.format}`)
    }

    // Validate conversion path
    if (!converterRegistry.canConvert(fileInfo.format, targetFormat)) {
      throw new Error(
        `Conversion from ${fileInfo.format} to ${targetFormat} is not supported`
      )
    }

    // Read input file
    const buffer = await FileUtils.readFile(inputPath)

    // Convert
    const result = await converter.convert(buffer, targetFormat, options)

    // Write output if successful
    if (result.success && result.outputBuffer) {
      await FileUtils.writeFile(outputPath, result.outputBuffer)
      result.outputPath = outputPath
    }

    return result
  } catch (error) {
    logger.error('Document conversion failed', error as Error)
    return {
      success: false,
      error: error as Error,
    }
  }
}

/**
 * Parse document and extract content
 */
export async function parseDocument(input: string | Buffer): Promise<DocumentContent> {
  logger.info('Parsing document')

  const buffer = typeof input === 'string' ? await FileUtils.readFile(input) : input
  const format = await FileUtils.detectFormat(buffer)

  const converter = converterRegistry.get(format)
  if (!converter) {
    throw new Error(`No parser available for format: ${format}`)
  }

  return converter.parse(buffer)
}

/**
 * Extract metadata from document
 */
export async function extractMetadata(input: string | Buffer): Promise<DocumentMetadata> {
  logger.info('Extracting metadata')

  const processor = new DocumentProcessor()
  return processor.extractMetadata(input)
}

/**
 * Validate document
 */
export async function validateDocument(input: string | Buffer): Promise<boolean> {
  logger.info('Validating document')

  const processor = new DocumentProcessor()
  return processor.validate(input)
}

/**
 * Get supported formats
 */
export function getSupportedFormats(): DocumentFormat[] {
  return converterRegistry.getSupportedFormats()
}

/**
 * Get supported conversion targets for a format
 */
export function getSupportedTargets(sourceFormat: DocumentFormat): DocumentFormat[] {
  return converterRegistry.getSupportedTargets(sourceFormat)
}

/**
 * Check if conversion is supported
 */
export function canConvert(from: DocumentFormat, to: DocumentFormat): boolean {
  return converterRegistry.canConvert(from, to)
}

// Export types and classes for advanced usage
export * from './types'
export * from './core'
export * from './converters'
export { FileUtils, ValidationUtils, createLogger } from '@lib/index'
