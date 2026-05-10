/**
 * Supported document formats for conversion
 */
export enum DocumentFormat {
  PDF = 'pdf',
  MARKDOWN = 'md',
  DOCX = 'docx',
  PPTX = 'pptx',
  HTML = 'html',
  TXT = 'txt',
  EPUB = 'epub',
  RTF = 'rtf',
  ODT = 'odt',
  JPG = 'jpg',
  PNG = 'png',
  TIFF = 'tiff',
  SVG = 'svg',
  WEBP = 'webp',
}

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  format: DocumentFormat
  pageCount?: number
  fileSize?: number
  language?: string
}

/**
 * Document content structure
 */
export interface DocumentContent {
  text: string
  pages?: Page[]
  images?: ImageData[]
  metadata: DocumentMetadata
}

/**
 * Page structure for multi-page documents
 */
export interface Page {
  number: number
  content: string
  images?: ImageData[]
  width?: number
  height?: number
}

/**
 * Image data structure
 */
export interface ImageData {
  data: Buffer
  format: string
  width: number
  height: number
  name?: string
}

/**
 * Conversion options
 */
export interface ConversionOptions {
  quality?: 'low' | 'medium' | 'high'
  preserveFormatting?: boolean
  embedFonts?: boolean
  compress?: boolean
  optimizeImages?: boolean
  downsampleImages?: number // DPI
  pageRanges?: string // e.g., "1-5,7,9-12"
  password?: string
  outputPath?: string
}

/**
 * Conversion result
 */
export interface ConversionResult {
  success: boolean
  outputPath?: string
  outputBuffer?: Buffer
  metadata?: DocumentMetadata
  error?: Error
  processingTime?: number
}

/**
 * PDF-specific options
 */
export interface PDFOptions extends ConversionOptions {
  mergePDFs?: boolean
  splitByPage?: boolean
  extractPages?: number[]
  addWatermark?: string
  permissions?: PDFPermissions
}

/**
 * PDF permissions
 */
export interface PDFPermissions {
  printing?: boolean
  modifying?: boolean
  copying?: boolean
  annotating?: boolean
}

/**
 * OCR options
 */
export interface OCROptions {
  language?: string | string[]
  tesseractPath?: string
  confidence?: number
}

/**
 * Compression options
 */
export interface CompressionOptions {
  level?: 'low' | 'medium' | 'high' | 'maximum'
  imageQuality?: number // 0-100
  grayscale?: boolean
  removeMetadata?: boolean
}
