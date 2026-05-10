/**
 * Custom error types for vault-files
 */

export class VaultFilesError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaultFilesError'
    Object.setPrototypeOf(this, VaultFilesError.prototype)
  }
}

export class ConversionError extends VaultFilesError {
  constructor(message: string, public sourceFormat?: string, public targetFormat?: string) {
    super(message)
    this.name = 'ConversionError'
    Object.setPrototypeOf(this, ConversionError.prototype)
  }
}

export class ValidationError extends VaultFilesError {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class FileNotFoundError extends VaultFilesError {
  constructor(message: string, public filePath?: string) {
    super(message)
    this.name = 'FileNotFoundError'
    Object.setPrototypeOf(this, FileNotFoundError.prototype)
  }
}

export class UnsupportedFormatError extends VaultFilesError {
  constructor(message: string, public format?: string) {
    super(message)
    this.name = 'UnsupportedFormatError'
    Object.setPrototypeOf(this, UnsupportedFormatError.prototype)
  }
}

export class ProcessingError extends VaultFilesError {
  constructor(message: string, public operation?: string) {
    super(message)
    this.name = 'ProcessingError'
    Object.setPrototypeOf(this, ProcessingError.prototype)
  }
}
