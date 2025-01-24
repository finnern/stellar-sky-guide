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
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = initializeMap(mapContainer.current);
    marker.current = createISSMarker(map.current);

    // Add fog effect after style loads
    map.current.on('style.load', () => {
      if (!map.current) return;
      setupMapEffects(map.current);
    });

    // Cleanup function
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update ISS position in a separate effect
  useEffect(() => {
    if (!issLocation || !map.current || !marker.current) return;

    const { longitude, latitude } = issLocation;
    
    // Update marker position
    marker.current.setLngLat([longitude, latitude]);
    
    // Update map center with animation
    map.current.easeTo({
      center: [longitude, latitude],
      duration: 1500,
      essential: true
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
            animation: pulse-slow 2s infinite;
          }
          .mapboxgl-canvas {
            border-radius: 0.5rem;
          }
          @keyframes pulse-slow {
            0% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0.6;
              transform: scale(1);
            }
          }
        `}
      </style>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
    </div>
  );
};

export default WorldMap;