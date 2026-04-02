import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setActiveTab } from '@/store/uiSlice';
import DocumentUpload from '@/components/DocumentUpload';
import UploadProgressBar from '@/components/UploadProgressBar';
import ExtractionResult from '@/components/ExtractionResult';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const { results, successCount, failureCount } = useAppSelector((state) => state.extraction);

  const resultEntries = Object.values(results);
  const hasResults = resultEntries.length > 0;

  const handleTabChange = useCallback(
    (tab: string) => {
      dispatch(setActiveTab(tab));
    },
    [dispatch]
  );

  return (
    <div className={styles.container}>
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'upload' ? styles.tabButtonActive : ''}`}
          onClick={() => handleTabChange('upload')}
          type="button"
        >
          Upload
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'results' ? styles.tabButtonActive : ''}`}
          onClick={() => handleTabChange('results')}
          type="button"
        >
          Results
          {hasResults && (
            <span className={styles.resultsBadge}>
              {successCount + failureCount}
            </span>
          )}
        </button>
      </div>

      {hasResults && (
        <div className={styles.summaryBar}>
          <span className={styles.summaryText}>
            Extraction Summary:
          </span>
          <span className={styles.successCount}>✓ {successCount} successful</span>
          <span className={styles.failureCount}>✕ {failureCount} failed</span>
        </div>
      )}

      <div className={styles.layout}>
        <div
          className={`${styles.uploadSection} ${activeTab !== 'upload' ? styles.hiddenOnMobile : ''}`}
        >
          <DocumentUpload />
          <div className={styles.progressSection}>
            <UploadProgressBar />
          </div>
        </div>

        <div
          className={`${styles.resultsSection} ${activeTab !== 'results' ? styles.hiddenOnMobile : ''}`}
        >
          <ExtractionResult />
        </div>
      </div>
    </div>
  );
}