import { promises as fs } from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import mime from 'mime-types'
import {
  DocumentFormat,
  FileInfo,
  FileNotFoundError,
  ValidationError,
  UnsupportedFormatError,
} from '@types/index'

/**
 * File utility functions for document processing
 */
export class FileUtils {
  /**
   * Read file as buffer
   */
  static async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath)
    } catch (error) {
      throw new FileNotFoundError(`Failed to read file: ${filePath}`, filePath)
    }
  }

  /**
   * Write buffer to file
   */
  static async writeFile(filePath: string, data: Buffer): Promise<void> {
    try {
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filePath, data)
    } catch (error) {
      throw new ValidationError(`Failed to write file: ${filePath}`)
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.stat(filePath)
      const buffer = await fs.readFile(filePath)
      const fileType = await fileTypeFromBuffer(buffer)

      const name = path.basename(filePath)
      const extension = path.extname(filePath).slice(1)
      const mimeType = mime.lookup(filePath) || 'application/octet-stream'
      const format = this.getFormatFromExtension(extension)

      return {
        path: filePath,
        name,
        extension,
        size: stats.size,
        mimeType: fileType?.mime || mimeType,
        format,
      }
    } catch (error) {
      throw new FileNotFoundError(`Failed to get file info: ${filePath}`, filePath)
    }
  }

  /**
   * Detect document format from buffer
   */
  static async detectFormat(buffer: Buffer): Promise<DocumentFormat> {
    const fileType = await fileTypeFromBuffer(buffer)

    if (fileType?.mime === 'application/pdf') {
      return DocumentFormat.PDF
    }

    if (
      fileType?.mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return DocumentFormat.DOCX
    }

    if (
      fileType?.mime ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return DocumentFormat.PPTX
    }

    // Check for text-based formats by content
    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 1024))

    if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
      return DocumentFormat.HTML
    }

    if (text.match(/^#\s+.+/m) || text.includes('```')) {
      return DocumentFormat.MARKDOWN
    }

    // Default to text
    return DocumentFormat.TXT
  }

  /**
   * Get format from file extension
   */
  static getFormatFromExtension(extension: string): DocumentFormat {
    const ext = extension.toLowerCase()

    const formatMap: Record<string, DocumentFormat> = {
      pdf: DocumentFormat.PDF,
      md: DocumentFormat.MARKDOWN,
      markdown: DocumentFormat.MARKDOWN,
      docx: DocumentFormat.DOCX,
      pptx: DocumentFormat.PPTX,
      html: DocumentFormat.HTML,
      htm: DocumentFormat.HTML,
      txt: DocumentFormat.TXT,
      epub: DocumentFormat.EPUB,
      rtf: DocumentFormat.RTF,
      odt: DocumentFormat.ODT,
      jpg: DocumentFormat.JPG,
      jpeg: DocumentFormat.JPG,
      png: DocumentFormat.PNG,
      tiff: DocumentFormat.TIFF,
      tif: DocumentFormat.TIFF,
      svg: DocumentFormat.SVG,
      webp: DocumentFormat.WEBP,
    }

    const format = formatMap[ext]
    if (!format) {
      throw new UnsupportedFormatError(`Unsupported file extension: ${extension}`, extension)
    }

    return format
  }

  /**
   * Validate file size
   */
  static validateFileSize(buffer: Buffer, maxSizeMB = 100): void {
    const sizeMB = buffer.length / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      throw new ValidationError(
        `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
      )
    }
  }

  /**
   * Generate output filename
   */
  static generateOutputFilename(
    inputPath: string,
    targetFormat: DocumentFormat,
    suffix = ''
  ): string {
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const outputName = suffix ? `${baseName}${suffix}.${targetFormat}` : `${baseName}.${targetFormat}`
    return path.join(path.dirname(inputPath), outputName)
  }
}
