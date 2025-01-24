import React, { useEffect, useRef } from 'react';
import { Map } from 'ol';
import 'ol/ol.css';
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
  const map = useRef<Map | null>(null);
  const marker = useRef<any>(null);
  const trajectory = useRef<any>(null);
  const positions = useRef<[number, number][]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      
      if (issLocation) {
        const position: [number, number] = [issLocation.longitude, issLocation.latitude];
        
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
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
  }, []);

  // Update ISS position and trajectory
  useEffect(() => {
    if (!issLocation || !map.current || !marker.current || !trajectory.current) return;

    try {
      const newPosition: [number, number] = [issLocation.longitude, issLocation.latitude];
      
      // Update marker position
      const source = marker.current.getSource();
      const feature = source.getFeatures()[0];
      feature.getGeometry().setCoordinates(fromLonLat(newPosition));
      
      // Update trajectory
      positions.current.push(newPosition);
      if (positions.current.length > 1200) {
        positions.current.shift();
      }
      
      // Remove old trajectory and create new one
      map.current.removeLayer(trajectory.current);
      trajectory.current = ISSTrajectory({ 
        map: map.current, 
        positions: positions.current 
      });
      
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
          .map {
            height: 400px;
            width: 100%;
            border-radius: 0.5rem;
            background: #1A1F2C;
          }
        `}
      </style>
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default WorldMap;