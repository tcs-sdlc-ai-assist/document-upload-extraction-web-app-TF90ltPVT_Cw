import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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

export async function extractPdf(file: File): Promise<string> {
  let arrayBuffer: ArrayBuffer;

  try {
    arrayBuffer = await readFileAsArrayBuffer(file);
  } catch (error) {
    throw new Error(
      `Failed to read PDF file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  let pdf: pdfjsLib.PDFDocumentProxy;

  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (error) {
    throw new Error(
      `Failed to parse PDF file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(pageText);
    } catch (error) {
      throw new Error(
        `Failed to extract text from page ${pageNum} of "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return pageTexts.join('\n');
}