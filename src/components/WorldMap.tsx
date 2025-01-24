import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initializeMap, createISSMarker, updateMarkerPosition } from '../utils/mapUtils';
import { toast } from '@/components/ui/use-toast';

interface WorldMapProps {
  issLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const WorldMap = ({ issLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const trajectory = useRef<L.Polyline | null>(null);
  const positions = useRef<[number, number][]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = initializeMap(mapContainer.current);
      marker.current = createISSMarker(map.current);
      trajectory.current = L.polyline([], { 
        color: '#33C3F0',
        weight: 2,
        opacity: 0.6
      }).addTo(map.current);
    } catch (error) {
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please try again later.",
        variant: "destructive",
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update ISS position and trajectory
  useEffect(() => {
    if (!issLocation || !map.current || !marker.current || !trajectory.current) return;

    try {
      const newPosition: [number, number] = [issLocation.latitude, issLocation.longitude];
      
      // Update marker position
      updateMarkerPosition(map.current, marker.current, issLocation);
      
      // Update trajectory
      positions.current.push(newPosition);
      if (positions.current.length > 1200) {
        positions.current.shift();
      }
      trajectory.current.setLatLngs(positions.current);
      
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Unable to update ISS location. Please try again later.",
        variant: "destructive",
      });
    }
  }, [issLocation]);

  return (
    <div className="glass-card overflow-hidden space-y-4">
      <style>
        {`
          .iss-marker {
            cursor: pointer;
            animation: pulse-slow 2s infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 0 8px #33C3F0);
          }
          .leaflet-container {
            background: #1A1F2C;
            height: 400px;
            width: 100%;
            border-radius: 0.5rem;
          }
          .leaflet-tile-pane {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
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
      <div className="text-center text-xs text-gray-400">
        <a 
          href="https://www.flaticon.com/free-icons/spacecraft" 
          title="spacecraft icons"
          className="hover:text-space-blue transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Spacecraft icons created by Freepik - Flaticon
        </a>
      </div>
    </div>
  );
};

export default WorldMap;