# vault-files Base Module

The core document processing engine for vault-files - the ultimate file conversion and document management platform.

## Architecture Overview

### Core Components

```
src/
├── types/              # Type definitions
│   ├── document.ts     # Document models & enums
│   ├── converter.ts    # Converter interfaces
│   ├── errors.ts       # Custom error classes
│   └── index.ts        # Type exports
├── core/               # Core processing engine
│   ├── document-processor.ts  # Main processor
│   ├── converter-registry.ts  # Converter management
│   └── index.ts
├── converters/         # Format converters
│   ├── pdf/           # PDF converter
│   ├── markdown/      # Markdown converter
│   ├── docx/          # Word converter
│   ├── pptx/          # PowerPoint converter
│   └── index.ts
└── index.ts           # Main API entry point

lib/                   # Utility libraries
├── file-utils.ts      # File I/O operations
├── validation-utils.ts # Input validation
├── logger.ts          # Structured logging
└── index.ts
```

## Features

### Current Implementation Status

✅ **Type System**
- Complete type definitions for documents, converters, and errors
- DocumentFormat enum with 15+ supported formats
- Comprehensive metadata interfaces
- Custom error hierarchy

✅ **Core Engine**
- DocumentProcessor for orchestrating operations
- ConverterRegistry for managing converter instances
- Support for multiple operation types (convert, compress, merge, split, etc.)

✅ **Utility Library**
- File I/O with format detection
- Page range parsing and validation
- Structured logging with context
- Input validation utilities

✅ **Converters**
- PDF: Basic parsing, conversion to Markdown/TXT
- Markdown: Full GFM support, conversion to HTML/TXT, front matter extraction
- DOCX: Placeholder implementation
- PPTX: Placeholder implementation

✅ **Testing**
- Jest configuration with 80% coverage threshold
- Unit tests for utilities and converters
- Integration tests for core components

### Planned Features

🚧 **PDF Processing** (Next Priority)
- Text extraction using pdf-parse
- PDF compression and optimization
- Page merging and splitting
- Watermarking

🚧 **DOCX Processing**
- Full parsing with mammoth
- Generation with docx library
- Bidirectional conversion with PDF/Markdown

🚧 **PPTX Processing**
- Slide generation with pptxgenjs
- Conversion from Markdown
- Image handling

🚧 **OCR Integration**
- tesseract.js integration
- Image-based PDF text extraction
- Multi-language support

🚧 **Advanced Operations**
- Batch processing
- Template system
- Plugin architecture

## Usage

### Basic Conversion

```typescript
import { convertDocument } from 'vault-files'

// Convert Markdown to HTML
await convertDocument('input.md', 'output.html')

// Convert PDF to Markdown
await convertDocument('document.pdf', 'document.md', {
  preserveFormatting: true
})
```

### Document Parsing

```typescript
import { parseDocument } from 'vault-files'

// Parse and extract content
const content = await parseDocument('document.pdf')
console.log(content.metadata)
console.log(content.text)
```

### Direct Converter Usage

```typescript
import { MarkdownConverter, DocumentFormat } from 'vault-files'

const converter = new MarkdownConverter()
const markdown = '# Hello World\n\nContent here.'

const result = await converter.convert(
  markdown,
  DocumentFormat.HTML,
  { preserveFormatting: true }
)

if (result.success) {
  console.log(result.outputBuffer.toString())
}
```

### Registry Management

```typescript
import { converterRegistry, getSupportedFormats, canConvert } from 'vault-files'

// Check supported formats
const formats = getSupportedFormats()
console.log(formats) // [PDF, MARKDOWN, DOCX, PPTX]

// Check conversion support
if (canConvert(DocumentFormat.MARKDOWN, DocumentFormat.HTML)) {
  console.log('Conversion supported!')
}

// Get supported targets
const targets = getSupportedTargets(DocumentFormat.MARKDOWN)
console.log(targets) // [HTML, TXT, MARKDOWN]
```

### Metadata Extraction

```typescript
import { extractMetadata } from 'vault-files'

const metadata = await extractMetadata('document.pdf')
console.log({
  title: metadata.title,
  author: metadata.author,
  pageCount: metadata.pageCount,
  format: metadata.format
})
```

### Advanced Processing

```typescript
import { DocumentProcessor, OperationType } from 'vault-files'

const processor = new DocumentProcessor()

const result = await processor.process(inputBuffer, [
  {
    type: OperationType.CONVERT,
    options: { targetFormat: DocumentFormat.PDF }
  },
  {
    type: OperationType.COMPRESS,
    options: { quality: 'medium' }
  }
])
```

## API Reference

### Main Functions

#### `convertDocument(inputPath, outputPath, options?)`
Convert a document from one format to another.

**Parameters:**
- `inputPath: string` - Path to input file
- `outputPath: string` - Path to output file
- `options?: ConversionOptions` - Conversion options

**Returns:** `Promise<ConversionResult>`

#### `parseDocument(input)`
Parse document and extract content.

**Parameters:**
- `input: string | Buffer` - File path or buffer

**Returns:** `Promise<DocumentContent>`

#### `extractMetadata(input)`
Extract metadata from document.

**Parameters:**
- `input: string | Buffer` - File path or buffer

**Returns:** `Promise<DocumentMetadata>`

#### `validateDocument(input)`
Validate document format and structure.

**Parameters:**
- `input: string | Buffer` - File path or buffer

**Returns:** `Promise<boolean>`

### Core Classes

#### `DocumentProcessor`
Main document processing engine.

**Methods:**
- `process(input, operations)` - Process document with operations
- `validate(input)` - Validate document
- `extractMetadata(input)` - Extract metadata

#### `ConverterRegistry`
Manages converter instances.

**Methods:**
- `register(format, converter)` - Register a converter
- `get(format)` - Get converter for format
- `canConvert(from, to)` - Check conversion support
- `getSupportedFormats()` - Get all supported formats
- `getSupportedTargets(format)` - Get conversion targets

#### Converters
All converters implement the `IConverter` interface:

**Methods:**
- `convert(input, targetFormat, options?)` - Convert to target format
- `parse(input)` - Parse and extract content
- `supports(format)` - Check format support

**Available Converters:**
- `PDFConverter` - PDF operations
- `MarkdownConverter` - Markdown processing
- `DOCXConverter` - Word documents (placeholder)
- `PPTXConverter` - PowerPoint (placeholder)

### Utility Classes

#### `FileUtils`
File system operations and format detection.

**Methods:**
- `readFile(path)` - Read file as buffer
- `writeFile(path, data)` - Write buffer to file
- `getFileInfo(path)` - Get file metadata
- `detectFormat(buffer)` - Detect document format
- `getFormatFromExtension(ext)` - Map extension to format
- `validateFileSize(buffer, maxMB)` - Validate file size
- `generateOutputFilename(input, format, suffix?)` - Generate output path

#### `ValidationUtils`
Input validation utilities.

**Methods:**
- `validateBuffer(buffer)` - Validate buffer not empty
- `validateFormat(format, supported)` - Validate format support
- `validateConversionPath(from, to, paths)` - Validate conversion exists
- `validatePageRange(range, total)` - Parse and validate page ranges
- `validateQuality(quality)` - Validate quality option
- `validateDPI(dpi)` - Validate DPI value

#### `Logger`
Structured logging with context.

**Methods:**
- `info(message, meta?)` - Log info
- `warn(message, meta?)` - Log warning
- `error(message, error?, meta?)` - Log error
- `debug(message, meta?)` - Log debug (dev only)

## Type Definitions

### DocumentFormat
Enum of supported document formats:
```typescript
enum DocumentFormat {
  PDF = 'pdf',
  MARKDOWN = 'md',
  DOCX = 'docx',
  PPTX = 'pptx',
  HTML = 'html',
  TXT = 'txt',
  EPUB = 'epub',
  RTF = 'rtf',
  ODT = 'odt',
  JPG = 'jpg',
  PNG = 'png',
  TIFF = 'tiff',
  SVG = 'svg',
  WEBP = 'webp'
}
```

### ConversionOptions
Options for conversion operations:
```typescript
interface ConversionOptions {
  quality?: 'low' | 'medium' | 'high'
  preserveFormatting?: boolean
  compress?: boolean
  pageRanges?: string  // e.g., "1-5,7,9-12"
  password?: string
  metadata?: Partial<DocumentMetadata>
}
```

### ConversionResult
Result of conversion operation:
```typescript
interface ConversionResult {
  success: boolean
  outputBuffer?: Buffer
  outputPath?: string
  error?: Error
  processingTime?: number
  warnings?: string[]
}
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@types/*` → `src/types/*`
- `@core/*` → `src/core/*`
- `@converters/*` → `src/converters/*`
- `@lib/*` → `lib/*`

## Error Handling

The module includes a comprehensive error hierarchy:

```typescript
// Base error
class VaultFilesError extends Error

// Specific errors
class ConversionError extends VaultFilesError
class ValidationError extends VaultFilesError
class FileNotFoundError extends VaultFilesError
class UnsupportedFormatError extends VaultFilesError
class ProcessingError extends VaultFilesError
```

All errors include detailed context:
```typescript
try {
  await convertDocument('input.pdf', 'output.md')
} catch (error) {
  if (error instanceof ConversionError) {
    console.log(error.sourceFormat)  // 'pdf'
    console.log(error.targetFormat)  // 'md'
  }
}
```

## Next Steps

### Immediate Priorities
1. Implement PDF text extraction (pdf-parse)
2. Complete DOCX converter (mammoth + docx)
3. Implement PPTX converter (pptxgenjs)
4. Add OCR support (tesseract.js)

### Medium-term Goals
1. Template system for document generation
2. Batch processing API
3. Plugin architecture
4. Web interface (React)

### Long-term Vision
1. Cloud integration (S3, Azure Blob, Google Drive)
2. Collaboration features
3. Mobile apps
4. Enterprise API

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../../LICENSE)
