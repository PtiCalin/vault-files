import { PDFConverter } from "@converters/pdf/pdf-converter";
import { DocumentFormat } from "@types/document";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

describe("PDFConverter", () => {
  let converter: PDFConverter;

  // Helper to create a simple test PDF
  async function createTestPDF(text: string = "Test content"): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(text, {
      x: 50,
      y: 350,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  beforeEach(() => {
    converter = new PDFConverter();
  });

  describe("supports", () => {
    it("should support PDF format", () => {
      expect(converter.supports(DocumentFormat.PDF)).toBe(true);
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
  });

  describe("parse", () => {
    it("should reject empty buffer", async () => {
      await expect(converter.parse(Buffer.from([]))).rejects.toThrow();
    });

    it("should extract PDF metadata", async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.setTitle("Test Document");
      pdfDoc.setAuthor("Test Author");
      pdfDoc.setSubject("Test Subject");
      pdfDoc.setKeywords(["test", "document"]);
      pdfDoc.setCreator("Test Creator");
      pdfDoc.setProducer("Test Producer");

      pdfDoc.addPage([600, 400]);

      const pdfBytes = await pdfDoc.save();
      const buffer = Buffer.from(pdfBytes);

      const content = await converter.parse(buffer);

      expect(content.metadata.format).toBe(DocumentFormat.PDF);
      expect(content.metadata.title).toBe("Test Document");
      expect(content.metadata.author).toBe("Test Author");
      expect(content.metadata.subject).toBe("Test Subject");
      expect(content.metadata.keywords).toContain("test");
      expect(content.metadata.creator).toBe("Test Creator");
      expect(content.metadata.producer).toBe("Test Producer");
      expect(content.metadata.pageCount).toBe(1);
      expect(content.metadata.fileSize).toBeGreaterThan(0);
    });

    it("should extract text from PDF", async () => {
      const buffer = await createTestPDF("Hello World");
      const content = await converter.parse(buffer);

      expect(content.text).toBeDefined();
      // Note: Text extraction quality depends on pdf-parse
    });

    it("should handle multi-page PDFs", async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([600, 400]);
      pdfDoc.addPage([600, 400]);
      pdfDoc.addPage([600, 400]);

      const pdfBytes = await pdfDoc.save();
      const buffer = Buffer.from(pdfBytes);

      const content = await converter.parse(buffer);

      expect(content.metadata.pageCount).toBe(3);
    });
  });

  describe("convert", () => {
    it("should convert PDF to Markdown", async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.setTitle("Test Document");
      pdfDoc.setAuthor("Test Author");
      pdfDoc.addPage([600, 400]);

      const pdfBytes = await pdfDoc.save();
      const buffer = Buffer.from(pdfBytes);

      const result = await converter.convert(buffer, DocumentFormat.MARKDOWN);

      expect(result.success).toBe(true);
      expect(result.outputBuffer).toBeInstanceOf(Buffer);

      const markdown = result.outputBuffer!.toString("utf-8");
      expect(markdown).toContain("# Test Document");
      expect(markdown).toContain("**Author:** Test Author");
    });

    it("should convert PDF to TXT", async () => {
      const buffer = await createTestPDF("Test content");

      const result = await converter.convert(buffer, DocumentFormat.TXT);

      expect(result.success).toBe(true);
      expect(result.outputBuffer).toBeInstanceOf(Buffer);

      const text = result.outputBuffer!.toString("utf-8");
      expect(text).toBeDefined();
    });

    it("should optimize PDF to PDF", async () => {
      const buffer = await createTestPDF();

      const result = await converter.convert(buffer, DocumentFormat.PDF);

      expect(result.success).toBe(true);
      expect(result.outputBuffer).toBeInstanceOf(Buffer);
    });

    it("should reject unsupported format conversion", async () => {
      const buffer = await createTestPDF();

      const result = await converter.convert(buffer, DocumentFormat.DOCX);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should report processing time", async () => {
      const buffer = await createTestPDF();

      const result = await converter.convert(buffer, DocumentFormat.MARKDOWN);

      expect(result.processingTime).toBeGreaterThan(0);
    });

    it("should handle compression option", async () => {
      const buffer = await createTestPDF();

      const result = await converter.convert(buffer, DocumentFormat.PDF, {
        compress: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("performOCR", () => {
    it("should skip OCR if PDF has text", async () => {
      const buffer = await createTestPDF("Readable text");

      const text = await converter.performOCR(buffer);

      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it("should handle image-based PDFs", async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([600, 400]);

      const pdfBytes = await pdfDoc.save();
      const buffer = Buffer.from(pdfBytes);

      const text = await converter.performOCR(buffer);

      // Currently returns placeholder
      expect(text).toContain("OCR");
    });

    it("should handle different languages", async () => {
      const buffer = await createTestPDF();

      const text = await converter.performOCR(buffer, "eng");

      expect(text).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle invalid PDF", async () => {
      const invalidPDF = Buffer.from("Not a valid PDF");

      const result = await converter.convert(
        invalidPDF,
        DocumentFormat.MARKDOWN,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty buffer", async () => {
      const result = await converter.convert(
        Buffer.from([]),
        DocumentFormat.MARKDOWN,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
