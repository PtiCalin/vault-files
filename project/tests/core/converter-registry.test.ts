import { ConverterRegistry } from '../src/core/converter-registry'
import { PDFConverter } from '../src/converters/pdf/pdf-converter'
import { MarkdownConverter } from '../src/converters/markdown/markdown-converter'
import { DocumentFormat } from '../types'

describe('ConverterRegistry', () => {
  let registry: ConverterRegistry

  beforeEach(() => {
    registry = new ConverterRegistry()
  })

  describe('register', () => {
    it('should register a converter', () => {
      const converter = new PDFConverter()
      registry.register(DocumentFormat.PDF, converter)

      expect(registry.get(DocumentFormat.PDF)).toBe(converter)
    })

    it('should update supported formats', () => {
      const converter = new PDFConverter()
      registry.register(DocumentFormat.PDF, converter)

      const formats = registry.getSupportedFormats()
      expect(formats).toContain(DocumentFormat.PDF)
    })
  })

  describe('canConvert', () => {
    beforeEach(() => {
      registry.register(DocumentFormat.PDF, new PDFConverter())
      registry.register(DocumentFormat.MARKDOWN, new MarkdownConverter())
    })

    it('should return true for supported conversion', () => {
      expect(registry.canConvert(DocumentFormat.MARKDOWN, DocumentFormat.HTML)).toBe(true)
    })

    it('should return false for unsupported conversion', () => {
      expect(registry.canConvert(DocumentFormat.PDF, DocumentFormat.PPTX)).toBe(false)
    })
  })

  describe('getSupportedTargets', () => {
    beforeEach(() => {
      registry.register(DocumentFormat.MARKDOWN, new MarkdownConverter())
    })

    it('should return supported target formats', () => {
      const targets = registry.getSupportedTargets(DocumentFormat.MARKDOWN)

      expect(targets).toContain(DocumentFormat.HTML)
      expect(targets).toContain(DocumentFormat.TXT)
    })

    it('should return empty array for unsupported format', () => {
      const targets = registry.getSupportedTargets(DocumentFormat.EPUB)
      expect(targets).toEqual([])
    })
  })
})
