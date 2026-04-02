import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  addFile,
  setFileStatus,
  setValidationError,
  removeFile,
} from '@/store/uploadSlice';
import {
  startExtraction,
  addExtractionResult,
  setExtractionComplete,
  setExtractionError,
} from '@/store/extractionSlice';
import { validateFile } from '@/services/fileValidator';
import { extractFile } from '@/services/extractionEngine';
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_BYTES, FILE_TYPE_EXTENSION_MAP } from '@/constants';
import { logAction, logError } from '@/utils/logger';
import ErrorMessage from '@/components/ErrorMessage';
import UploadProgressBar from '@/components/UploadProgressBar';
import type { SupportedFileType } from '@/types';
import styles from './DocumentUpload.module.css';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return fileName.slice(lastDot).toLowerCase();
}

function getFileType(fileName: string): SupportedFileType {
  const extension = getFileExtension(fileName);
  return FILE_TYPE_EXTENSION_MAP[extension] ?? 'txt';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Pending',
  uploading: 'Uploading',
  validating: 'Validating',
  extracting: 'Extracting',
  success: 'Complete',
  error: 'Error',
};

export default function DocumentUpload() {
  const dispatch = useAppDispatch();
  const files = useAppSelector((state) => state.upload.files);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const acceptMap: Record<string, string[]> = {};
  for (const mimeType of SUPPORTED_MIME_TYPES) {
    acceptMap[mimeType] = [];
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const errors: string[] = [];

      const validFiles: { file: File; fileType: SupportedFileType }[] = [];

      for (const file of acceptedFiles) {
        const result = validateFile(file);

        if (!result.valid) {
          errors.push(result.errorMessage!);
          logError('FILE_VALIDATION_FAILED', { fileName: file.name, error: result.errorMessage });
          continue;
        }

        const fileType = getFileType(file.name);
        dispatch(addFile({ file, fileName: file.name, fileType, fileSize: file.size }));
        validFiles.push({ file, fileType });
        logAction('FILE_ADDED', { fileName: file.name, fileType, fileSize: file.size });
      }

      setValidationErrors(errors);

      for (const { file } of validFiles) {
        const uploadedItem = files.length > 0 ? files[files.length - 1] : null;

        dispatch(startExtraction());

        try {
          const extractionResult = await extractFile(file);
          dispatch(addExtractionResult(extractionResult));

          if (extractionResult.status === 'completed') {
            dispatch(setExtractionComplete());
          } else {
            dispatch(setExtractionError());
          }
        } catch {
          dispatch(setExtractionError());
          logError('EXTRACTION_ERROR', { fileName: file.name });
        }
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
    onDropRejected: (fileRejections) => {
      const errors: string[] = [];
      for (const rejection of fileRejections) {
        const errorMessages = rejection.errors.map((e) => e.message).join(', ');
        errors.push(`"${rejection.file.name}": ${errorMessages}`);
        logError('FILE_REJECTED', { fileName: rejection.file.name, errors: errorMessages });
      }
      setValidationErrors((prev) => [...prev, ...errors]);
    },
  });

  const handleRemoveFile = useCallback(
    (id: string) => {
      dispatch(removeFile({ id }));
      logAction('FILE_REMOVED', { fileId: id });
    },
    [dispatch]
  );

  const handleDismissError = useCallback((index: number) => {
    setValidationErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className={styles.container}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className={styles.dropzoneText}>Drop the files here...</p>
        ) : (
          <div className={styles.dropzoneContent}>
            <p className={styles.dropzoneText}>
              Drag &amp; drop files here, or click to select files
            </p>
            <p className={styles.dropzoneHint}>
              Supported formats: .pdf, .csv, .xls, .xlsx, .txt, .kml
            </p>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className={styles.errors}>
          {validationErrors.map((error, index) => (
            <ErrorMessage
              key={`${error}-${index}`}
              message={error}
              type="error"
              onDismiss={() => handleDismissError(index)}
            />
          ))}
        </div>
      )}

      <UploadProgressBar />

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h3 className={styles.fileListTitle}>Uploaded Files</h3>
          {files.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.fileName}</span>
                <span className={styles.fileSize}>{formatFileSize(file.fileSize)}</span>
              </div>
              <div className={styles.fileActions}>
                <span
                  className={`${styles.statusBadge} ${
                    file.status === 'success'
                      ? styles.statusSuccess
                      : file.status === 'error'
                        ? styles.statusError
                        : styles.statusPending
                  }`}
                >
                  {STATUS_LABELS[file.status] ?? file.status}
                </span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFile(file.id)}
                  type="button"
                  aria-label={`Remove ${file.fileName}`}
                >
                  ✕
                </button>
              </div>
              {file.validationError && (
                <ErrorMessage message={file.validationError} type="error" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}