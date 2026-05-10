import { ValidationUtils } from './validation-utils'
import { DocumentFormat } from '../types'

describe('ValidationUtils', () => {
  describe('validateBuffer', () => {
    it('should not throw for valid buffer', () => {
      const buffer = Buffer.from('test content')
      expect(() => ValidationUtils.validateBuffer(buffer)).not.toThrow()
    })

    it('should throw for empty buffer', () => {
      const buffer = Buffer.alloc(0)
      expect(() => ValidationUtils.validateBuffer(buffer)).toThrow('empty or invalid')
    })
  })

  describe('validateFormat', () => {
    it('should not throw for supported format', () => {
      const supported = [DocumentFormat.PDF, DocumentFormat.MARKDOWN]
      expect(() =>
        ValidationUtils.validateFormat(DocumentFormat.PDF, supported)
      ).not.toThrow()
    })

    it('should throw for unsupported format', () => {
      const supported = [DocumentFormat.PDF, DocumentFormat.MARKDOWN]
      expect(() => ValidationUtils.validateFormat(DocumentFormat.DOCX, supported)).toThrow(
        'not supported'
      )
    })
  })

  describe('validatePageRange', () => {
    it('should parse single page', () => {
      const result = ValidationUtils.validatePageRange('5', 10)
      expect(result).toEqual([5])
    })

    it('should parse page range', () => {
      const result = ValidationUtils.validatePageRange('2-5', 10)
      expect(result).toEqual([2, 3, 4, 5])
    })

    it('should parse multiple ranges', () => {
      const result = ValidationUtils.validatePageRange('1-3,7,9-10', 10)
      expect(result).toEqual([1, 2, 3, 7, 9, 10])
    })

    it('should throw for page out of range', () => {
      expect(() => ValidationUtils.validatePageRange('15', 10)).toThrow('out of range')
    })

    it('should throw for invalid range', () => {
      expect(() => ValidationUtils.validatePageRange('5-2', 10)).toThrow('invalid')
    })
  })

  describe('validateQuality', () => {
    it('should not throw for valid quality', () => {
      expect(() => ValidationUtils.validateQuality('low')).not.toThrow()
      expect(() => ValidationUtils.validateQuality('medium')).not.toThrow()
      expect(() => ValidationUtils.validateQuality('high')).not.toThrow()
    })

    it('should throw for invalid quality', () => {
      expect(() => ValidationUtils.validateQuality('ultra')).toThrow('Invalid quality')
    })
  })

  describe('validateDPI', () => {
    it('should not throw for valid DPI', () => {
      expect(() => ValidationUtils.validateDPI(150)).not.toThrow()
      expect(() => ValidationUtils.validateDPI(300)).not.toThrow()
    })

    it('should throw for DPI too low', () => {
      expect(() => ValidationUtils.validateDPI(50)).toThrow('between 72 and 600')
    })

    it('should throw for DPI too high', () => {
      expect(() => ValidationUtils.validateDPI(700)).toThrow('between 72 and 600')
    })
  })
})
