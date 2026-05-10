import { ValidationUtils, createLogger } from "@lib/index";
import {
  ConversionError,
  ConversionOptions,
  ConversionResult,
  DocumentContent,
  DocumentFormat,
  DocumentMetadata,
  IConverter,
} from "@types/index";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";

const logger = createLogger("DOCXConverter");

/**
 * DOCX converter implementation
 * Handles Word document conversion using mammoth (parsing) and docx (generation)
 */
export class DOCXConverter implements IConverter {
  /**
   * Convert DOCX to another format or create DOCX from other formats
   */
  async convert(
    input: Buffer | string,
    targetFormat: DocumentFormat,
    options?: ConversionOptions,
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    logger.info("Starting DOCX conversion", { targetFormat, options });

    try {
      const buffer = typeof input === "string" ? Buffer.from(input) : input;
      ValidationUtils.validateBuffer(buffer);

      let outputBuffer: Buffer;

      switch (targetFormat) {
        case DocumentFormat.DOCX:
          // DOCX to DOCX (optimization/reformatting)
          outputBuffer = await this.optimizeDOCX(buffer, options);
          break;
        case DocumentFormat.MARKDOWN:
          outputBuffer = await this.docxToMarkdown(buffer, options);
          break;
        case DocumentFormat.HTML:
          outputBuffer = await this.docxToHTML(buffer, options);
          break;
        case DocumentFormat.TXT:
          outputBuffer = await this.docxToText(buffer, options);
          break;
        case DocumentFormat.PDF:
          // DOCX to PDF would require additional library (e.g., puppeteer)
          throw new ConversionError(
            "DOCX to PDF conversion requires additional dependencies",
            DocumentFormat.DOCX,
            targetFormat,
          );
        default:
          throw new ConversionError(
            `Conversion from DOCX to ${targetFormat} not supported`,
            DocumentFormat.DOCX,
            targetFormat,
          );
      }

      return {
        success: true,
        outputBuffer,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error("DOCX conversion failed", error as Error);
      return {
        success: false,
        error: error as Error,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Parse DOCX content
   */
  async parse(input: Buffer | string): Promise<DocumentContent> {
    const buffer = typeof input === "string" ? Buffer.from(input) : input;
    ValidationUtils.validateBuffer(buffer);

    try {
      // Extract text content
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      // Extract metadata from core properties
      const metadata: DocumentMetadata = {
        format: DocumentFormat.DOCX,
        fileSize: buffer.length,
        title: undefined, // Would need docx core properties parsing
        author: undefined,
      };

      logger.debug("DOCX parsed successfully", { textLength: text.length });

      return {
        text,
        metadata,
      };
    } catch (error) {
      logger.error("DOCX parsing failed", error as Error);
      throw new ConversionError(
        "Failed to parse DOCX document",
        DocumentFormat.DOCX,
      );
    }
  }

  /**
   * Check if converter supports a format
   */
  supports(format: DocumentFormat): boolean {
    const supportedFormats = [
      DocumentFormat.DOCX,
      DocumentFormat.MARKDOWN,
      DocumentFormat.HTML,
      DocumentFormat.TXT,
    ];
    return supportedFormats.includes(format);
  }

  /**
   * Optimize/reformat DOCX
   */
  private async optimizeDOCX(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    // For now, just return the original
    // Could implement compression, cleanup, etc.
    logger.debug("DOCX optimization (passthrough)");
    return buffer;
  }

  /**
   * Convert DOCX to Markdown
   */
  private async docxToMarkdown(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const result = await mammoth.convertToMarkdown({ buffer });
    const markdown = result.value;

    logger.debug("DOCX to Markdown conversion complete", {
      outputLength: markdown.length,
      messages: result.messages.length,
    });

    if (result.messages.length > 0 && options?.preserveFormatting) {
      logger.warn("Conversion warnings", { messages: result.messages });
    }

    return Buffer.from(markdown, "utf-8");
  }

  /**
   * Convert DOCX to HTML
   */
  private async docxToHTML(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const result = await mammoth.convertToHtml({ buffer });
    const htmlBody = result.value;

    // Wrap in full HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    p {
      margin-bottom: 1em;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>`;

    logger.debug("DOCX to HTML conversion complete", {
      outputLength: html.length,
      messages: result.messages.length,
    });

    return Buffer.from(html, "utf-8");
  }

  /**
   * Convert DOCX to plain text
   */
  private async docxToText(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    logger.debug("DOCX to Text conversion complete", {
      outputLength: text.length,
    });

    return Buffer.from(text, "utf-8");
  }

  /**
   * Create DOCX from Markdown
   * This is a utility method for generating DOCX files
   */
  static async fromMarkdown(markdown: string): Promise<Buffer> {
    const logger = createLogger("DOCXConverter");
    logger.info("Creating DOCX from Markdown");

    // Parse markdown into sections
    const lines = markdown.split("\n");
    const paragraphs: Paragraph[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        // Empty line
        paragraphs.push(new Paragraph({ text: "" }));
        continue;
      }

      // Heading detection
      if (line.startsWith("# ")) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
          }),
        );
      } else if (line.startsWith("## ")) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
          }),
        );
      } else if (line.startsWith("### ")) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
          }),
        );
      } else if (line.startsWith("#### ")) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(5),
            heading: HeadingLevel.HEADING_4,
          }),
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        // Bullet point
        paragraphs.push(
          new Paragraph({
            text: line.substring(2),
            bullet: {
              level: 0,
            },
          }),
        );
      } else {
        // Regular paragraph
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: line })],
          }),
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    logger.debug("DOCX created from Markdown", { size: buffer.length });

    return Buffer.from(buffer);
  }

  /**
   * Create DOCX from HTML
   */
  static async fromHTML(html: string): Promise<Buffer> {
    const logger = createLogger("DOCXConverter");
    logger.info("Creating DOCX from HTML");

    // Simple HTML to DOCX conversion
    // Remove HTML tags and convert to plain text for basic implementation
    const text = html
      .replace(/<[^>]*>/g, "\n")
      .replace(/\n\n+/g, "\n\n")
      .trim();

    const lines = text.split("\n");
    const paragraphs = lines.map(
      (line) =>
        new Paragraph({
          text: line.trim(),
        }),
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    logger.debug("DOCX created from HTML", { size: buffer.length });

    return Buffer.from(buffer);
  }

  /**
   * Create DOCX from plain text
   */
  static async fromText(text: string): Promise<Buffer> {
    const logger = createLogger("DOCXConverter");
    logger.info("Creating DOCX from Text");

    const lines = text.split("\n");
    const paragraphs = lines.map(
      (line) =>
        new Paragraph({
          text: line,
        }),
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    logger.debug("DOCX created from Text", { size: buffer.length });

    return Buffer.from(buffer);
  }
}
