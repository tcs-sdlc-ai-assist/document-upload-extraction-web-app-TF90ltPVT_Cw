import type { ExtractionResultData, SupportedFileType, GeoFeature } from '@/types';
import { FILE_TYPE_EXTENSION_MAP, ERROR_MESSAGES } from '@/constants';
import { extractPdf } from '@/services/pdfExtractor';
import { extractExcel } from '@/services/excelExtractor';
import { extractKml } from '@/services/kmlExtractor';
import { extractTxt } from '@/services/txtExtractor';
import { logAction, logError } from '@/utils/logger';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return fileName.slice(lastDot).toLowerCase();
}

function getFileType(fileName: string): SupportedFileType | null {
  const extension = getFileExtension(fileName);
  return FILE_TYPE_EXTENSION_MAP[extension] ?? null;
}

function createBaseResult(file: File, fileType: SupportedFileType): ExtractionResultData {
  return {
    fileId: crypto.randomUUID(),
    fileName: file.name,
    fileType,
    extractedText: null,
    tabularData: null,
    geoJsonData: null,
    outlierInfo: null,
    status: 'pending',
    error: null,
  };
}

export async function extractFile(file: File): Promise<ExtractionResultData> {
  const fileType = getFileType(file.name);

  if (!fileType) {
    const errorMessage = ERROR_MESSAGES.UNSUPPORTED_FORMAT(file.name);
    logError('EXTRACTION_UNSUPPORTED_FORMAT', { fileName: file.name, error: errorMessage });
    return {
      fileId: crypto.randomUUID(),
      fileName: file.name,
      fileType: 'txt',
      extractedText: null,
      tabularData: null,
      geoJsonData: null,
      outlierInfo: null,
      status: 'failed',
      error: errorMessage,
    };
  }

  const result = createBaseResult(file, fileType);
  result.status = 'processing';

  logAction('EXTRACTION_STARTED', { fileName: file.name, fileType });

  try {
    switch (fileType) {
      case 'pdf': {
        const text = await extractPdf(file);
        result.extractedText = text;
        break;
      }
      case 'txt': {
        const text = await extractTxt(file);
        result.extractedText = text;
        break;
      }
      case 'csv':
      case 'xls':
      case 'xlsx': {
        const tabularData = await extractExcel(file);
        result.tabularData = tabularData;
        break;
      }
      case 'kml': {
        const featureCollection = await extractKml(file);
        const geoFeatures: GeoFeature[] = featureCollection.features.map((feature) => ({
          type: feature.type,
          geometry: feature.geometry as unknown as Record<string, unknown>,
          properties: (feature.properties ?? {}) as Record<string, unknown>,
        }));
        result.geoJsonData = geoFeatures;
        break;
      }
      default: {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    }

    result.status = 'completed';
    logAction('EXTRACTION_COMPLETED', { fileName: file.name, fileType });
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.EXTRACTION_FAILED(file.name);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'failed';
    result.error = errorMessage;
    logError('EXTRACTION_FAILED', { fileName: file.name, fileType, error: detail });
  }

  return result;
}

export async function extractFiles(
  files: File[]
): Promise<{ results: ExtractionResultData[]; successCount: number; failureCount: number }> {
  const results: ExtractionResultData[] = [];
  let successCount = 0;
  let failureCount = 0;

  logAction('BATCH_EXTRACTION_STARTED', { fileCount: files.length });

  for (const file of files) {
    const result = await extractFile(file);
    results.push(result);

    if (result.status === 'completed') {
      successCount++;
    } else {
      failureCount++;
    }
  }

  logAction('BATCH_EXTRACTION_COMPLETED', {
    fileCount: files.length,
    successCount,
    failureCount,
  });

  return { results, successCount, failureCount };
}