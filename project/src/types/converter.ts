import {
  DocumentFormat,
  DocumentContent,
  ConversionOptions,
  ConversionResult,
} from './document'

/**
 * Base converter interface that all format converters must implement
 */
export interface IConverter {
  /**
   * Convert from one format to another
   */
  convert(
    input: Buffer | string,
    targetFormat: DocumentFormat,
    options?: ConversionOptions
  ): Promise<ConversionResult>

  /**
   * Parse document content
   */
  parse(input: Buffer | string): Promise<DocumentContent>

  /**
   * Check if converter supports a format
   */
  supports(format: DocumentFormat): boolean
}

/**
 * Document processor interface
 */
export interface IDocumentProcessor {
  /**
   * Process document with given operations
   */
  process(input: Buffer | string, operations: ProcessOperation[]): Promise<ConversionResult>

  /**
   * Validate document format
   */
  validate(input: Buffer | string): Promise<boolean>

  /**
   * Extract metadata from document
   */
  extractMetadata(input: Buffer | string): Promise<DocumentMetadata>
}

/**
 * Processing operation types
 */
export enum OperationType {
  CONVERT = 'convert',
  COMPRESS = 'compress',
  MERGE = 'merge',
  SPLIT = 'split',
  EXTRACT = 'extract',
  WATERMARK = 'watermark',
  OCR = 'ocr',
  OPTIMIZE = 'optimize',
}

/**
 * Processing operation
 */
export interface ProcessOperation {
  type: OperationType
  options?: Record<string, unknown>
}

/**
 * File info
 */
export interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  mimeType: string
  format: DocumentFormat
}

import { DocumentMetadata } from './document'
