/**
 * Image Format Converter
 * Handles conversion between image formats and image-to-PDF operations
 */

import {
  applyImageOptions,
  calculateDimensions,
  detectImageFormat,
  getFormatOptions,
  getImageInfo,
  isValidImage,
  toSharpFormat,
  validateImageOptions,
} from "@lib/image-utils";
import { logger } from "@lib/logger";
import type { ConversionOptions, Converter } from "@types/converter";
import type { Document, Format, Page } from "@types/document";
import {
  ConversionError,
  UnsupportedFormatError,
  ValidationError,
} from "@types/errors";
import type {
  Image,
  ImageFormat,
  ImageMetadata,
  ImageOptions,
  ImageToPDFOptions,
  OptimizationOptions,
} from "@types/image";
import { PDFDocument, rgb } from "pdf-lib";
import sharp from "sharp";

/**
 * Image converter implementation
 */
export class ImageConverter implements Converter {
  readonly name = "ImageConverter";
  readonly version = "1.0.0";

  // Supported formats
  private readonly supportedFormats: ImageFormat[] = [
    "png",
    "jpg",
    "jpeg",
    "tiff",
    "webp",
    "gif",
    "bmp",
    "avif",
  ];

  /**
   * Check if converter supports the given formats
   */
  supports(from: Format, to: Format): boolean {
    const isImageFormat = (f: Format): f is ImageFormat =>
      this.supportedFormats.includes(f as ImageFormat);

    // Image to Image
    if (isImageFormat(from) && isImageFormat(to)) {
      return true;
    }

    // Image to PDF
    if (isImageFormat(from) && to === "pdf") {
      return true;
    }

    // Image to Text (metadata extraction)
    if (isImageFormat(from) && to === "txt") {
      return true;
    }

    return false;
  }

  /**
   * Parse image and extract metadata
   */
  async parse(buffer: Buffer): Promise<Document> {
    const startTime = Date.now();

    try {
      // Validate image
      if (!(await isValidImage(buffer))) {
        throw new ValidationError("Invalid image buffer");
      }

      // Get metadata
      const metadata = await getImageInfo(buffer);
      const format = await detectImageFormat(buffer);

      if (!format) {
        throw new UnsupportedFormatError("Unknown image format");
      }

      logger.info(`Parsed ${format} image`, {
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
      });

      // Create document with single page containing image info
      const pages: Page[] = [
        {
          number: 1,
          content: this.formatMetadata(metadata),
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
          },
        },
      ];

      return {
        content: this.formatMetadata(metadata),
        pages,
        metadata: {
          format: format,
          title: `Image ${metadata.width}x${metadata.height}`,
          pageCount: 1,
          wordCount: 0,
          ...metadata,
        },
        statistics: {
          processingTime: Date.now() - startTime,
          pageCount: 1,
        },
      };
    } catch (error) {
      logger.error("Image parsing failed", { error });
      throw new ConversionError(
        `Failed to parse image: ${error instanceof Error ? error.message : "Unknown error"}`,
        this.name,
      );
    }
  }

  /**
   * Convert image between formats or to PDF
   */
  async convert(
    input: Buffer,
    from: Format,
    to: Format,
    options: ConversionOptions = {},
  ): Promise<Buffer> {
    const startTime = Date.now();

    try {
      // Validate formats
      if (!this.supports(from, to)) {
        throw new UnsupportedFormatError(
          `Conversion from ${from} to ${to} not supported`,
        );
      }

      logger.info(`Converting ${from} to ${to}`, {
        inputSize: input.length,
        options,
      });

      let result: Buffer;

      // Route to appropriate conversion method
      if (to === "pdf") {
        result = await this.imageToPDF(input, options);
      } else if (to === "txt") {
        result = Buffer.from(this.formatMetadata(await getImageInfo(input)));
      } else {
        result = await this.imageToImage(input, to as ImageFormat, options);
      }

      const duration = Date.now() - startTime;
      logger.info(`Conversion completed`, {
        from,
        to,
        inputSize: input.length,
        outputSize: result.length,
        compressionRatio: (result.length / input.length).toFixed(2),
        duration,
      });

      return result;
    } catch (error) {
      logger.error("Image conversion failed", { error, from, to });
      throw new ConversionError(
        `Failed to convert ${from} to ${to}: ${error instanceof Error ? error.message : "Unknown error"}`,
        this.name,
      );
    }
  }

  /**
   * Convert between image formats
   */
  private async imageToImage(
    buffer: Buffer,
    to: ImageFormat,
    options: ConversionOptions,
  ): Promise<Buffer> {
    try {
      // Parse options
      const imageOptions: ImageOptions = {
        quality:
          options.quality === "high"
            ? 95
            : options.quality === "medium"
              ? 80
              : 70,
        compression: options.compress ? 9 : undefined,
        width: options.width,
        height: options.height,
        preserveMetadata: options.preserveMetadata,
      };

      // Validate options
      validateImageOptions(imageOptions);

      // Create sharp instance
      let image = sharp(buffer);

      // Apply transformations
      image = applyImageOptions(image, imageOptions);

      // Get format options
      const formatOptions = getFormatOptions(to, imageOptions);

      // Convert to target format
      const sharpFormat = toSharpFormat(to);
      image = image.toFormat(sharpFormat as any, formatOptions);

      // Return buffer
      return await image.toBuffer();
    } catch (error) {
      throw new ConversionError(
        `Image format conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        this.name,
      );
    }
  }

  /**
   * Convert image to PDF
   */
  private async imageToPDF(
    buffer: Buffer,
    options: ConversionOptions,
  ): Promise<Buffer> {
    try {
      // Parse PDF-specific options
      const pdfOptions: ImageToPDFOptions = {
        pageSize: "A4",
        orientation: "portrait",
        margin: 50,
        fit: "contain",
        quality: options.quality === "high" ? 95 : 80,
        center: true,
        compress: options.compress !== false,
      };

      // Get image metadata
      const metadata = await getImageInfo(buffer);

      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Determine page dimensions
      const pageSize = this.getPageSize(
        pdfOptions.pageSize!,
        pdfOptions.orientation!,
      );
      const page = pdfDoc.addPage(pageSize);

      // Calculate margins
      const margin =
        typeof pdfOptions.margin === "number"
          ? {
              top: pdfOptions.margin,
              right: pdfOptions.margin,
              bottom: pdfOptions.margin,
              left: pdfOptions.margin,
            }
          : pdfOptions.margin!;

      const availableWidth =
        pageSize[0] - (margin.left || 0) - (margin.right || 0);
      const availableHeight =
        pageSize[1] - (margin.top || 0) - (margin.bottom || 0);

      // Calculate image dimensions to fit page
      const dimensions = calculateDimensions(
        { width: metadata.width, height: metadata.height },
        { width: availableWidth, height: availableHeight },
        pdfOptions.fit!,
      );

      // Optimize image for PDF embedding
      const optimizedImage = await sharp(buffer)
        .resize(dimensions.width, dimensions.height, { fit: "inside" })
        .jpeg({ quality: pdfOptions.quality, progressive: false })
        .toBuffer();

      // Embed image in PDF
      const image = await pdfDoc.embedJpg(optimizedImage);

      // Calculate position (center if requested)
      let x = margin.left || 0;
      let y = margin.bottom || 0;

      if (pdfOptions.center) {
        x = (pageSize[0] - dimensions.width) / 2;
        y = (pageSize[1] - dimensions.height) / 2;
      }

      // Draw image
      page.drawImage(image, {
        x,
        y,
        width: dimensions.width,
        height: dimensions.height,
      });

      // Add title if provided
      if (pdfOptions.title) {
        page.drawText(pdfOptions.title, {
          x: margin.left || 50,
          y: pageSize[1] - (margin.top || 50) + 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }

      // Set metadata
      pdfDoc.setTitle(
        pdfOptions.title || `Image ${metadata.width}x${metadata.height}`,
      );
      pdfDoc.setCreator("vault-files");
      pdfDoc.setProducer("vault-files ImageConverter");

      // Save PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: pdfOptions.compress,
      });

      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new ConversionError(
        `Image to PDF conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        this.name,
      );
    }
  }

  /**
   * Optimize image with specific options
   */
  async optimize(
    buffer: Buffer,
    options: OptimizationOptions = {},
  ): Promise<Buffer> {
    try {
      const metadata = await getImageInfo(buffer);
      const format = await detectImageFormat(buffer);

      if (!format) {
        throw new UnsupportedFormatError("Unknown image format");
      }

      let image = sharp(buffer);

      // Apply size constraints
      if (options.maxWidth || options.maxHeight) {
        image = image.resize({
          width: options.maxWidth,
          height: options.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Apply format-specific optimization
      const imageOptions: ImageOptions = {
        quality: options.quality || 80,
        stripMetadata: options.stripMetadata !== false,
      };

      const formatOptions = getFormatOptions(format, imageOptions);

      if (options.lossless && format === "webp") {
        formatOptions.lossless = true;
      }

      if (options.progressive && (format === "jpg" || format === "jpeg")) {
        formatOptions.progressive = true;
      }

      if (options.effort && format === "webp") {
        formatOptions.effort = options.effort;
      }

      image = image.toFormat(toSharpFormat(format) as any, formatOptions);

      let result = await image.toBuffer();

      // If maxSize specified, iteratively reduce quality
      if (options.maxSize && result.length > options.maxSize) {
        let quality = options.quality || 80;
        while (result.length > options.maxSize && quality > 10) {
          quality -= 10;
          result = await sharp(buffer)
            .resize({
              width: options.maxWidth,
              height: options.maxHeight,
              fit: "inside",
              withoutEnlargement: true,
            })
            .toFormat(toSharpFormat(format) as any, {
              ...formatOptions,
              quality,
            })
            .toBuffer();
        }
      }

      logger.info("Image optimized", {
        originalSize: buffer.length,
        optimizedSize: result.length,
        compressionRatio: (result.length / buffer.length).toFixed(2),
      });

      return result;
    } catch (error) {
      throw new ConversionError(
        `Image optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        this.name,
      );
    }
  }

  /**
   * Get PDF page size dimensions
   */
  private getPageSize(size: string, orientation: string): [number, number] {
    // Dimensions in points (1 point = 1/72 inch)
    const sizes: Record<string, [number, number]> = {
      A4: [595, 842],
      A3: [842, 1191],
      A5: [420, 595],
      letter: [612, 792],
      legal: [612, 1008],
      tabloid: [792, 1224],
    };

    let [width, height] = sizes[size] || sizes.A4;

    // Swap for landscape
    if (orientation === "landscape") {
      [width, height] = [height, width];
    }

    return [width, height];
  }

  /**
   * Format metadata as readable text
   */
  private formatMetadata(metadata: ImageMetadata): string {
    const lines = [
      `Image Metadata`,
      `=============`,
      ``,
      `Format: ${metadata.format.toUpperCase()}`,
      `Dimensions: ${metadata.width}x${metadata.height} pixels`,
      `Color Space: ${metadata.space}`,
      `Channels: ${metadata.channels}`,
      `Bit Depth: ${metadata.depth}`,
      `Has Alpha: ${metadata.hasAlpha ? "Yes" : "No"}`,
    ];

    if (metadata.density) {
      lines.push(`Density: ${metadata.density} DPI`);
    }

    if (metadata.size) {
      const sizeMB = (metadata.size / (1024 * 1024)).toFixed(2);
      lines.push(`File Size: ${sizeMB} MB`);
    }

    if (metadata.isAnimated) {
      lines.push(`Animated: Yes (${metadata.pages} frames)`);
    }

    if (metadata.exif && Object.keys(metadata.exif).length > 0) {
      lines.push(``, `EXIF Data:`);
      Object.entries(metadata.exif).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`);
      });
    }

    return lines.join("\n");
  }

  /**
   * Create image from buffer
   */
  static async fromBuffer(
    buffer: Buffer,
    format?: ImageFormat,
  ): Promise<Image> {
    const metadata = await getImageInfo(buffer);
    const detectedFormat = format || (await detectImageFormat(buffer));

    if (!detectedFormat) {
      throw new UnsupportedFormatError("Unknown image format");
    }

    return {
      buffer,
      format: detectedFormat,
      width: metadata.width,
      height: metadata.height,
      metadata,
    };
  }
}
