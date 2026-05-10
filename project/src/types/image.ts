/**
 * Image processing types and interfaces
 */

/**
 * Supported image formats
 */
export type ImageFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "tiff"
  | "webp"
  | "gif"
  | "bmp"
  | "avif";

/**
 * Image data structure
 */
export interface Image {
  /** Image buffer data */
  buffer: Buffer;

  /** Image format */
  format: ImageFormat;

  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** Optional metadata */
  metadata?: ImageMetadata;
}

/**
 * Comprehensive image metadata
 */
export interface ImageMetadata {
  /** Format name */
  format: string;

  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** Color space (srgb, rgb, cmyk, etc.) */
  space: string;

  /** Number of channels */
  channels: number;

  /** Bit depth per channel */
  depth: string;

  /** Pixel density (DPI) */
  density?: number;

  /** Has alpha channel */
  hasAlpha: boolean;

  /** File size in bytes */
  size?: number;

  /** EXIF data (if available) */
  exif?: Record<string, any>;

  /** ICC color profile */
  icc?: boolean;

  /** Orientation (1-8, EXIF standard) */
  orientation?: number;

  /** Is animated (GIF, WebP) */
  isAnimated?: boolean;

  /** Number of pages/frames */
  pages?: number;
}

/**
 * Image processing options
 */
export interface ImageOptions {
  /** Output quality (1-100, higher is better) */
  quality?: number;

  /** PNG compression level (0-9, higher is more compression) */
  compression?: number;

  /** Target width in pixels */
  width?: number;

  /** Target height in pixels */
  height?: number;

  /** How to fit image to dimensions */
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";

  /** Background color for transparent images */
  background?: string;

  /** Resize kernel (sharp interpolation method) */
  kernel?: "nearest" | "cubic" | "mitchell" | "lanczos2" | "lanczos3";

  /** Apply blur (sigma value) */
  blur?: number;

  /** Apply sharpen */
  sharpen?: boolean;

  /** Convert to grayscale */
  grayscale?: boolean;

  /** Rotate degrees (0, 90, 180, 270) */
  rotate?: number;

  /** Flip horizontally */
  flip?: boolean;

  /** Flop vertically */
  flop?: boolean;

  /** Preserve metadata in output */
  preserveMetadata?: boolean;

  /** Strip all metadata */
  stripMetadata?: boolean;
}

/**
 * Image to PDF conversion options
 */
export interface ImageToPDFOptions {
  /** PDF page size */
  pageSize?: "A4" | "A3" | "A5" | "letter" | "legal" | "tabloid";

  /** Page orientation */
  orientation?: "portrait" | "landscape";

  /** Page margin in points (1/72 inch) */
  margin?:
    | number
    | {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };

  /** How to fit image on page */
  fit?: "contain" | "cover" | "fill";

  /** Image quality for PDF embedding (1-100) */
  quality?: number;

  /** Center image on page */
  center?: boolean;

  /** Add image title as text */
  title?: string;

  /** Compress images in PDF */
  compress?: boolean;
}

/**
 * PDF to image conversion options
 */
export interface PDFToImageOptions {
  /** Output image format */
  format?: ImageFormat;

  /** Image quality (1-100) */
  quality?: number;

  /** Scale factor (1 = 72 DPI, 2 = 144 DPI, etc.) */
  scale?: number;

  /** Specific pages to convert (0-indexed) */
  pages?: number[];

  /** Convert all pages */
  allPages?: boolean;

  /** Image width in pixels (maintains aspect ratio) */
  width?: number;

  /** Image height in pixels (maintains aspect ratio) */
  height?: number;

  /** Background color for transparent areas */
  background?: string;
}

/**
 * Image optimization options
 */
export interface OptimizationOptions {
  /** Target quality (1-100) */
  quality?: number;

  /** Maximum width */
  maxWidth?: number;

  /** Maximum height */
  maxHeight?: number;

  /** Maximum file size in bytes */
  maxSize?: number;

  /** Progressive rendering for JPG */
  progressive?: boolean;

  /** Lossless compression where possible */
  lossless?: boolean;

  /** Strip metadata to reduce size */
  stripMetadata?: boolean;

  /** Effort level for WebP (0-6, higher is slower but smaller) */
  effort?: number;
}

/**
 * Image dimensions calculation result
 */
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Batch image processing result
 */
export interface ImageProcessingResult {
  /** Original filename */
  filename: string;

  /** Processing success */
  success: boolean;

  /** Output buffer (if successful) */
  buffer?: Buffer;

  /** Error message (if failed) */
  error?: string;

  /** Original size in bytes */
  originalSize: number;

  /** Output size in bytes (if successful) */
  outputSize?: number;

  /** Compression ratio */
  compressionRatio?: number;

  /** Processing time in milliseconds */
  duration: number;
}
