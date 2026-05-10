import { marked } from 'marked'
import {
  DocumentFormat,
  DocumentContent,
  ConversionOptions,
  ConversionResult,
  IConverter,
  DocumentMetadata,
  ConversionError,
} from '@types/index'
import { ValidationUtils, createLogger } from '@lib/index'

const logger = createLogger('MarkdownConverter')

/**
 * Markdown converter implementation
 * Handles Markdown parsing and conversion to other formats
 */
export class MarkdownConverter implements IConverter {
  /**
   * Convert Markdown to another format
   */
  async convert(
    input: Buffer | string,
    targetFormat: DocumentFormat,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now()
    logger.info('Starting Markdown conversion', { targetFormat, options })

    try {
      const text = typeof input === 'string' ? input : input.toString('utf-8')

      let outputBuffer: Buffer

      switch (targetFormat) {
        case DocumentFormat.HTML:
          outputBuffer = await this.markdownToHTML(text, options)
          break
        case DocumentFormat.TXT:
          outputBuffer = await this.markdownToText(text, options)
          break
        case DocumentFormat.PDF:
          throw new ConversionError(
            'Markdown to PDF conversion requires PDF converter',
            DocumentFormat.MARKDOWN,
            DocumentFormat.PDF
          )
        default:
          throw new ConversionError(
            `Conversion from Markdown to ${targetFormat} not yet implemented`,
            DocumentFormat.MARKDOWN,
            targetFormat
          )
      }

      return {
        success: true,
        outputBuffer,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      logger.error('Markdown conversion failed', error as Error)
      return {
        success: false,
        error: error as Error,
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Parse Markdown content
   */
  async parse(input: Buffer | string): Promise<DocumentContent> {
    const text = typeof input === 'string' ? input : input.toString('utf-8')

    // Extract metadata from front matter if present
    const metadata = this.extractMetadata(text)

    // Parse Markdown to tokens
    const tokens = marked.lexer(text)

    return {
      text,
      metadata,
    }
  }

  /**
   * Check if converter supports a format
   */
  supports(format: DocumentFormat): boolean {
    const supportedFormats = [
      DocumentFormat.MARKDOWN,
      DocumentFormat.HTML,
      DocumentFormat.TXT,
    ]
    return supportedFormats.includes(format)
  }

  /**
   * Convert Markdown to HTML
   */
  private async markdownToHTML(text: string, options?: ConversionOptions): Promise<Buffer> {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true,
    })

    const html = await marked.parse(text)

    // Wrap in HTML document
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
${html}
</body>
</html>
    `.trim()

    return Buffer.from(fullHTML, 'utf-8')
  }

  /**
   * Convert Markdown to plain text
   */
  private async markdownToText(text: string, options?: ConversionOptions): Promise<Buffer> {
    // Remove Markdown syntax for plain text
    let plainText = text
      .replace(/^#+\s+/gm, '') // Headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
      .replace(/\*(.+?)\*/g, '$1') // Italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
      .replace(/`(.+?)`/g, '$1') // Inline code
      .replace(/^[-*+]\s+/gm, '• ') // Lists

    return Buffer.from(plainText, 'utf-8')
  }

  /**
   * Extract metadata from front matter
   */
  private extractMetadata(text: string): DocumentMetadata {
    const metadata: DocumentMetadata = {
      format: DocumentFormat.MARKDOWN,
    }

    // Check for YAML front matter
    const frontMatterMatch = text.match(/^---\n([\s\S]+?)\n---/)
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1]
      const lines = frontMatter.split('\n')

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          const cleanKey = key.trim().toLowerCase()

          if (cleanKey === 'title') metadata.title = value
          if (cleanKey === 'author') metadata.author = value
          if (cleanKey === 'date') metadata.creationDate = new Date(value)
        }
      }
    }

    // Extract title from first heading if not in front matter
    if (!metadata.title) {
      const titleMatch = text.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        metadata.title = titleMatch[1]
      }
    }

    return metadata
  }
}
