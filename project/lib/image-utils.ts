/**
 * Image processing utilities
 * Helper functions for image operations, format detection, and dimension calculations
 */

import type {
  ImageDimensions,
  ImageFormat,
  ImageMetadata,
  ImageOptions,
} from "@types/image";
import sharp from "sharp";
import { logger } from "./logger";

/**
 * Detect image format from buffer
 * @param buffer - Image buffer
 * @returns Detected image format or null if not an image
 */
export async function detectImageFormat(
  buffer: Buffer,
): Promise<ImageFormat | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    return (metadata.format as ImageFormat) || null;
  } catch (error) {
    logger.error("Failed to detect image format", { error });
    return null;
  }
}

/**
 * Validate if buffer contains a valid image
 * @param buffer - Buffer to validate
 * @returns True if valid image
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    await sharp(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get detailed image metadata without loading full image
 * @param buffer - Image buffer
 * @returns Image metadata
 */
export async function getImageInfo(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  const stats = await sharp(buffer).stats();

  return {
    format: metadata.format || "unknown",
    width: metadata.width || 0,
    height: metadata.height || 0,
    space: metadata.space || "srgb",
    channels: metadata.channels || 0,
    depth: metadata.depth || "uchar",
    density: metadata.density,
    hasAlpha: metadata.hasAlpha || false,
    size: metadata.size,
    exif: metadata.exif,
    icc: !!metadata.icc,
    orientation: metadata.orientation,
    isAnimated: metadata.pages ? metadata.pages > 1 : false,
    pages: metadata.pages,
  };
}

/**
 * Calculate optimal dimensions for resize
 * @param original - Original dimensions
 * @param target - Target dimensions (width and/or height)
 * @param fit - Fit strategy
 * @returns Calculated dimensions
 */
export function calculateDimensions(
  original: { width: number; height: number },
  target: { width?: number; height?: number },
  fit: string = "contain",
): ImageDimensions {
  const aspectRatio = original.width / original.height;

  // No target dimensions - return original
  if (!target.width && !target.height) {
    return {
      width: original.width,
      height: original.height,
      aspectRatio,
    };
  }

  // Only width specified
  if (target.width && !target.height) {
    return {
      width: target.width,
      height: Math.round(target.width / aspectRatio),
      aspectRatio,
    };
  }

  // Only height specified
  if (target.height && !target.width) {
    return {
      width: Math.round(target.height * aspectRatio),
      height: target.height,
      aspectRatio,
    };
  }

  // Both dimensions specified - apply fit strategy
  const targetWidth = target.width!;
  const targetHeight = target.height!;

  switch (fit) {
    case "contain": {
      // Fit inside target, maintaining aspect ratio
      const scale = Math.min(
        targetWidth / original.width,
        targetHeight / original.height,
      );
      return {
        width: Math.round(original.width * scale),
        height: Math.round(original.height * scale),
        aspectRatio,
      };
    }

    case "cover": {
      // Cover target, maintaining aspect ratio (may crop)
      const scale = Math.max(
        targetWidth / original.width,
        targetHeight / original.height,
      );
      return {
        width: Math.round(original.width * scale),
        height: Math.round(original.height * scale),
        aspectRatio,
      };
    }

    case "fill": {
      // Stretch to fill target exactly (distorts aspect ratio)
      return {
        width: targetWidth,
        height: targetHeight,
        aspectRatio: targetWidth / targetHeight,
      };
    }

    case "inside": {
      // Resize only if larger than target
      if (original.width <= targetWidth && original.height <= targetHeight) {
        return {
          width: original.width,
          height: original.height,
          aspectRatio,
        };
      }
      return calculateDimensions(original, target, "contain");
    }

    case "outside": {
      // Resize only if smaller than target
      if (original.width >= targetWidth && original.height >= targetHeight) {
        return {
          width: original.width,
          height: original.height,
          aspectRatio,
        };
      }
      return calculateDimensions(original, target, "cover");
    }

    default:
      return calculateDimensions(original, target, "contain");
  }
}

/**
 * Estimate output file size for image conversion
 * @param metadata - Image metadata
 * @param format - Target format
 * @param quality - Quality setting (1-100)
 * @returns Estimated size in bytes
 */
export function estimateOutputSize(
  metadata: ImageMetadata,
  format: ImageFormat,
  quality: number = 80,
): number {
  const pixels = metadata.width * metadata.height;

  // Rough estimates based on format and quality
  switch (format) {
    case "png":
      return Math.round(pixels * 3 * (quality / 100));

    case "jpg":
    case "jpeg":
      return Math.round(pixels * (quality / 100) * 0.3);

    case "webp":
      return Math.round(pixels * (quality / 100) * 0.25);

    case "tiff":
      return Math.round(pixels * 3);

    case "avif":
      return Math.round(pixels * (quality / 100) * 0.2);

    case "bmp":
      return Math.round(pixels * 3);

    case "gif":
      return Math.round(pixels * 0.5);

    default:
      return Math.round(pixels * 2);
  }
}

/**
 * Apply image processing options to sharp instance
 * @param image - Sharp instance
 * @param options - Processing options
 * @returns Modified sharp instance
 */
export function applyImageOptions(
  image: sharp.Sharp,
  options: ImageOptions,
): sharp.Sharp {
  let result = image;

  // Resize
  if (options.width || options.height) {
    result = result.resize({
      width: options.width,
      height: options.height,
      fit: options.fit as any,
      kernel: options.kernel as any,
      background: options.background,
    });
  }

  // Rotate
  if (options.rotate) {
    result = result.rotate(options.rotate);
  }

  // Flip
  if (options.flip) {
    result = result.flip();
  }

  // Flop
  if (options.flop) {
    result = result.flop();
  }

  // Blur
  if (options.blur) {
    result = result.blur(options.blur);
  }

  // Sharpen
  if (options.sharpen) {
    result = result.sharpen();
  }

  // Grayscale
  if (options.grayscale) {
    result = result.grayscale();
  }

  // Metadata handling
  if (options.stripMetadata) {
    result = result.withMetadata({
      orientation: undefined,
      exif: {},
      icc: undefined,
    });
  } else if (!options.preserveMetadata) {
    // Default: strip EXIF but keep orientation
    result = result.withMetadata({
      exif: {},
    });
  }

  return result;
}

/**
 * Get format-specific output options for sharp
 * @param format - Target image format
 * @param options - Processing options
 * @returns Sharp format options
 */
export function getFormatOptions(
  format: ImageFormat,
  options: ImageOptions,
): any {
  const quality = options.quality || 80;

  switch (format) {
    case "jpg":
    case "jpeg":
      return {
        quality,
        progressive: true,
        mozjpeg: true,
      };

    case "png":
      return {
        compressionLevel: options.compression || 9,
        progressive: true,
        palette: quality < 90,
      };

    case "webp":
      return {
        quality,
        lossless: options.quality === 100,
        nearLossless: options.quality && options.quality >= 90,
        effort: 6,
      };

    case "avif":
      return {
        quality,
        lossless: options.quality === 100,
        effort: 6,
      };

    case "tiff":
      return {
        quality,
        compression: "lzw",
      };

    case "gif":
      return {
        colors: quality > 90 ? 256 : 128,
      };

    default:
      return {};
  }
}

/**
 * Convert format string to Sharp format
 * @param format - Image format
 * @returns Sharp format string
 */
export function toSharpFormat(format: ImageFormat): string {
  return format === "jpg" ? "jpeg" : format;
}

/**
 * Check if format supports transparency
 * @param format - Image format
 * @returns True if format supports alpha channel
 */
export function supportsTransparency(format: ImageFormat): boolean {
  return ["png", "webp", "avif", "gif", "tiff"].includes(format);
}

/**
 * Get recommended format for image based on characteristics
 * @param metadata - Image metadata
 * @param preserveQuality - Whether to preserve maximum quality
 * @returns Recommended format
 */
export function getRecommendedFormat(
  metadata: ImageMetadata,
  preserveQuality: boolean = false,
): ImageFormat {
  // Has transparency - use modern format
  if (metadata.hasAlpha) {
    return preserveQuality ? "png" : "webp";
  }

  // Photo/complex image - use lossy format
  if (metadata.width * metadata.height > 1000000) {
    return preserveQuality ? "jpg" : "webp";
  }

  // Small image or graphic - use PNG
  return "png";
}

/**
 * Validate image options
 * @param options - Image options to validate
 * @throws Error if options are invalid
 */
export function validateImageOptions(options: ImageOptions): void {
  if (options.quality !== undefined) {
    if (options.quality < 1 || options.quality > 100) {
      throw new Error("Quality must be between 1 and 100");
    }
  }

  if (options.compression !== undefined) {
    if (options.compression < 0 || options.compression > 9) {
      throw new Error("Compression must be between 0 and 9");
    }
  }

  if (options.width !== undefined && options.width <= 0) {
    throw new Error("Width must be positive");
  }

  if (options.height !== undefined && options.height <= 0) {
    throw new Error("Height must be positive");
  }

  if (options.blur !== undefined && options.blur < 0) {
    throw new Error("Blur sigma must be non-negative");
  }

  if (options.rotate !== undefined) {
    if (![0, 90, 180, 270].includes(options.rotate)) {
      throw new Error("Rotate must be 0, 90, 180, or 270 degrees");
    }
  }
}
