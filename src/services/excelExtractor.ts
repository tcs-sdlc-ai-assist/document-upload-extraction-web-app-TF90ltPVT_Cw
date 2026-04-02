import * as XLSX from 'xlsx';
import type { TabularData } from '@/types';

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error(`Failed to read file "${file.name}" as ArrayBuffer.`));
      }
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file "${file.name}": ${reader.error?.message ?? 'Unknown error'}`));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function extractExcel(file: File): Promise<TabularData> {
  let arrayBuffer: ArrayBuffer;

  try {
    arrayBuffer = await readFileAsArrayBuffer(file);
  } catch (error) {
    throw new Error(
      `Failed to read Excel/CSV file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch (error) {
    throw new Error(
      `Failed to parse Excel/CSV file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    return { headers: [], rows: [] };
  }

  let jsonData: Record<string, unknown>[];

  try {
    jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: undefined });
  } catch (error) {
    throw new Error(
      `Failed to extract data from sheet "${firstSheetName}" of "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  if (jsonData.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(jsonData[0]);

  const rows: string[][] = jsonData.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    })
  );

  return { headers, rows };
}