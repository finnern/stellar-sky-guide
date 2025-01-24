import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeMap, setupMapEffects, createISSMarker } from '../utils/mapUtils';

interface WorldMapProps {
  issLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const WorldMap = ({ issLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = initializeMap(mapContainer.current);
    mapInstance.current = map;

    map.on('style.load', () => {
      setupMapEffects(map);
      markerInstance.current = createISSMarker(map);
    });

    return () => {
      if (markerInstance.current) {
        markerInstance.current.remove();
        markerInstance.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update ISS position
  useEffect(() => {
    if (!issLocation || !mapInstance.current || !markerInstance.current) return;

    markerInstance.current.setLngLat([issLocation.longitude, issLocation.latitude]);
    
    mapInstance.current.easeTo({
      center: [issLocation.longitude, issLocation.latitude],
      duration: 2000,
    });
  }, [issLocation]);

  return (
    <div className="glass-card overflow-hidden">
      <style>
        {`
          .iss-marker {
            font-size: 24px;
            color: #33C3F0;
            cursor: pointer;
          }
          .mapboxgl-canvas {
            border-radius: 0.5rem;
          }
        `}
      </style>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
    </div>
  );
};

export default WorldMap;