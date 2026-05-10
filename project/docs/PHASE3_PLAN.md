# Phase 3 Implementation Plan

## Overview

Phase 3 adds two critical capabilities:

1. **Image Format Support** - PNG, JPG, TIFF, WebP conversion and processing
2. **PDF Generation** - Create PDFs from Markdown, HTML, and DOCX

---

## Track 1: Image Support (Quick Win)

### Objective

Add comprehensive image processing and conversion capabilities using the already-installed `sharp` library.

### Implementation Components

#### 1. Image Converter (`src/converters/image/image-converter.ts`)

**Capabilities:**

- Image format conversion (PNG ↔ JPG ↔ TIFF ↔ WebP)
- Image → PDF conversion with layout options
- Image optimization (resize, compress, quality)
- Metadata extraction (dimensions, format, EXIF)
- Batch image processing

**Methods:**

```typescript
class ImageConverter implements Converter {
  // Read image metadata
  async parse(buffer: Buffer): Promise<Document>;

  // Convert between formats
  async convert(
    input: Buffer,
    from: Format,
    to: Format,
    options?: ConversionOptions,
  ): Promise<Buffer>;

  // Helper methods
  private async imageToImage(
    buffer: Buffer,
    to: Format,
    options: ImageOptions,
  ): Promise<Buffer>;
  private async imageToPDF(
    buffer: Buffer,
    options: ImageToPDFOptions,
  ): Promise<Buffer>;
  private async optimizeImage(
    buffer: Buffer,
    options: OptimizationOptions,
  ): Promise<Buffer>;

  // Static factory methods
  static fromBuffer(buffer: Buffer, format: ImageFormat): Promise<Image>;
}
```

#### 2. PDF Image Extraction Enhancement (`src/converters/pdf/pdf-converter.ts`)

**New Capabilities:**

- Extract images from PDF pages
- Convert PDF pages to images (rasterization)
- Preserve image quality during extraction

**Methods:**

```typescript
class PDFConverter {
  // NEW: Extract images from PDF
  async extractImages(buffer: Buffer): Promise<Image[]>;

  // NEW: Convert PDF pages to images
  async pdfToImages(
    buffer: Buffer,
    options: PDFToImageOptions,
  ): Promise<Buffer[]>;
}
```

#### 3. Image Types (`src/types/image.ts`)

**New Types:**

```typescript
interface Image {
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  height: number;
  metadata?: ImageMetadata;
}

interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  space: string;
  channels: number;
  depth: string;
  density?: number;
  hasAlpha: boolean;
  exif?: Record<string, any>;
}

interface ImageOptions {
  quality?: number; // 1-100
  compression?: number; // 0-9 for PNG
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  background?: string;
}

interface ImageToPDFOptions {
  pageSize?: "A4" | "letter" | "legal" | "A3";
  orientation?: "portrait" | "landscape";
  margin?: number;
  fit?: "contain" | "cover" | "fill";
}
```

#### 4. Image Utilities (`lib/image-utils.ts`)

**Helper Functions:**

```typescript
// Detect image format from buffer
export async function detectImageFormat(buffer: Buffer): Promise<ImageFormat>;

// Validate image buffer
export function isValidImage(buffer: Buffer): Promise<boolean>;

// Calculate optimal dimensions
export function calculateDimensions(
  original: { width: number; height: number },
  target: { width?: number; height?: number },
  fit: string,
): { width: number; height: number };

// Get image info without loading full buffer
export async function getImageInfo(buffer: Buffer): Promise<ImageMetadata>;
```

---

## Track 2: PDF Generation (High Value)

### Objective

Generate high-quality PDFs from Markdown, HTML, and DOCX using Puppeteer for HTML rendering.

### Implementation Components

#### 1. PDF Generator Module (`src/converters/pdf/pdf-generator.ts`)

**Capabilities:**

- HTML → PDF with custom styling
- Markdown → PDF (via HTML)
- DOCX → PDF (via HTML)
- Custom templates and CSS
- Headers, footers, page numbers
- Table of contents generation

**Methods:**

```typescript
class PDFGenerator {
  private browser?: Browser;

  // Initialize Puppeteer browser
  async initialize(): Promise<void>;

  // Generate PDF from HTML
  async generateFromHTML(
    html: string,
    options: PDFGenerationOptions,
  ): Promise<Buffer>;

  // Generate PDF from Markdown
  async generateFromMarkdown(
    markdown: string,
    options: PDFGenerationOptions,
  ): Promise<Buffer>;

  // Generate PDF from DOCX (via HTML)
  async generateFromDOCX(
    docxBuffer: Buffer,
    options: PDFGenerationOptions,
  ): Promise<Buffer>;

  // Apply template
  private async applyTemplate(
    content: string,
    template: PDFTemplate,
  ): Promise<string>;

  // Cleanup
  async close(): Promise<void>;
}
```

#### 2. PDF Templates (`src/converters/pdf/templates/`)

**Template Files:**

- `default.css` - Clean, professional default styling
- `academic.css` - Academic paper layout
- `report.css` - Business report styling
- `book.css` - Book/documentation layout
- `minimal.css` - Minimal styling

**Template Structure:**

```typescript
interface PDFTemplate {
  name: string;
  css: string;
  htmlWrapper: string;
  headerHTML?: string;
  footerHTML?: string;
}
```

#### 3. Enhanced PDF Converter (`src/converters/pdf/pdf-converter.ts`)

**Updated Methods:**

```typescript
class PDFConverter {
  private generator?: PDFGenerator;

  // NEW: Generate PDF (routes to generator)
  private async generatePDF(
    content: string,
    from: Format,
    options: ConversionOptions,
  ): Promise<Buffer>;

  // Updated convert method to handle generation
  async convert(
    input: Buffer,
    from: Format,
    to: Format,
    options?: ConversionOptions,
  ): Promise<Buffer> {
    if (to === "pdf") {
      return this.generatePDF(input.toString(), from, options);
    }
    // ... existing conversion logic
  }
}
```

#### 4. PDF Generation Types (`src/types/pdf.ts`)

**New Types:**

```typescript
interface PDFGenerationOptions {
  template?: string; // Template name
  customCSS?: string; // Additional CSS
  pageSize?: "A4" | "letter" | "legal" | "A3";
  orientation?: "portrait" | "landscape";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  header?: {
    enabled: boolean;
    template?: string;
    height?: string;
  };
  footer?: {
    enabled: boolean;
    template?: string;
    height?: string;
  };
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  scale?: number;

  // Advanced options
  tocEnabled?: boolean; // Generate table of contents
  pageNumbers?: boolean; // Add page numbers
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  };
}

interface PDFPageOptions {
  width?: string;
  height?: string;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  isLandscape?: boolean;
}
```

#### 5. PDF Generation Utilities (`lib/pdf-utils.ts`)

**Helper Functions:**

```typescript
// Load template by name
export async function loadTemplate(name: string): Promise<PDFTemplate>;

// Wrap content in HTML structure
export function wrapHTML(content: string, title?: string, css?: string): string;

// Generate table of contents from headings
export function generateTOC(html: string): string;

// Add page numbers to footer
export function addPageNumbers(footerTemplate: string): string;

// Sanitize HTML for PDF generation
export function sanitizeForPDF(html: string): string;

// Optimize images for PDF
export async function optimizeImagesForPDF(html: string): Promise<string>;
```

---

## Implementation Sequence

### Phase 3.1: Image Support (Week 1)

1. **Day 1-2: Core Image Converter**
   - Create `image-converter.ts`
   - Implement format conversion
   - Add metadata extraction
   - Create image types

2. **Day 3: Image → PDF**
   - Implement `imageToPDF` method
   - Add layout options
   - Test with various image sizes

3. **Day 4: PDF → Image Enhancement**
   - Add `extractImages` to PDF converter
   - Implement `pdfToImages` rasterization
   - Integration testing

4. **Day 5: Tests & Documentation**
   - Comprehensive test suite
   - Update FEATURES.md
   - Add usage examples
   - CLI integration

### Phase 3.2: PDF Generation (Week 2)

1. **Day 1-2: PDF Generator Core**
   - Create `pdf-generator.ts`
   - Integrate Puppeteer
   - Implement HTML → PDF
   - Add basic templates

2. **Day 3: Markdown → PDF Pipeline**
   - Markdown → HTML conversion
   - Apply styling and templates
   - Test with complex documents

3. **Day 4: Advanced Features**
   - Headers and footers
   - Table of contents generation
   - Page numbers
   - Custom CSS templates

4. **Day 5: DOCX → PDF & Polish**
   - DOCX → HTML → PDF pipeline
   - Template library completion
   - Comprehensive testing
   - Documentation

---

## Dependencies

### New Dependencies to Add

```json
{
  "dependencies": {
    "puppeteer": "^22.0.0" // PDF generation
  },
  "devDependencies": {
    "@types/puppeteer": "^7.0.4" // TypeScript types
  }
}
```

### Already Installed (No Change)

- `sharp ^0.33.3` - Image processing
- `pdf-lib ^1.17.1` - PDF manipulation
- `mammoth ^1.7.2` - DOCX parsing
- `marked ^12.0.2` - Markdown parsing

---

## Testing Strategy

### Image Converter Tests

```typescript
describe("ImageConverter", () => {
  test("converts PNG to JPG with quality control");
  test("converts JPG to WebP with optimization");
  test("extracts image metadata correctly");
  test("creates PDF from image with layout options");
  test("handles invalid image gracefully");
  test("optimizes large images");
  test("preserves EXIF data when requested");
});
```

### PDF Generator Tests

```typescript
describe("PDFGenerator", () => {
  test("generates PDF from simple HTML");
  test("generates PDF from Markdown with styling");
  test("applies custom CSS templates");
  test("adds headers and footers correctly");
  test("generates table of contents");
  test("handles page breaks properly");
  test("embeds images in PDF");
  test("creates multi-page documents");
});
```

---

## Performance Targets

### Image Operations

- Format conversion: <500ms for images <5MB
- Image → PDF: <1s per image
- Optimization: <300ms per image
- Metadata extraction: <50ms

### PDF Generation

- Simple document (1-5 pages): <2s
- Medium document (10-20 pages): <5s
- Large document (50+ pages): <15s
- Markdown → PDF: <3s for typical document

---

## Documentation Updates

### Files to Create/Update

1. **PHASE3_SUMMARY.md** - Complete Phase 3 implementation details
2. **FEATURES.md** - Update conversion matrix with image and PDF generation
3. **QUICKSTART.md** - Add examples for new features
4. **CLI README** - Document new options
5. **FIRST_FEATURES.md** - Add Version 0.3.0 section

### Example Documentation

```markdown
## Image Conversion Examples

# Convert PNG to JPG

vf convert image.png image.jpg --quality 90

# Create PDF from image

vf convert photo.jpg photo.pdf --page-size A4

# Optimize images

vf batch "\*.png" --to webp --quality 80

## PDF Generation Examples

# Markdown to PDF

vf convert README.md README.pdf --template academic

# DOCX to PDF

vf convert report.docx report.pdf --header --footer

# Custom styling

vf convert doc.md doc.pdf --css custom.css --toc
```

---

## Success Criteria

### Image Support ✅

- [ ] 4+ image formats supported (PNG, JPG, TIFF, WebP)
- [ ] Image → PDF conversion working
- [ ] PDF → Image extraction working
- [ ] Metadata extraction functional
- [ ] 90%+ test coverage
- [ ] CLI commands working
- [ ] Documentation complete

### PDF Generation ✅

- [ ] HTML → PDF generation working
- [ ] Markdown → PDF pipeline functional
- [ ] DOCX → PDF conversion working
- [ ] 3+ templates available
- [ ] Headers/footers working
- [ ] TOC generation functional
- [ ] 90%+ test coverage
- [ ] Documentation complete

---

## Risk Mitigation

### Technical Risks

1. **Puppeteer Size** - Large dependency (~300MB)
   - Mitigation: Make it optional, offer lightweight alternative
   - Consider: `puppeteer-core` + separate Chromium

2. **PDF Generation Performance** - Slow for large documents
   - Mitigation: Streaming, progress indicators, caching
   - Consider: Parallel page generation

3. **Image Memory Usage** - Large images consume memory
   - Mitigation: Sharp's streaming API, chunk processing
   - Consider: File-based processing for very large images

4. **Browser Stability** - Puppeteer browser crashes
   - Mitigation: Proper error handling, automatic restart
   - Consider: Health checks, timeout limits

### Operational Risks

1. **Breaking Changes** - New features break existing code
   - Mitigation: Comprehensive test suite, semantic versioning
   - Strategy: Feature flags, gradual rollout

2. **Documentation Lag** - Features undocumented
   - Mitigation: Write docs alongside code
   - Strategy: Examples in tests, inline TSDoc

---

## Post-Implementation

### Immediate Next Steps (Phase 4 Candidates)

1. **Performance Optimization** - Streaming, workers, caching
2. **Enhanced DOCX Formatting** - Tables, images, styles
3. **PPTX Reading** - Full slide parsing
4. **Cloud Integration** - S3, Google Drive, OneDrive
5. **Web UI** - Browser-based converter
6. **Plugin System** - Custom converters

### Maintenance Plan

- Weekly: Review issues and PRs
- Monthly: Dependency updates
- Quarterly: Performance benchmarks
- Annually: Major version planning

---

**Status**: Ready for Implementation 🚀
**Start Date**: May 10, 2026
**Target Completion**: May 24, 2026 (2 weeks)
