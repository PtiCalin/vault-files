import { FileUtils } from './file-utils'
import { DocumentFormat } from '../types'

describe('FileUtils', () => {
  describe('getFormatFromExtension', () => {
    it('should correctly identify PDF format', () => {
      expect(FileUtils.getFormatFromExtension('pdf')).toBe(DocumentFormat.PDF)
    })

    it('should correctly identify Markdown format', () => {
      expect(FileUtils.getFormatFromExtension('md')).toBe(DocumentFormat.MARKDOWN)
      expect(FileUtils.getFormatFromExtension('markdown')).toBe(DocumentFormat.MARKDOWN)
    })

    it('should correctly identify DOCX format', () => {
      expect(FileUtils.getFormatFromExtension('docx')).toBe(DocumentFormat.DOCX)
    })

    it('should correctly identify PPTX format', () => {
      expect(FileUtils.getFormatFromExtension('pptx')).toBe(DocumentFormat.PPTX)
    })

    it('should be case insensitive', () => {
      expect(FileUtils.getFormatFromExtension('PDF')).toBe(DocumentFormat.PDF)
      expect(FileUtils.getFormatFromExtension('Md')).toBe(DocumentFormat.MARKDOWN)
    })

    it('should throw error for unsupported format', () => {
      expect(() => FileUtils.getFormatFromExtension('xyz')).toThrow()
    })
  })

  describe('validateFileSize', () => {
    it('should not throw for files under limit', () => {
      const buffer = Buffer.alloc(1024 * 1024) // 1MB
      expect(() => FileUtils.validateFileSize(buffer, 10)).not.toThrow()
    })

    it('should throw for files over limit', () => {
      const buffer = Buffer.alloc(150 * 1024 * 1024) // 150MB
      expect(() => FileUtils.validateFileSize(buffer, 100)).toThrow()
    })
  })

  describe('generateOutputFilename', () => {
    it('should generate correct output filename', () => {
      const result = FileUtils.generateOutputFilename(
        '/path/to/document.pdf',
        DocumentFormat.MARKDOWN
      )
      expect(result).toBe('/path/to/document.md')
    })

    it('should handle suffix', () => {
      const result = FileUtils.generateOutputFilename(
        '/path/to/document.pdf',
        DocumentFormat.MARKDOWN,
        '-converted'
      )
      expect(result).toBe('/path/to/document-converted.md')
    })
  })
})
