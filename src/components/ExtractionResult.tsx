import { useAppSelector } from '@/store/store';
import ErrorMessage from '@/components/ErrorMessage';
import MapVisualizer from '@/components/MapVisualizer';
import type { ExtractionResultData, OutlierInfo } from '@/types';
import styles from './ExtractionResult.module.css';

function isOutlierRow(outlierInfo: OutlierInfo[] | null, rowIndex: number): boolean {
  if (!outlierInfo || outlierInfo.length === 0) {
    return false;
  }

  for (const info of outlierInfo) {
    for (const outlierRow of info.outlierRows) {
      if (outlierRow.index === rowIndex) {
        return true;
      }
    }
  }

  return false;
}

function getFileTypeBadgeClass(fileType: string): string {
  switch (fileType) {
    case 'pdf':
      return styles.badgePdf;
    case 'csv':
    case 'xls':
    case 'xlsx':
      return styles.badgeTabular;
    case 'kml':
      return styles.badgeKml;
    case 'txt':
      return styles.badgeTxt;
    default:
      return styles.badgeDefault;
  }
}

function renderResultContent(result: ExtractionResultData) {
  if (result.status === 'failed' && result.error) {
    return <ErrorMessage message={result.error} type="error" />;
  }

  if (result.fileType === 'kml' && result.geoJsonData) {
    return <MapVisualizer features={result.geoJsonData} />;
  }

  if (result.tabularData && (result.fileType === 'csv' || result.fileType === 'xls' || result.fileType === 'xlsx')) {
    const { headers, rows } = result.tabularData;

    if (headers.length === 0 && rows.length === 0) {
      return <p className={styles.emptyMessage}>No data found in file.</p>;
    }

    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={`header-${index}`} className={styles.tableHeader}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={
                  isOutlierRow(result.outlierInfo, rowIndex)
                    ? styles.outlierRow
                    : styles.tableRow
                }
              >
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className={styles.tableCell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (result.extractedText !== null && (result.fileType === 'pdf' || result.fileType === 'txt')) {
    return (
      <div className={styles.textContainer}>
        <pre className={styles.extractedText}>{result.extractedText}</pre>
      </div>
    );
  }

  if (result.status === 'pending' || result.status === 'processing') {
    return <p className={styles.emptyMessage}>Extraction in progress...</p>;
  }

  return <p className={styles.emptyMessage}>No extracted content available.</p>;
}

export default function ExtractionResult() {
  const { results, successCount, failureCount, status } = useAppSelector(
    (state) => state.extraction
  );

  const resultEntries = Object.values(results);

  if (resultEntries.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.summaryBar}>
        <h2 className={styles.summaryTitle}>Extraction Results</h2>
        <div className={styles.summaryStats}>
          <span className={styles.successCount}>
            ✓ {successCount} successful
          </span>
          <span className={styles.failureCount}>
            ✕ {failureCount} failed
          </span>
        </div>
      </div>

      {status === 'error' && failureCount > 0 && (
        <ErrorMessage
          message={`Extraction failed for ${failureCount} file${failureCount > 1 ? 's' : ''}.`}
          type="error"
          details={{ successCount, failureCount }}
        />
      )}

      <div className={styles.resultsList}>
        {resultEntries.map((result: ExtractionResultData) => (
          <div key={result.fileId} className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <h3 className={styles.fileName}>{result.fileName}</h3>
              <span
                className={`${styles.fileTypeBadge} ${getFileTypeBadgeClass(result.fileType)}`}
              >
                {result.fileType.toUpperCase()}
              </span>
            </div>
            <div className={styles.resultContent}>
              {renderResultContent(result)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}