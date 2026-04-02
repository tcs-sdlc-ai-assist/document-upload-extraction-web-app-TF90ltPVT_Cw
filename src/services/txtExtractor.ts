import type { } from '@/types';

function readFileAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error(`Failed to read file "${file.name}" as text.`));
      }
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file "${file.name}": ${reader.error?.message ?? 'Unknown error'}`));
    };
    reader.readAsText(file, 'UTF-8');
  });
}

export async function extractTxt(file: File): Promise<string> {
  if (file.size === 0) {
    return '';
  }

  let text: string;

  try {
    text = await readFileAsText(file);
  } catch (error) {
    throw new Error(
      `Failed to read text file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return text;
}