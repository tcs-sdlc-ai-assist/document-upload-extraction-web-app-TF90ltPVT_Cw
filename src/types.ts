export type SupportedFileType = 'pdf' | 'csv' | 'xls' | 'xlsx' | 'txt' | 'kml';

export interface FileUploadItem {
  id: string;
  file: File;
  fileName: string;
  fileType: SupportedFileType;
  fileSize: number;
  status: 'idle' | 'uploading' | 'validating' | 'extracting' | 'success' | 'error';
  progress: number;
  validationError: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errorMessage: string | null;
}

export interface TabularData {
  headers: string[];
  rows: string[][];
}

export interface GeoFeature {
  type: string;
  geometry: Record<string, unknown>;
  properties: Record<string, unknown>;
}

export interface OutlierInfo {
  columnName: string;
  outlierRows: {
    index: number;
    value: string | number;
    deviation: number;
  }[];
}

export interface ExtractionResultData {
  fileId: string;
  fileName: string;
  fileType: SupportedFileType;
  extractedText: string | null;
  tabularData: TabularData | null;
  geoJsonData: GeoFeature[] | null;
  outlierInfo: OutlierInfo[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
}

export interface UserCredentials {
  username: string;
  passwordHash: string;
}

export interface LogEntry {
  id: string;
  actionType: string;
  timestamp: string;
  context: Record<string, unknown>;
  level: 'info' | 'warn' | 'error' | 'debug';
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface AuthState {
  currentUser: UserCredentials | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

export interface UploadState {
  files: FileUploadItem[];
  overallStatus: 'idle' | 'uploading' | 'completed' | 'error';
}

export interface ExtractionState {
  results: Record<string, ExtractionResultData>;
  status: 'idle' | 'processing' | 'completed' | 'error';
  successCount: number;
  failureCount: number;
}

export interface UIState {
  activeTab: string;
  sidebarOpen: boolean;
  debugPanelOpen: boolean;
  notifications: Notification[];
}