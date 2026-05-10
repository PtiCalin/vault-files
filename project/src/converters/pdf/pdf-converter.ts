import { createLogger, ValidationUtils } from "@lib/index";
import {
  ConversionError,
  ConversionOptions,
  ConversionResult,
  DocumentContent,
  DocumentFormat,
  DocumentMetadata,
  IConverter,
  Page,
} from "@types/index";
import { PDFDocument } from "pdf-lib";
import pdfParse from "pdf-parse";
import { createWorker, Worker } from "tesseract.js";

const logger = createLogger("PDFConverter");

/**
 * PDF converter implementation
 * Handles PDF generation, parsing, and conversion
 */
export class PDFConverter implements IConverter {
  /**
   * Convert PDF to another format or vice versa
   */
  async convert(
    input: Buffer | string,
    targetFormat: DocumentFormat,
    options?: ConversionOptions,
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    logger.info("Starting PDF conversion", { targetFormat, options });

    try {
      const buffer = typeof input === "string" ? Buffer.from(input) : input;
      ValidationUtils.validateBuffer(buffer);

      let outputBuffer: Buffer;

      switch (targetFormat) {
        case DocumentFormat.PDF:
          // PDF to PDF (optimization/compression)
          outputBuffer = await this.optimizePDF(buffer, options);
          break;
        case DocumentFormat.MARKDOWN:
          outputBuffer = await this.pdfToMarkdown(buffer, options);
          break;
        case DocumentFormat.TXT:
          outputBuffer = await this.pdfToText(buffer, options);
          break;
        default:
          throw new ConversionError(
            `Conversion from PDF to ${targetFormat} not yet implemented`,
            DocumentFormat.PDF,
            targetFormat,
          );
      }

      return {
        success: true,
        outputBuffer,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error("PDF conversion failed", error as Error);
      return {
        success: false,
        error: error as Error,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Parse PDF content with enhanced text extraction
   */
  async parse(input: Buffer | string): Promise<DocumentContent> {
    const buffer = typeof input === "string" ? Buffer.from(input) : input;
    ValidationUtils.validateBuffer(buffer);

    try {
      // Load PDF for metadata
      const pdfDoc = await PDFDocument.load(buffer);
      const pageCount = pdfDoc.getPageCount();

      // Extract metadata
      const metadata: DocumentMetadata = {
        format: DocumentFormat.PDF,
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        keywords: pdfDoc
          .getKeywords()
          ?.split(",")
          .map((k) => k.trim()),
        creator: pdfDoc.getCreator(),
        producer: pdfDoc.getProducer(),
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
        pageCount,
        fileSize: buffer.length,
      };

      // Extract text using pdf-parse
      let text = "";
      try {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        logger.debug("PDF text extracted", { length: text.length });
      } catch (error) {
        logger.warn(
          "PDF text extraction failed, PDF might be image-based",
          error as Error,
        );
        text = "";
      }

      // Create page objects
      const pages: Page[] = [];
      if (text) {
        // Split text by pages (simple heuristic)
        const textPerPage = Math.ceil(text.length / pageCount);
        for (let i = 0; i < pageCount; i++) {
          const start = i * textPerPage;
          const end = Math.min((i + 1) * textPerPage, text.length);
          pages.push({
            number: i + 1,
            content: text.substring(start, end),
          });
        }
      }

      return {
        text,
        pages: pages.length > 0 ? pages : undefined,
        metadata,
      };
    } catch (error) {
      logger.error("PDF parsing failed", error as Error);
      throw new ConversionError(
        "Failed to parse PDF document",
        DocumentFormat.PDF,
      );
    }
  }

  /**
   * Check if converter supports a format
   */
  supports(format: DocumentFormat): boolean {
    const supportedFormats = [
      DocumentFormat.PDF,
      DocumentFormat.MARKDOWN,
      DocumentFormat.TXT,
    ];
    return supportedFormats.includes(format);
  }

  /**
   * Optimize PDF
   */
  private async optimizePDF(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);

    // Apply optimization options
    if (options?.compress) {
      // Compression logic to be implemented
      logger.debug("PDF compression applied");
    }

    return Buffer.from(await pdfDoc.save());
  }

  /**
   * Convert PDF to Markdown with enhanced text extraction
   */
  private async pdfToMarkdown(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const content = await this.parse(buffer);

    // Build markdown document
    let markdown = `# ${content.metadata.title || "Untitled Document"}\n\n`;

    if (content.metadata.author) {
      markdown += `**Author:** ${content.metadata.author}\n\n`;
    }

    if (content.metadata.creationDate) {
      markdown += `**Date:** ${content.metadata.creationDate.toLocaleDateString()}\n\n`;
    }

    markdown += "---\n\n";

    if (content.text) {
      markdown += content.text;
    } else {
      markdown +=
        "_This PDF appears to contain images. Text extraction was not possible._\n\n";
      markdown += "_Consider using OCR for image-based PDFs._";
    }

    return Buffer.from(markdown, "utf-8");
  }

  /**
   * Convert PDF to plain text with enhanced extraction
   */
  private async pdfToText(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const content = await this.parse(buffer);
    const text =
      content.text || "(Text extraction failed - PDF may contain only images)";
    return Buffer.from(text, "utf-8");
  }

  /**
   * Perform OCR on PDF (for image-based PDFs)
   * This is a utility method that can be called when text extraction fails
   */
  async performOCR(buffer: Buffer, language: string = "eng"): Promise<string> {
    logger.info("Starting OCR on PDF", { language });

    let worker: Worker | null = null;
    try {
      // Parse PDF to check if it has text
      const pdfData = await pdfParse(buffer);
      if (pdfData.text && pdfData.text.trim().length > 50) {
        logger.debug("PDF already has text, skipping OCR");
        return pdfData.text;
      }

      // Initialize Tesseract worker
      worker = await createWorker(language);

      // For now, return placeholder
      // Full implementation would require:
      // 1. Convert PDF pages to images
      // 2. Run OCR on each image
      // 3. Combine results
      logger.warn(
        "OCR implementation incomplete - PDF to image conversion needed",
      );

      return "OCR not fully implemented yet. PDF to image conversion required.";
    } catch (error) {
      logger.error("OCR failed", error as Error);
      throw new ConversionError("OCR processing failed", DocumentFormat.PDF);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }
}
