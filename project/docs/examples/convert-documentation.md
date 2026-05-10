# vault-files Example: Convert Documentation

This example demonstrates converting a set of Markdown documentation files to multiple formats.

## Setup

```bash
# Create example directory
mkdir -p examples/documentation
cd examples/documentation

# Create sample Markdown files
cat > intro.md << 'EOF'
# Introduction to vault-files

vault-files is a powerful document conversion platform.

## Features

- Multi-format support
- High-quality conversion
- Batch processing
- CLI and library interfaces

## Getting Started

Install vault-files:

\`\`\`bash
npm install -g vault-files
\`\`\`

Convert your first document:

\`\`\`bash
vf convert document.pdf document.md
\`\`\`
EOF

cat > guide.md << 'EOF'
# User Guide

## Converting Documents

Use the `convert` command to transform documents:

\`\`\`bash
vf convert input.pdf output.md
\`\`\`

## Batch Processing

Convert multiple files at once:

\`\`\`bash
vf batch "*.md" --to pdf
\`\`\`

## Quality Settings

Choose conversion quality:

- **low**: Fast, reduced quality
- **medium**: Balanced (default)
- **high**: Best quality, slower
EOF
```

## Convert to HTML

```bash
# Convert all Markdown to HTML
vf batch "*.md" --to html -o html/
```

## Convert to PDF

```bash
# Convert with high quality
vf batch "*.md" --to pdf -q high -o pdf/
```

## Programmatic Usage

```typescript
import { convertDocument } from "vault-files";
import { glob } from "glob";
import path from "path";

async function convertDocs() {
  // Find all Markdown files
  const files = await glob("*.md");

  // Convert to HTML
  for (const file of files) {
    const htmlPath = path.join("html", file.replace(".md", ".html"));
    await convertDocument(file, htmlPath, {
      quality: "high",
      preserveFormatting: true,
    });
    console.log(`✓ ${file} → ${htmlPath}`);
  }

  // Convert to PDF
  for (const file of files) {
    const pdfPath = path.join("pdf", file.replace(".md", ".pdf"));
    await convertDocument(file, pdfPath, {
      quality: "high",
      compress: true,
    });
    console.log(`✓ ${file} → ${pdfPath}`);
  }
}

convertDocs().catch(console.error);
```

## Expected Output

```
html/
  intro.html
  guide.html
pdf/
  intro.pdf
  guide.pdf
```

## Metadata Extraction

```typescript
import { extractMetadata } from "vault-files";

async function showMetadata() {
  const files = await glob("*.md");

  for (const file of files) {
    const metadata = await extractMetadata(file);
    console.log(`\n${file}:`);
    console.log(`  Title: ${metadata.title || "N/A"}`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  Size: ${metadata.fileSize} bytes`);
  }
}

showMetadata().catch(console.error);
```
