import * as toGeoJSON from '@tmcw/togeojson';

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
    reader.readAsText(file);
  });
}

export async function extractKml(file: File): Promise<GeoJSON.FeatureCollection> {
  let text: string;

  try {
    text = await readFileAsText(file);
  } catch (error) {
    throw new Error(
      `Failed to read KML file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  let xmlDoc: Document;

  try {
    const parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, 'text/xml');
  } catch (error) {
    throw new Error(
      `Failed to parse KML file "${file.name}" as XML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error(
      `Malformed KML file "${file.name}": ${parserError.textContent ?? 'XML parsing error'}`
    );
  }

  let featureCollection: GeoJSON.FeatureCollection;

  try {
    featureCollection = toGeoJSON.kml(xmlDoc) as GeoJSON.FeatureCollection;
  } catch (error) {
    throw new Error(
      `Failed to convert KML to GeoJSON for "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return featureCollection;
}