import type { ValidationResult } from '@/types';
import {
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  ERROR_MESSAGES,
} from '@/constants';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return fileName.slice(lastDot).toLowerCase();
}

export function validateFile(file: File): ValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      errorMessage: ERROR_MESSAGES.EMPTY_FILE(file.name),
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errorMessage: ERROR_MESSAGES.FILE_TOO_LARGE(file.name),
    };
  }

  const extension = getFileExtension(file.name);
  const isExtensionSupported = extension in SUPPORTED_FILE_EXTENSIONS;
  const isMimeTypeSupported = SUPPORTED_MIME_TYPES.includes(file.type);

  if (!isExtensionSupported && !isMimeTypeSupported) {
    return {
      valid: false,
      errorMessage: ERROR_MESSAGES.UNSUPPORTED_FORMAT(file.name),
    };
  }

  return {
    valid: true,
    errorMessage: null,
  };
}

export function validateFiles(files: File[]): {
  valid: File[];
  invalid: { file: File; error: string }[];
} {
  const valid: File[] = [];
  const invalid: { file: File; error: string }[] = [];

  for (const file of files) {
    const result = validateFile(file);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: result.errorMessage! });
    }
  }

  return { valid, invalid };
}