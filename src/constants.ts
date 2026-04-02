import type { SupportedFileType } from '@/types';

export const SUPPORTED_FILE_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.kml': 'application/vnd.google-earth.kml+xml',
};

export const SUPPORTED_MIME_TYPES: string[] = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/vnd.google-earth.kml+xml',
];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 52428800

export const MAX_FILE_SIZE_LABEL = '50MB';

export const LOCAL_STORAGE_KEYS = {
  USERS: 'doc_upload_extract_users',
  SESSION: 'doc_upload_extract_session',
  LOGS: 'doc_upload_extract_logs',
} as const;

export const LOG_ROTATION_LIMIT = 500;

export const ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT: (fileName: string) =>
    `Unsupported file format: "${fileName}". Please upload one of the following: .pdf, .csv, .xls, .xlsx, .txt, .kml.`,
  FILE_TOO_LARGE: (fileName: string, maxSize: string = MAX_FILE_SIZE_LABEL) =>
    `File "${fileName}" exceeds the maximum allowed size of ${maxSize}.`,
  EXTRACTION_FAILED: (fileName: string) =>
    `Failed to extract data from "${fileName}". Please verify the file is not corrupted and try again.`,
  DUPLICATE_USERNAME: (username: string) =>
    `Username "${username}" is already taken. Please choose a different username.`,
  INVALID_CREDENTIALS: 'Invalid username or password. Please try again.',
  EMPTY_FILE: (fileName: string) =>
    `File "${fileName}" is empty. Please upload a file with content.`,
} as const;

export const DEFAULT_KPI_THRESHOLDS = {
  zScoreThreshold: 3.0,
  iqrMultiplier: 1.5,
  minSampleSize: 10,
  maxOutlierPercentage: 0.15,
} as const;

export const FILE_TYPE_EXTENSION_MAP: Record<string, SupportedFileType> = {
  '.pdf': 'pdf',
  '.csv': 'csv',
  '.xls': 'xls',
  '.xlsx': 'xlsx',
  '.txt': 'txt',
  '.kml': 'kml',
};