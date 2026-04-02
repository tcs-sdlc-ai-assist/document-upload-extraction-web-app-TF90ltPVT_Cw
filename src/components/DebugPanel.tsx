import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { toggleDebugPanel } from '@/store/uiSlice';
import { getLogs, clearLogs } from '@/utils/logger';
import type { LogEntry } from '@/types';
import styles from './DebugPanel.module.css';

const LEVEL_LABELS: Record<LogEntry['level'], string> = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

export default function DebugPanel() {
  const dispatch = useAppDispatch();
  const debugPanelOpen = useAppSelector((state) => state.ui.debugPanelOpen);
  const [filter, setFilter] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>(() => getLogs());

  const refreshLogs = useCallback(() => {
    setLogs(getLogs());
  }, []);

  useEffect(() => {
    if (debugPanelOpen) {
      refreshLogs();
    }
  }, [debugPanelOpen, refreshLogs]);

  const handleClose = useCallback(() => {
    dispatch(toggleDebugPanel());
  }, [dispatch]);

  const handleClear = useCallback(() => {
    clearLogs();
    refreshLogs();
  }, [refreshLogs]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  if (!debugPanelOpen) {
    return null;
  }

  const filteredLogs = filter.trim()
    ? logs.filter((log) =>
        log.actionType.toLowerCase().includes(filter.trim().toLowerCase())
      )
    : logs;

  const sortedLogs = [...filteredLogs].reverse();

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Debug Logs</h3>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            type="button"
            aria-label="Close debug panel"
          >
            ✕
          </button>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="Filter by action type..."
            value={filter}
            onChange={handleFilterChange}
          />
          <button
            className={styles.clearButton}
            onClick={handleClear}
            type="button"
          >
            Clear Logs
          </button>
          <button
            className={styles.refreshButton}
            onClick={refreshLogs}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className={styles.logList}>
          {sortedLogs.length === 0 ? (
            <p className={styles.emptyMessage}>No logs to display.</p>
          ) : (
            sortedLogs.map((log) => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.logHeader}>
                  <span
                    className={`${styles.levelBadge} ${
                      log.level === 'error'
                        ? styles.levelError
                        : log.level === 'warn'
                          ? styles.levelWarn
                          : log.level === 'debug'
                            ? styles.levelDebug
                            : styles.levelInfo
                    }`}
                  >
                    {LEVEL_LABELS[log.level]}
                  </span>
                  <span className={styles.actionType}>{log.actionType}</span>
                  <span className={styles.timestamp}>{log.timestamp}</span>
                </div>
                {Object.keys(log.context).length > 0 && (
                  <pre className={styles.context}>
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}