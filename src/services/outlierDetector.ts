import type { TabularData, OutlierInfo } from '@/types';
import { DEFAULT_KPI_THRESHOLDS } from '@/constants';

function isNumeric(value: string): boolean {
  if (value === '' || value === null || value === undefined) {
    return false;
  }
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function getNumericColumnIndices(data: TabularData): number[] {
  const { headers, rows } = data;
  const indices: number[] = [];

  if (rows.length === 0) {
    return indices;
  }

  for (let col = 0; col < headers.length; col++) {
    let numericCount = 0;
    let totalNonEmpty = 0;

    for (const row of rows) {
      const value = row[col];
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      totalNonEmpty++;
      if (isNumeric(value)) {
        numericCount++;
      }
    }

    if (totalNonEmpty > 0 && numericCount === totalNonEmpty) {
      indices.push(col);
    }
  }

  return indices;
}

function computeQuartiles(values: number[]): { q1: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1Index = (n - 1) * 0.25;
  const q3Index = (n - 1) * 0.75;

  const q1 = interpolate(sorted, q1Index);
  const q3 = interpolate(sorted, q3Index);

  return { q1, q3 };
}

function interpolate(sorted: number[], index: number): number {
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

export function detectOutliers(
  data: TabularData,
  thresholds?: Record<string, { min: number; max: number }>
): OutlierInfo[] {
  const { headers, rows } = data;

  if (headers.length === 0 || rows.length === 0) {
    return [];
  }

  if (rows.length < DEFAULT_KPI_THRESHOLDS.minSampleSize) {
    return [];
  }

  const numericColumnIndices = getNumericColumnIndices(data);
  const results: OutlierInfo[] = [];

  for (const colIndex of numericColumnIndices) {
    const columnName = headers[colIndex];

    const numericValues: { index: number; value: number }[] = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const raw = rows[rowIndex][colIndex];
      if (raw !== '' && raw !== null && raw !== undefined && isNumeric(raw)) {
        numericValues.push({ index: rowIndex, value: Number(raw) });
      }
    }

    if (numericValues.length < DEFAULT_KPI_THRESHOLDS.minSampleSize) {
      continue;
    }

    let lowerBound: number;
    let upperBound: number;

    if (thresholds && thresholds[columnName]) {
      lowerBound = thresholds[columnName].min;
      upperBound = thresholds[columnName].max;
    } else {
      const values = numericValues.map((v) => v.value);
      const { q1, q3 } = computeQuartiles(values);
      const iqr = q3 - q1;
      const multiplier = DEFAULT_KPI_THRESHOLDS.iqrMultiplier;

      lowerBound = q1 - multiplier * iqr;
      upperBound = q3 + multiplier * iqr;
    }

    const outlierRows: OutlierInfo['outlierRows'] = [];

    for (const entry of numericValues) {
      if (entry.value < lowerBound) {
        const deviation = lowerBound - entry.value;
        outlierRows.push({
          index: entry.index,
          value: entry.value,
          deviation,
        });
      } else if (entry.value > upperBound) {
        const deviation = entry.value - upperBound;
        outlierRows.push({
          index: entry.index,
          value: entry.value,
          deviation,
        });
      }
    }

    if (outlierRows.length > 0) {
      const outlierPercentage = outlierRows.length / numericValues.length;

      if (outlierPercentage <= DEFAULT_KPI_THRESHOLDS.maxOutlierPercentage) {
        results.push({
          columnName,
          outlierRows,
        });
      }
    }
  }

  return results;
}