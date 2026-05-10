# vault-files CLI

Command-line interface for vault-files document conversion and management.

## Installation

```bash
# Install globally
npm install -g vault-files

# Or use npx
npx vault-files --help
```

## Quick Start

```bash
# Convert a document
vf convert document.pdf document.md

# Get document information
vf info document.pdf

# Batch convert files
vf batch "*.md" --to pdf
```

## Commands

### `convert` - Convert Documents

Convert a document from one format to another.

```bash
vf convert <input> [output] [options]
```

**Arguments:**

- `input` - Input file path (required)
- `output` - Output file path (optional, auto-generated if not provided)

**Options:**

- `-f, --format <format>` - Target format (pdf, md, html, docx, pptx, txt)
- `-q, --quality <quality>` - Conversion quality: low, medium, high (default: medium)
- `-c, --compress` - Compress output file
- `--preserve-formatting` - Preserve original formatting (default: true)
- `-p, --page-ranges <ranges>` - Page ranges (e.g., "1-5,7,9-12")
- `--password <password>` - Password for protected documents
- `-v, --verbose` - Verbose output

**Examples:**

```bash
# Convert PDF to Markdown
vf convert document.pdf document.md

# Convert with format flag
vf convert input.md -f html

# High quality conversion with compression
vf convert document.pdf output.pdf -q high -c

# Convert specific pages
vf convert document.pdf pages.pdf --page-ranges "1-5,10,15-20"

# Verbose output
vf convert document.pdf output.md -v
```

### `info` - Document Information

Display information about a document including metadata, format, and file properties.

```bash
vf info <input> [options]
```

**Arguments:**

- `input` - Input file path (required)

**Options:**

- `-v, --verbose` - Show detailed information
- `-j, --json` - Output as JSON

**Examples:**

```bash
# Basic information
vf info document.pdf

# Detailed information
vf info document.pdf -v

# JSON output
vf info document.pdf -j
```

### `batch` - Batch Convert

Convert multiple files matching a pattern.

```bash
vf batch <pattern> --to <format> [options]
```

**Arguments:**

- `pattern` - File pattern (e.g., "_.md", "docs/\*\*/_.pdf")

**Options:**

- `--to <format>` - Target format (required)
- `-o, --output <dir>` - Output directory (default: same as input)
- `-q, --quality <quality>` - Conversion quality: low, medium, high (default: medium)
- `-c, --compress` - Compress output files
- `-p, --parallel <count>` - Number of parallel conversions (default: 3)
- `-v, --verbose` - Verbose output

**Examples:**

```bash
# Convert all Markdown files to PDF
vf batch "*.md" --to pdf

# Convert with output directory
vf batch "docs/**/*.md" --to html -o output/

# Parallel processing with compression
vf batch "*.pdf" --to md -p 5 -c

# High quality batch conversion
vf batch "reports/*.docx" --to pdf -q high
```

## Supported Formats

- **PDF** (.pdf) - Portable Document Format
- **Markdown** (.md) - Markdown text format
- **HTML** (.html) - HyperText Markup Language
- **DOCX** (.docx) - Microsoft Word Document
- **PPTX** (.pptx) - Microsoft PowerPoint Presentation
- **TXT** (.txt) - Plain text

## Conversion Matrix

| From ↓ / To → | PDF | MD  | HTML | DOCX | PPTX | TXT |
| ------------- | --- | --- | ---- | ---- | ---- | --- |
| **PDF**       | ✓   | ✓   | 🚧   | 🚧   | -    | ✓   |
| **Markdown**  | 🚧  | ✓   | ✓    | 🚧   | 🚧   | ✓   |
| **HTML**      | 🚧  | 🚧  | ✓    | 🚧   | 🚧   | ✓   |
| **DOCX**      | 🚧  | 🚧  | 🚧   | ✓    | -    | 🚧  |
| **PPTX**      | 🚧  | 🚧  | 🚧   | -    | ✓    | 🚧  |

Legend: ✓ Implemented | 🚧 Planned | - Not applicable

## Environment Variables

- `DEBUG=1` - Enable debug output
- `NODE_ENV=development` - Enable development mode

## Advanced Usage

### Page Ranges

Specify exact pages or ranges to convert:

```bash
# Single pages
vf convert doc.pdf --page-ranges "1,3,5"

# Ranges
vf convert doc.pdf --page-ranges "1-10"

# Mixed
vf convert doc.pdf --page-ranges "1-5,7,9-12,15"
```

### Quality Levels

- **low** - Fast conversion, reduced quality
- **medium** - Balanced quality and speed (default)
- **high** - Maximum quality, slower processing

### Compression

Enable compression to reduce output file size:

```bash
vf convert large.pdf compressed.pdf -c
```

### Protected Documents

Handle password-protected files:

```bash
vf convert protected.pdf output.md --password "mypassword"
```

## Performance Tips

1. **Batch Processing**: Use the `batch` command for multiple files
2. **Parallel Conversion**: Increase parallel count for faster batch processing
3. **Quality Settings**: Use lower quality for drafts, high quality for final output
4. **Compression**: Enable compression for large files

## Troubleshooting

### Command Not Found

```bash
# Ensure installation succeeded
npm list -g vault-files

# Or use npx
npx vault-files --help
```

### Permission Errors

```bash
# On Unix systems, ensure execute permissions
chmod +x /usr/local/bin/vf
```

### Memory Issues

For very large files, increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" vf convert large.pdf output.md
```

### Debug Mode

Enable debug output for troubleshooting:

```bash
DEBUG=1 vf convert document.pdf output.md -v
```

## Examples

### Convert Documentation

```bash
# Convert all docs to PDF
vf batch "docs/**/*.md" --to pdf -o output/pdf/

# Convert to multiple formats
vf batch "docs/*.md" --to html -o output/html/
vf batch "docs/*.md" --to pdf -o output/pdf/
```

### Extract PDF Content

```bash
# Convert PDF to Markdown
vf convert report.pdf report.md

# Get PDF information
vf info report.pdf -v
```

### Process Presentation Slides

```bash
# Convert PPTX to PDF (when implemented)
vf convert slides.pptx slides.pdf

# Batch convert presentations
vf batch "presentations/*.pptx" --to pdf
```

## API Integration

The CLI uses the vault-files core library. For programmatic usage:

```typescript
import { convertDocument, parseDocument } from "vault-files";

// Convert document
await convertDocument("input.pdf", "output.md", {
  quality: "high",
  compress: true,
});

// Parse document
const content = await parseDocument("document.pdf");
console.log(content.metadata);
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../../LICENSE)

## Links

- [GitHub Repository](https://github.com/PtiCalin/vault-files)
- [Documentation](https://github.com/PtiCalin/vault-files#readme)
- [Issue Tracker](https://github.com/PtiCalin/vault-files/issues)
