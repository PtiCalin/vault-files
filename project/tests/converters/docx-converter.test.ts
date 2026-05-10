import { DOCXConverter } from "@converters/docx/docx-converter";
import { DocumentFormat } from "@types/document";

describe("DOCXConverter", () => {
  let converter: DOCXConverter;

  beforeEach(() => {
    converter = new DOCXConverter();
  });

  describe("supports", () => {
    it("should support DOCX format", () => {
      expect(converter.supports(DocumentFormat.DOCX)).toBe(true);
    });

    it("should support Markdown format", () => {
      expect(converter.supports(DocumentFormat.MARKDOWN)).toBe(true);
    });

    it("should support HTML format", () => {
      expect(converter.supports(DocumentFormat.HTML)).toBe(true);
    });

    it("should support TXT format", () => {
      expect(converter.supports(DocumentFormat.TXT)).toBe(true);
    });

    it("should not support PDF format", () => {
      expect(converter.supports(DocumentFormat.PDF)).toBe(false);
    });
  });

  describe("fromMarkdown", () => {
    it("should create DOCX from basic markdown", async () => {
      const markdown = `# Title

This is a paragraph.

## Section 1

- Bullet point 1
- Bullet point 2

Regular text.`;

      const buffer = await DOCXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty markdown", async () => {
      const markdown = "";
      const buffer = await DOCXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple heading levels", async () => {
      const markdown = `# H1
## H2
### H3
#### H4
Regular text`;

      const buffer = await DOCXConverter.fromMarkdown(markdown);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("fromHTML", () => {
    it("should create DOCX from HTML", async () => {
      const html = "<h1>Title</h1><p>This is a paragraph.</p>";
      const buffer = await DOCXConverter.fromHTML(html);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should strip HTML tags", async () => {
      const html = "<div><strong>Bold</strong> and <em>italic</em> text</div>";
      const buffer = await DOCXConverter.fromHTML(html);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("fromText", () => {
    it("should create DOCX from plain text", async () => {
      const text = "Line 1\nLine 2\nLine 3";
      const buffer = await DOCXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty text", async () => {
      const text = "";
      const buffer = await DOCXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should preserve line breaks", async () => {
      const text = "Paragraph 1\n\nParagraph 2\n\nParagraph 3";
      const buffer = await DOCXConverter.fromText(text);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("convert", () => {
    // Note: These tests would require actual DOCX files
    // For now, testing the basic flow with Buffer
    it("should reject invalid buffer", async () => {
      const result = await converter.convert(
        Buffer.from([]),
        DocumentFormat.MARKDOWN,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should report processing time", async () => {
      const markdown = "# Test Document\n\nTest content.";
      const buffer = await DOCXConverter.fromMarkdown(markdown);

      const result = await converter.convert(buffer, DocumentFormat.DOCX);

      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe("parse", () => {
    it("should reject empty buffer", async () => {
      await expect(converter.parse(Buffer.from([]))).rejects.toThrow();
    });

    it("should parse valid DOCX", async () => {
      // Create a simple DOCX for testing
      const markdown = "# Test\n\nContent";
      const buffer = await DOCXConverter.fromMarkdown(markdown);

      const content = await converter.parse(buffer);

      expect(content.metadata.format).toBe(DocumentFormat.DOCX);
      expect(content.metadata.fileSize).toBeGreaterThan(0);
      expect(content.text).toBeDefined();
    });
  });
});
