import { useAppSelector } from '@/store/store';
import type { FileUploadItem } from '@/types';
import styles from './UploadProgressBar.module.css';

interface UploadProgressBarProps {
  fileId?: string;
}

export default function UploadProgressBar({ fileId }: UploadProgressBarProps) {
  const files = useAppSelector((state) => state.upload.files);

  let activeFiles: FileUploadItem[];

  if (fileId) {
    const file = files.find((f) => f.id === fileId);
    activeFiles = file ? [file] : [];
  } else {
    activeFiles = files.filter(
      (f) => f.status === 'uploading' || f.status === 'validating' || f.status === 'extracting'
    );
  }

  if (activeFiles.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {activeFiles.map((file) => (
        <div key={file.id} className={styles.fileProgress}>
          <span className={styles.fileName}>{file.fileName}</span>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${Math.min(Math.max(file.progress, 0), 100)}%` }}
            />
          </div>
          <span className={styles.percentage}>{Math.round(file.progress)}%</span>
        </div>
      ))}
    </div>
  );
}