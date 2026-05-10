import { MarkdownConverter } from '../src/converters/markdown/markdown-converter'
import { DocumentFormat } from '../types'

describe('MarkdownConverter', () => {
  let converter: MarkdownConverter

  beforeEach(() => {
    converter = new MarkdownConverter()
  })

  describe('supports', () => {
    it('should support Markdown format', () => {
      expect(converter.supports(DocumentFormat.MARKDOWN)).toBe(true)
    })

    it('should support HTML format', () => {
      expect(converter.supports(DocumentFormat.HTML)).toBe(true)
    })

    it('should support TXT format', () => {
      expect(converter.supports(DocumentFormat.TXT)).toBe(true)
    })

    it('should not support PDF format', () => {
      expect(converter.supports(DocumentFormat.PDF)).toBe(false)
    })
  })

  describe('parse', () => {
    it('should parse basic Markdown', async () => {
      const markdown = '# Title\n\nSome content here.'
      const result = await converter.parse(markdown)

      expect(result.text).toBe(markdown)
      expect(result.metadata.format).toBe(DocumentFormat.MARKDOWN)
      expect(result.metadata.title).toBe('Title')
    })

    it('should extract front matter metadata', async () => {
      const markdown = `---
title: Test Document
author: John Doe
---

# Content

Some text here.`

      const result = await converter.parse(markdown)

      expect(result.metadata.title).toBe('Test Document')
      expect(result.metadata.author).toBe('John Doe')
    })
  })

  describe('convert', () => {
    it('should convert Markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is **bold** text.'
      const result = await converter.convert(markdown, DocumentFormat.HTML)

      expect(result.success).toBe(true)
      expect(result.outputBuffer).toBeDefined()

      const html = result.outputBuffer!.toString('utf-8')
      expect(html).toContain('<h1>Hello World</h1>')
      expect(html).toContain('<strong>bold</strong>')
    })

    it('should convert Markdown to plain text', async () => {
      const markdown = '# Title\n\n**Bold** and *italic* text.'
      const result = await converter.convert(markdown, DocumentFormat.TXT)

      expect(result.success).toBe(true)
      expect(result.outputBuffer).toBeDefined()

      const text = result.outputBuffer!.toString('utf-8')
      expect(text).not.toContain('**')
      expect(text).not.toContain('*')
      expect(text).toContain('Bold')
      expect(text).toContain('italic')
    })

    it('should measure processing time', async () => {
      const markdown = '# Test\n\nContent'
      const result = await converter.convert(markdown, DocumentFormat.HTML)

      expect(result.processingTime).toBeDefined()
      expect(result.processingTime).toBeGreaterThan(0)
    })
  })
})
