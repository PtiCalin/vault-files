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
import PptxGenJS from "pptxgenjs";

const logger = createLogger("PPTXConverter");

/**
 * PPTX converter implementation
 * Handles PowerPoint presentation generation and conversion
 */
export class PPTXConverter implements IConverter {
  /**
   * Convert PPTX to another format
   */
  async convert(
    input: Buffer | string,
    targetFormat: DocumentFormat,
    options?: ConversionOptions,
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    logger.info("Starting PPTX conversion", { targetFormat, options });

    try {
      const buffer = typeof input === "string" ? Buffer.from(input) : input;
      ValidationUtils.validateBuffer(buffer);

      let outputBuffer: Buffer;

      switch (targetFormat) {
        case DocumentFormat.PPTX:
          // PPTX to PPTX (passthrough for now)
          outputBuffer = buffer;
          break;
        case DocumentFormat.TXT:
          outputBuffer = await this.pptxToText(buffer, options);
          break;
        case DocumentFormat.MARKDOWN:
          outputBuffer = await this.pptxToMarkdown(buffer, options);
          break;
        default:
          throw new ConversionError(
            `Conversion from PPTX to ${targetFormat} not supported`,
            DocumentFormat.PPTX,
            targetFormat,
          );
      }

      return {
        success: true,
        outputBuffer,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error("PPTX conversion failed", error as Error);
      return {
        success: false,
        error: error as Error,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Parse PPTX content
   */
  async parse(input: Buffer | string): Promise<DocumentContent> {
    const buffer = typeof input === "string" ? Buffer.from(input) : input;
    ValidationUtils.validateBuffer(buffer);

    // Basic metadata extraction
    const metadata: DocumentMetadata = {
      format: DocumentFormat.PPTX,
      fileSize: buffer.length,
      title: "Presentation",
    };

    logger.debug("PPTX parsed (basic)", { fileSize: buffer.length });

    return {
      text: "(PPTX text extraction requires additional parsing)",
      metadata,
    };
  }

  /**
   * Check if converter supports a format
   */
  supports(format: DocumentFormat): boolean {
    const supportedFormats = [
      DocumentFormat.PPTX,
      DocumentFormat.MARKDOWN,
      DocumentFormat.TXT,
    ];
    return supportedFormats.includes(format);
  }

  /**
   * Convert PPTX to plain text (basic extraction)
   */
  private async pptxToText(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const text = "PPTX text extraction not fully implemented yet";
    logger.debug("PPTX to Text conversion (placeholder)");
    return Buffer.from(text, "utf-8");
  }

  /**
   * Convert PPTX to Markdown (basic extraction)
   */
  private async pptxToMarkdown(
    buffer: Buffer,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const markdown =
      "# Presentation\n\nPPTX to Markdown extraction not fully implemented yet";
    logger.debug("PPTX to Markdown conversion (placeholder)");
    return Buffer.from(markdown, "utf-8");
  }

  /**
   * Create PPTX from Markdown
   * Each H1 heading becomes a new slide
   */
  static async fromMarkdown(
    markdown: string,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const logger = createLogger("PPTXConverter");
    logger.info("Creating PPTX from Markdown");

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.author = options?.author || "vault-files";
    pptx.title = options?.title || "Presentation";

    // Parse markdown into slides
    const lines = markdown.split("\n");
    let currentSlide: any = null;
    let currentContent: string[] = [];

    const addSlide = (title: string, content: string[]) => {
      const slide = pptx.addSlide();
      slide.addText(title, {
        x: 0.5,
        y: 0.5,
        w: "90%",
        h: 1.0,
        fontSize: 32,
        bold: true,
        color: "363636",
      });
      if (content.length > 0) {
        slide.addText(content.join("\n"), {
          x: 0.5,
          y: 2.0,
          w: "90%",
          h: 4.0,
          fontSize: 18,
          color: "666666",
          valign: "top",
        });
      }
    };

    for (const line of lines) {
      if (line.startsWith("# ")) {
        if (currentSlide !== null) {
          addSlide(currentSlide, currentContent);
        }
        currentSlide = line.substring(2);
        currentContent = [];
      } else if (line.startsWith("## ")) {
        currentContent.push(`\n${line.substring(3)}`);
      } else if (line.trim()) {
        currentContent.push(line);
      }
    }

    if (currentSlide !== null) {
      addSlide(currentSlide, currentContent);
    }

    if (pptx.slides.length === 0) {
      const slide = pptx.addSlide();
      slide.addText("Document", {
        x: 0.5,
        y: 0.5,
        w: "90%",
        h: 1.0,
        fontSize: 32,
        bold: true,
        color: "363636",
      });
      slide.addText(markdown.substring(0, 500), {
        x: 0.5,
        y: 2.0,
        w: "90%",
        h: 4.0,
        fontSize: 18,
        color: "666666",
        valign: "top",
      });
    }

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    logger.debug("PPTX created from Markdown", {
      slides: pptx.slides.length,
      size: buffer.length,
    });

    return Buffer.from(buffer);
  }

  /**
   * Create PPTX from plain text
   */
  static async fromText(
    text: string,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    const logger = createLogger("PPTXConverter");
    logger.info("Creating PPTX from Text");

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.author = options?.author || "vault-files";
    pptx.title = options?.title || "Presentation";

    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    for (let i = 0; i < paragraphs.length; i++) {
      const slide = pptx.addSlide();
      const paragraph = paragraphs[i];
      const lines = paragraph.split("\n");
      const title = lines[0] || `Slide ${i + 1}`;
      const content = lines.slice(1).join("\n");

      slide.addText(title, {
        x: 0.5,
        y: 0.5,
        w: "90%",
        h: 1.0,
        fontSize: 32,
        bold: true,
        color: "363636",
      });

      if (content) {
        slide.addText(content, {
          x: 0.5,
          y: 2.0,
          w: "90%",
          h: 4.0,
          fontSize: 18,
          color: "666666",
          valign: "top",
        });
      }
    }

    if (pptx.slides.length === 0) {
      const slide = pptx.addSlide();
      slide.addText("Document", {
        x: 0.5,
        y: 0.5,
        w: "90%",
        h: 1.0,
        fontSize: 32,
        bold: true,
        color: "363636",
      });
      slide.addText(text.substring(0, 500), {
        x: 0.5,
        y: 2.0,
        w: "90%",
        h: 4.0,
        fontSize: 18,
        color: "666666",
        valign: "top",
      });
    }

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    logger.debug("PPTX created from Text", {
      slides: pptx.slides.length,
      size: buffer.length,
    });

    return Buffer.from(buffer);
  }
}
