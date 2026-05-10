# Quick Start Guide

Get up and running with vault-files in 5 minutes.

## Installation

### Option 1: Global CLI

```bash
npm install -g vault-files
```

### Option 2: NPX (No Installation)

```bash
npx vault-files convert document.pdf document.md
```

### Option 3: Project Dependency

```bash
npm install vault-files
```

## Basic Usage

### 1. Convert a Single Document

```bash
# PDF to Markdown
vf convert report.pdf report.md

# Markdown to HTML
vf convert readme.md readme.html

# With format flag
vf convert input.md -f pdf
```

### 2. Get Document Information

```bash
# Basic info
vf info document.pdf

# Detailed info
vf info document.pdf -v

# JSON output
vf info document.pdf -j
```

### 3. Batch Convert Files

```bash
# Convert all Markdown files to PDF
vf batch "*.md" --to pdf

# With output directory
vf batch "docs/**/*.md" --to html -o output/

# Parallel processing
vf batch "*.pdf" --to md -p 5
```

## Library Usage

### Convert Documents

```typescript
import { convertDocument } from "vault-files";

await convertDocument("input.pdf", "output.md");
```

### Parse Documents

```typescript
import { parseDocument } from "vault-files";

const content = await parseDocument("document.pdf");
console.log(content.metadata.title);
console.log(content.text);
```

### Extract Metadata

```typescript
import { extractMetadata } from "vault-files";

const metadata = await extractMetadata("document.pdf");
console.log({
  title: metadata.title,
  author: metadata.author,
  pageCount: metadata.pageCount,
});
```

### Check Format Support

```typescript
import { getSupportedFormats, canConvert } from "vault-files";

// List all formats
const formats = getSupportedFormats();
console.log(formats); // ['pdf', 'md', 'html', ...]

// Check conversion support
if (canConvert("pdf", "md")) {
  console.log("Conversion supported!");
}
```

## Common Use Cases

### 1. Convert Documentation

```bash
# Markdown to PDF for distribution
vf batch "docs/**/*.md" --to pdf -q high -o dist/

# Markdown to HTML for website
vf batch "docs/**/*.md" --to html -o website/
```

### 2. Extract PDF Content

```bash
# Convert PDF to editable Markdown
vf convert report.pdf report.md

# Get PDF information
vf info report.pdf -v
```

### 3. Process Reports

```bash
# Convert all reports to PDF
vf batch "reports/*.docx" --to pdf -q high

# Compress PDFs
vf batch "reports/*.pdf" --to pdf -c -o compressed/
```

### 4. Bulk Format Conversion

```bash
# Convert everything to a single format
vf batch "**/*.{md,txt,html}" --to pdf -o output/pdf/
```

## Configuration

### Environment Variables

```bash
# Enable debug output
DEBUG=1 vf convert document.pdf output.md

# Development mode
NODE_ENV=development vf convert test.pdf test.md
```

### Quality Levels

- **low**: Fast conversion, reduced quality
- **medium**: Balanced quality and speed (default)
- **high**: Maximum quality, slower processing

```bash
vf convert document.pdf output.md -q high
```

### Compression

```bash
# Enable compression
vf convert large.pdf compressed.pdf -c

# Batch compress
vf batch "*.pdf" --to pdf -c -o compressed/
```

## Next Steps

1. **Read the [CLI Documentation](../cli/README.md)** for detailed command reference
2. **Check [Examples](examples/)** for more use cases
3. **Review [API Documentation](BASE_MODULE.md)** for library usage
4. **See [Architecture](ARCHITECTURE.md)** for system design

## Getting Help

```bash
# General help
vf --help

# Command-specific help
vf convert --help
vf info --help
vf batch --help

# Version
vf --version
```

## Troubleshooting

### Command Not Found

```bash
# Verify installation
npm list -g vault-files

# Or use npx
npx vault-files --help
```

### Permission Errors

```bash
# Unix/Linux/macOS
sudo npm install -g vault-files

# Or install without sudo
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install -g vault-files
```

### Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" vf convert large.pdf output.md
```

### Debug Mode

```bash
# Enable verbose debugging
DEBUG=1 vf convert document.pdf output.md -v
```

## Support

- **Issues**: [github.com/PtiCalin/vault-files/issues](https://github.com/PtiCalin/vault-files/issues)
- **Documentation**: [github.com/PtiCalin/vault-files](https://github.com/PtiCalin/vault-files)
- **Discussions**: [github.com/PtiCalin/vault-files/discussions](https://github.com/PtiCalin/vault-files/discussions)
