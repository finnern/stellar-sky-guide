import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/components/ui/use-toast';
import MapBase from './map/MapBase';
import ISSMarker from './map/ISSMarker';
import ISSTrajectory from './map/ISSTrajectory';

interface WorldMapProps {
  issLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const WorldMap = ({ issLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const trajectory = useRef<L.Polyline | null>(null);
  const positions = useRef<[number, number][]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      
      if (issLocation) {
        const position: [number, number] = [issLocation.latitude, issLocation.longitude];
        map.current.setView(position, 2);
        
        marker.current = ISSMarker({ 
          map: map.current, 
          position: position
        });
        
        trajectory.current = ISSTrajectory({ 
          map: map.current, 
          positions: positions.current 
        });
      }
    } catch (error) {
      console.error('Map initialization error:', error);
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
      marker.current.setLatLng(newPosition);
      
      // Update trajectory
      positions.current.push(newPosition);
      if (positions.current.length > 1200) { // Keep approximately 100 minutes of data (5s updates)
        positions.current.shift();
      }
      trajectory.current.setLatLngs(positions.current);
      
    } catch (error) {
      console.error('Position update error:', error);
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
          .leaflet-container {
            background: #1A1F2C;
            height: 400px;
            width: 100%;
            border-radius: 0.5rem;
          }
          .leaflet-tile-pane {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
          .iss-marker {
            cursor: pointer;
            animation: pulse-slow 2s infinite;
          }
        `}
      </style>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
    </div>
  );
};

export default WorldMap;