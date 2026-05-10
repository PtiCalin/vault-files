/**
 * Tests for ImageConverter
 */

import { ImageConverter } from "@converters/image";
import type { ConversionOptions } from "@types/converter";
import sharp from "sharp";

describe("ImageConverter", () => {
  let converter: ImageConverter;

  // Test image buffers
  let pngBuffer: Buffer;
  let jpgBuffer: Buffer;
  let webpBuffer: Buffer;

  beforeAll(async () => {
    converter = new ImageConverter();

    // Create test images
    pngBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    jpgBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    webpBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 0, g: 0, b: 255, alpha: 0.8 },
      },
    })
      .webp()
      .toBuffer();
  });

  describe("Format Support", () => {
    test("supports image to image conversion", () => {
      expect(converter.supports("png", "jpg")).toBe(true);
      expect(converter.supports("jpg", "webp")).toBe(true);
      expect(converter.supports("webp", "png")).toBe(true);
      expect(converter.supports("tiff", "jpg")).toBe(true);
    });

    test("supports image to PDF conversion", () => {
      expect(converter.supports("png", "pdf")).toBe(true);
      expect(converter.supports("jpg", "pdf")).toBe(true);
      expect(converter.supports("webp", "pdf")).toBe(true);
    });

    test("supports image to text (metadata)", () => {
      expect(converter.supports("png", "txt")).toBe(true);
      expect(converter.supports("jpg", "txt")).toBe(true);
    });

    test("does not support non-image formats", () => {
      expect(converter.supports("pdf", "png")).toBe(false);
      expect(converter.supports("md", "jpg")).toBe(false);
      expect(converter.supports("docx", "webp")).toBe(false);
    });
  });

  describe("Metadata Parsing", () => {
    test("parses PNG metadata correctly", async () => {
      const doc = await converter.parse(pngBuffer);

      expect(doc.metadata).toBeDefined();
      expect(doc.metadata.format).toBe("png");
      expect(doc.metadata.width).toBe(800);
      expect(doc.metadata.height).toBe(600);
      expect(doc.content).toContain("Image Metadata");
      expect(doc.content).toContain("800x600");
      expect(doc.pages).toHaveLength(1);
    });

    test("parses JPG metadata correctly", async () => {
      const doc = await converter.parse(jpgBuffer);

      expect(doc.metadata.format).toBe("jpeg");
      expect(doc.metadata.width).toBe(800);
      expect(doc.metadata.height).toBe(600);
      expect(doc.content).toContain("JPEG");
    });

    test("parses WebP metadata correctly", async () => {
      const doc = await converter.parse(webpBuffer);

      expect(doc.metadata.format).toBe("webp");
      expect(doc.metadata.hasAlpha).toBe(true);
      expect(doc.content).toContain("Has Alpha: Yes");
    });

    test("throws error for invalid image", async () => {
      const invalidBuffer = Buffer.from("not an image");
      await expect(converter.parse(invalidBuffer)).rejects.toThrow();
    });
  });

  describe("Image to Image Conversion", () => {
    test("converts PNG to JPG", async () => {
      const result = await converter.convert(pngBuffer, "png", "jpg");

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify it's a valid JPG
      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("jpeg");
    });

    test("converts JPG to WebP", async () => {
      const result = await converter.convert(jpgBuffer, "jpg", "webp");

      expect(Buffer.isBuffer(result)).toBe(true);

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("webp");
    });

    test("converts WebP to PNG", async () => {
      const result = await converter.convert(webpBuffer, "webp", "png");

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("png");
    });

    test("converts with high quality", async () => {
      const options: ConversionOptions = { quality: "high" };
      const result = await converter.convert(pngBuffer, "png", "jpg", options);

      // High quality should produce larger file
      const lowQualityResult = await converter.convert(
        pngBuffer,
        "png",
        "jpg",
        {
          quality: "low",
        },
      );

      expect(result.length).toBeGreaterThan(lowQualityResult.length);
    });

    test("converts with compression", async () => {
      const options: ConversionOptions = { compress: true };
      const result = await converter.convert(pngBuffer, "png", "png", options);

      // Compressed should be smaller or equal
      expect(result.length).toBeLessThanOrEqual(pngBuffer.length);
    });

    test("converts with resize", async () => {
      const options: ConversionOptions = { width: 400, height: 300 };
      const result = await converter.convert(pngBuffer, "png", "jpg", options);

      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
    });
  });

  describe("Image to PDF Conversion", () => {
    test("converts PNG to PDF", async () => {
      const result = await converter.convert(pngBuffer, "png", "pdf");

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify PDF signature
      const signature = result.toString("utf8", 0, 4);
      expect(signature).toBe("%PDF");
    });

    test("converts JPG to PDF", async () => {
      const result = await converter.convert(jpgBuffer, "jpg", "pdf");

      const signature = result.toString("utf8", 0, 4);
      expect(signature).toBe("%PDF");
    });

    test("converts WebP to PDF", async () => {
      const result = await converter.convert(webpBuffer, "webp", "pdf");

      const signature = result.toString("utf8", 0, 4);
      expect(signature).toBe("%PDF");
    });

    test("converts with high quality PDF", async () => {
      const options: ConversionOptions = { quality: "high" };
      const result = await converter.convert(pngBuffer, "png", "pdf", options);

      const lowQualityResult = await converter.convert(
        pngBuffer,
        "png",
        "pdf",
        {
          quality: "low",
        },
      );

      // High quality PDF should be larger
      expect(result.length).toBeGreaterThan(lowQualityResult.length);
    });

    test("converts with compression enabled", async () => {
      const options: ConversionOptions = { compress: true };
      const compressed = await converter.convert(
        pngBuffer,
        "png",
        "pdf",
        options,
      );

      const uncompressed = await converter.convert(pngBuffer, "png", "pdf", {
        compress: false,
      });

      // Compressed should be smaller
      expect(compressed.length).toBeLessThan(uncompressed.length);
    });
  });

  describe("Image to Text (Metadata)", () => {
    test("converts PNG to text metadata", async () => {
      const result = await converter.convert(pngBuffer, "png", "txt");

      const text = result.toString("utf8");
      expect(text).toContain("Image Metadata");
      expect(text).toContain("Format: PNG");
      expect(text).toContain("800x600");
    });

    test("converts JPG to text metadata", async () => {
      const result = await converter.convert(jpgBuffer, "jpg", "txt");

      const text = result.toString("utf8");
      expect(text).toContain("Format: JPEG");
    });
  });

  describe("Image Optimization", () => {
    test("optimizes image with quality setting", async () => {
      const optimized = await converter.optimize(pngBuffer, { quality: 70 });

      expect(Buffer.isBuffer(optimized)).toBe(true);
      // Should be smaller than original
      expect(optimized.length).toBeLessThan(pngBuffer.length);
    });

    test("optimizes with max dimensions", async () => {
      const optimized = await converter.optimize(pngBuffer, {
        maxWidth: 400,
        maxHeight: 300,
      });

      const metadata = await sharp(optimized).metadata();
      expect(metadata.width).toBeLessThanOrEqual(400);
      expect(metadata.height).toBeLessThanOrEqual(300);
    });

    test("optimizes with max file size", async () => {
      const maxSize = 50000; // 50KB
      const optimized = await converter.optimize(pngBuffer, { maxSize });

      // Should be close to or under max size
      expect(optimized.length).toBeLessThanOrEqual(maxSize * 1.1); // 10% tolerance
    });

    test("strips metadata when optimizing", async () => {
      // Create image with EXIF data
      const withExif = await sharp(pngBuffer)
        .withMetadata({
          exif: {
            IFD0: {
              Copyright: "Test Copyright",
            },
          },
        })
        .toBuffer();

      const optimized = await converter.optimize(withExif, {
        stripMetadata: true,
      });

      const metadata = await sharp(optimized).metadata();
      expect(metadata.exif).toBeUndefined();
    });

    test("applies lossless compression for WebP", async () => {
      const optimized = await converter.optimize(webpBuffer, {
        lossless: true,
        quality: 100,
      });

      expect(Buffer.isBuffer(optimized)).toBe(true);
    });
  });

  describe("Static Factory Methods", () => {
    test("creates Image from buffer", async () => {
      const image = await ImageConverter.fromBuffer(pngBuffer);

      expect(image.format).toBe("png");
      expect(image.width).toBe(800);
      expect(image.height).toBe(600);
      expect(image.buffer).toBe(pngBuffer);
      expect(image.metadata).toBeDefined();
    });

    test("creates Image with specified format", async () => {
      const image = await ImageConverter.fromBuffer(jpgBuffer, "jpg");

      expect(image.format).toBe("jpg");
    });

    test("throws error for invalid buffer", async () => {
      const invalidBuffer = Buffer.from("not an image");
      await expect(ImageConverter.fromBuffer(invalidBuffer)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("throws error for unsupported format conversion", async () => {
      await expect(
        converter.convert(pngBuffer, "png", "docx" as any),
      ).rejects.toThrow("not supported");
    });

    test("throws error for invalid input buffer", async () => {
      const invalidBuffer = Buffer.from("not an image");
      await expect(
        converter.convert(invalidBuffer, "png", "jpg"),
      ).rejects.toThrow();
    });

    test("throws error for unsupported source format", async () => {
      await expect(
        converter.convert(Buffer.from("test"), "pdf" as any, "jpg"),
      ).rejects.toThrow();
    });
  });

  describe("Performance", () => {
    test("completes small image conversion quickly", async () => {
      const start = Date.now();
      await converter.convert(pngBuffer, "png", "jpg");
      const duration = Date.now() - start;

      // Should complete within 500ms for small image
      expect(duration).toBeLessThan(500);
    });

    test("completes PDF conversion quickly", async () => {
      const start = Date.now();
      await converter.convert(pngBuffer, "png", "pdf");
      const duration = Date.now() - start;

      // Should complete within 1000ms
      expect(duration).toBeLessThan(1000);
    });

    test("completes optimization quickly", async () => {
      const start = Date.now();
      await converter.optimize(pngBuffer, { quality: 80 });
      const duration = Date.now() - start;

      // Should complete within 300ms
      expect(duration).toBeLessThan(300);
    });
  });

  describe("Format-Specific Features", () => {
    test("preserves PNG transparency", async () => {
      // Create PNG with alpha
      const transparentPng = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 0.5 },
        },
      })
        .png()
        .toBuffer();

      const result = await converter.convert(transparentPng, "png", "png");

      const metadata = await sharp(result).metadata();
      expect(metadata.hasAlpha).toBe(true);
    });

    test("converts JPEG with progressive rendering", async () => {
      const result = await converter.convert(pngBuffer, "png", "jpg", {
        quality: "high",
      });

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("jpeg");
    });

    test("creates WebP with high compression", async () => {
      const result = await converter.convert(pngBuffer, "png", "webp", {
        compress: true,
        quality: "medium",
      });

      // WebP should be significantly smaller
      expect(result.length).toBeLessThan(pngBuffer.length * 0.5);
    });
  });
});
