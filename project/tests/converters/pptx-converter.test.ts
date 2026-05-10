import { PPTXConverter } from "@converters/pptx/pptx-converter";
import { ConversionOptions } from "@types/converter";
import { DocumentFormat } from "@types/document";

describe("PPTXConverter", () => {
  let converter: PPTXConverter;

  beforeEach(() => {
    converter = new PPTXConverter();
  });

  describe("supports", () => {
    it("should support PPTX format", () => {
      expect(converter.supports(DocumentFormat.PPTX)).toBe(true);
    });

    it("should support Markdown format", () => {
      expect(converter.supports(DocumentFormat.MARKDOWN)).toBe(true);
    });

    it("should support TXT format", () => {
      expect(converter.supports(DocumentFormat.TXT)).toBe(true);
    });

    it("should not support DOCX format", () => {
      expect(converter.supports(DocumentFormat.DOCX)).toBe(false);
    });

    it("should not support PDF format", () => {
      expect(converter.supports(DocumentFormat.PDF)).toBe(false);
    });
  });

  describe("fromMarkdown", () => {
    it("should create PPTX from markdown with H1 slides", async () => {
      const markdown = `# Slide 1

First slide content.

## Subsection

More content.

# Slide 2

Second slide content.`;

      const buffer = await PPTXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      // PPTX files start with PK (zip signature)
      expect(buffer.slice(0, 2).toString()).toBe("PK");
    });

    it("should create default slide for non-structured markdown", async () => {
      const markdown = "Just plain text without headers.";
      const buffer = await PPTXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty markdown", async () => {
      const markdown = "";
      const buffer = await PPTXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should accept options", async () => {
      const markdown = "# Test Presentation";
      const options: ConversionOptions = {
        title: "Custom Title",
        author: "Test Author",
      };

      const buffer = await PPTXConverter.fromMarkdown(markdown, options);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("fromText", () => {
    it("should create PPTX from plain text", async () => {
      const text = `First Paragraph
Line 2
Line 3

Second Paragraph
More lines

Third Paragraph`;

      const buffer = await PPTXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.slice(0, 2).toString()).toBe("PK");
    });

    it("should create default slide for simple text", async () => {
      const text = "Simple single-line text.";
      const buffer = await PPTXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty text", async () => {
      const text = "";
      const buffer = await PPTXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("fromPages", () => {
    it("should create PPTX from page objects", async () => {
      const pages = [
        {
          number: 1,
          content: "First page content",
        },
        {
          number: 2,
          content: "Second page content",
        },
      ];

      const buffer = await PPTXConverter.fromPages(pages);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.slice(0, 2).toString()).toBe("PK");
    });

    it("should handle pages with images", async () => {
      const pages = [
        {
          number: 1,
          content: "Page with image",
          images: [
            {
              data: Buffer.from("fake-image-data"),
              format: "png" as const,
              width: 100,
              height: 100,
            },
          ],
        },
      ];

      const buffer = await PPTXConverter.fromPages(pages);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty pages array", async () => {
      const buffer = await PPTXConverter.fromPages([]);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("convert", () => {
    it("should reject invalid buffer", async () => {
      const result = await converter.convert(
        Buffer.from([]),
        DocumentFormat.MARKDOWN,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should passthrough PPTX to PPTX", async () => {
      const markdown = "# Test";
      const pptx = await PPTXConverter.fromMarkdown(markdown);

      const result = await converter.convert(pptx, DocumentFormat.PPTX);

      expect(result.success).toBe(true);
      expect(result.outputBuffer).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it("should report processing time", async () => {
      const markdown = "# Test Slide";
      const buffer = await PPTXConverter.fromMarkdown(markdown);

      const result = await converter.convert(buffer, DocumentFormat.PPTX);

      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe("parse", () => {
    it("should reject empty buffer", async () => {
      await expect(converter.parse(Buffer.from([]))).rejects.toThrow();
    });

    it("should parse valid PPTX", async () => {
      const markdown = "# Test";
      const buffer = await PPTXConverter.fromMarkdown(markdown);

      const content = await converter.parse(buffer);

      expect(content.metadata.format).toBe(DocumentFormat.PPTX);
      expect(content.metadata.fileSize).toBeGreaterThan(0);
      expect(content.metadata.title).toBeDefined();
    });
  });
});
