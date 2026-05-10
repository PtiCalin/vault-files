/**
 * PDF generation types and interfaces
 */

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  /** Template name or 'default' */
  template?: string;

  /** Additional custom CSS */
  customCSS?: string;

  /** PDF page size */
  pageSize?: "A4" | "A3" | "A5" | "letter" | "legal" | "tabloid";

  /** Page orientation */
  orientation?: "portrait" | "landscape";

  /** Page margins */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  /** Header configuration */
  header?: {
    enabled: boolean;
    template?: string;
    height?: string;
  };

  /** Footer configuration */
  footer?: {
    enabled: boolean;
    template?: string;
    height?: string;
  };

  /** Display header and footer */
  displayHeaderFooter?: boolean;

  /** Print background graphics */
  printBackground?: boolean;

  /** Prefer CSS page size */
  preferCSSPageSize?: boolean;

  /** Scale of the webpage rendering (default: 1) */
  scale?: number;

  /** Generate table of contents */
  tocEnabled?: boolean;

  /** Add page numbers to footer */
  pageNumbers?: boolean;

  /** PDF metadata */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  };
}

/**
 * PDF page options for Puppeteer
 */
export interface PDFPageOptions {
  /** Page width */
  width?: string;

  /** Page height */
  height?: string;

  /** Device scale factor */
  deviceScaleFactor?: number;

  /** Is mobile viewport */
  isMobile?: boolean;

  /** Has touch support */
  hasTouch?: boolean;

  /** Is landscape */
  isLandscape?: boolean;
}

/**
 * PDF template structure
 */
export interface PDFTemplate {
  /** Template name */
  name: string;

  /** Template CSS */
  css: string;

  /** HTML wrapper template */
  htmlWrapper: string;

  /** Optional header HTML */
  headerHTML?: string;

  /** Optional footer HTML */
  footerHTML?: string;

  /** Template description */
  description?: string;
}

/**
 * Table of contents entry
 */
export interface TOCEntry {
  /** Heading text */
  text: string;

  /** Heading level (1-6) */
  level: number;

  /** Anchor ID */
  id: string;

  /** Page number (if known) */
  page?: number;
}

/**
 * PDF generation result
 */
export interface PDFGenerationResult {
  /** Generated PDF buffer */
  buffer: Buffer;

  /** Number of pages */
  pageCount: number;

  /** File size in bytes */
  size: number;

  /** Generation time in milliseconds */
  duration: number;

  /** Template used */
  template: string;

  /** Any warnings during generation */
  warnings?: string[];
}
