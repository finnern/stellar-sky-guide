import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeMap, setupMapEffects, createISSMarker } from '../utils/mapUtils';
import { toast } from '@/components/ui/use-toast';

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initializeMapWithToken = () => {
    if (!mapContainer.current || !mapboxToken) return;
    
    try {
      map.current = initializeMap(mapContainer.current, mapboxToken);
      marker.current = createISSMarker(map.current);

      map.current.on('style.load', () => {
        if (!map.current) return;
        setupMapEffects(map.current);
        setIsMapInitialized(true);
      });
    } catch (error) {
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
        variant: "destructive",
      });
    }
  };

  // Initialize map when token is provided
  useEffect(() => {
    if (mapboxToken) {
      initializeMapWithToken();
    }
    
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  // Update ISS position
  useEffect(() => {
    if (!issLocation || !map.current || !marker.current || !isMapInitialized) return;

    const { longitude, latitude } = issLocation;
    
    marker.current.setLngLat([longitude, latitude]);
    
    map.current.easeTo({
      center: [longitude, latitude],
      duration: 1500,
      essential: true
    });
  }, [issLocation, isMapInitialized]);

  return (
    <div className="glass-card overflow-hidden space-y-4">
      {!isMapInitialized && (
        <div className="p-4">
          <label htmlFor="mapbox-token" className="block text-sm font-medium text-gray-300 mb-2">
            Enter your Mapbox token to initialize the map
          </label>
          <div className="flex gap-2">
            <input
              id="mapbox-token"
              type="text"
              className="flex-1 rounded-md bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <button
              onClick={initializeMapWithToken}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Initialize Map
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Get your token from <a href="https://www.mapbox.com/account/access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mapbox Dashboard</a>
          </p>
        </div>
      )}
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