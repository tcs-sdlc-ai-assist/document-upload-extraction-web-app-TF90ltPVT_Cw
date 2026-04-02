import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoFeature } from '@/types';
import styles from './MapVisualizer.module.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapVisualizerProps {
  features: GeoFeature[];
}

const DEFAULT_CENTER: L.LatLngExpression = [20, 0];
const DEFAULT_ZOOM = 2;

function geoJsonStyle(): L.PathOptions {
  return {
    color: '#3b82f6',
    weight: 2,
    opacity: 0.8,
    fillColor: '#3b82f6',
    fillOpacity: 0.25,
  };
}

function buildFeatureCollection(features: GeoFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry as unknown as GeoJSON.Geometry,
      properties: f.properties ?? {},
    })),
  };
}

function FitBounds({ featureCollection }: { featureCollection: GeoJSON.FeatureCollection }) {
  const map = useMap();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (featureCollection.features.length === 0) {
      return;
    }

    const layer = L.geoJSON(featureCollection);
    geoJsonRef.current = layer;

    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch {
      // bounds may be invalid if features have no valid coordinates
    }
  }, [map, featureCollection]);

  return null;
}

function getPointFeatures(features: GeoFeature[]): GeoFeature[] {
  return features.filter(
    (f) => f.geometry && (f.geometry as Record<string, unknown>).type === 'Point'
  );
}

function getNonPointFeatures(features: GeoFeature[]): GeoFeature[] {
  return features.filter(
    (f) => f.geometry && (f.geometry as Record<string, unknown>).type !== 'Point'
  );
}

function getPointCoordinates(feature: GeoFeature): L.LatLngExpression | null {
  const geometry = feature.geometry as Record<string, unknown>;
  const coordinates = geometry.coordinates as number[] | undefined;

  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  // GeoJSON is [lng, lat], Leaflet expects [lat, lng]
  return [coordinates[1], coordinates[0]];
}

function renderProperties(properties: Record<string, unknown>): string {
  const entries = Object.entries(properties).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );

  if (entries.length === 0) {
    return 'No properties';
  }

  return entries.map(([key, value]) => `${key}: ${String(value)}`).join('\n');
}

export default function MapVisualizer({ features }: MapVisualizerProps) {
  const featureCollection = useMemo(() => buildFeatureCollection(features), [features]);

  const nonPointFeatureCollection = useMemo(() => {
    const nonPoints = getNonPointFeatures(features);
    return buildFeatureCollection(nonPoints);
  }, [features]);

  const pointFeatures = useMemo(() => getPointFeatures(features), [features]);

  if (!features || features.length === 0) {
    return (
      <div className={styles.emptyMessage}>
        <p>No geofence data available to display.</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nonPointFeatureCollection.features.length > 0 && (
          <GeoJSON
            key={JSON.stringify(nonPointFeatureCollection)}
            data={nonPointFeatureCollection}
            style={geoJsonStyle}
          />
        )}

        {pointFeatures.map((feature, index) => {
          const position = getPointCoordinates(feature);
          if (!position) {
            return null;
          }

          return (
            <Marker key={`point-${index}`} position={position}>
              <Popup>
                <pre className={styles.popupContent}>
                  {renderProperties(feature.properties)}
                </pre>
              </Popup>
            </Marker>
          );
        })}

        <FitBounds featureCollection={featureCollection} />
      </MapContainer>
    </div>
  );
}