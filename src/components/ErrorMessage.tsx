import { useEffect } from 'react';
import { logError } from '@/utils/logger';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  details?: {
    successCount: number;
    failureCount: number;
  };
}

const ICON_MAP: Record<ErrorMessageProps['type'], string> = {
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function ErrorMessage({ message, type, onDismiss, details }: ErrorMessageProps) {
  useEffect(() => {
    if (type === 'error') {
      logError('ERROR_DISPLAYED', { message });
    }
  }, [type, message]);

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <span className={styles.icon}>{ICON_MAP[type]}</span>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {details && (
          <p className={styles.details}>
            Successful: {details.successCount} | Failed: {details.failureCount}
          </p>
        )}
      </div>
      {onDismiss && (
        <button className={styles.dismissButton} onClick={onDismiss} type="button">
          ✕
        </button>
      )}
    </div>
  );
}