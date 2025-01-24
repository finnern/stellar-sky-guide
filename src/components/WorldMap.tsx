import React, { useEffect, useRef } from 'react';
import { Map } from 'ol';
import 'ol/ol.css';
import { toast } from '@/components/ui/use-toast';
import MapBase from './map/MapBase';
import ISSMarker from './map/ISSMarker';
import ISSTrajectory from './map/ISSTrajectory';
import { transform } from 'ol/proj';

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
  const positions = useRef<Array<{coords: [number, number], timestamp: number}>>([]);
  const isFirstPosition = useRef<boolean>(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      console.log('Map initialized');
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
    if (!issLocation || !map.current) {
      console.log('Skipping update - no issLocation or map:', { issLocation, map: !!map.current });
      return;
    }

    try {
      console.log('Updating ISS position:', issLocation);
      
      // Transform coordinates from EPSG:4326 (lat/lon) to EPSG:3857 (Web Mercator)
      const newPosition: [number, number] = [issLocation.longitude, issLocation.latitude];
      const transformedCoord = transform(newPosition, 'EPSG:4326', 'EPSG:3857');
      const transformedPosition: [number, number] = [transformedCoord[0], transformedCoord[1]];
      
      console.log('Transformed position:', transformedPosition);

      // Update or create marker
      if (marker.current) {
        console.log('Updating existing marker');
        const source = marker.current.getSource();
        const feature = source.getFeatures()[0];
        feature.getGeometry().setCoordinates(transformedPosition);
      } else {
        console.log('Creating new marker');
        marker.current = ISSMarker({ 
          map: map.current, 
          position: transformedPosition
        });
      }
      
      // Update trajectory
      positions.current.push({
        coords: transformedPosition,
        timestamp: Date.now()
      });

      console.log('Updated positions array:', positions.current);

      // Keep only positions from the last 90 minutes
      const ninetyMinutesAgo = Date.now() - 5400000;
      positions.current = positions.current.filter(pos => pos.timestamp > ninetyMinutesAgo);
      
      console.log('Filtered positions array length:', positions.current.length);
      
      // Remove old trajectory and create new one
      if (trajectory.current) {
        console.log('Removing old trajectory');
        map.current.removeLayer(trajectory.current);
      }
      
      console.log('Creating new trajectory');
      trajectory.current = ISSTrajectory({ 
        map: map.current, 
        positions: positions.current 
      });
      
      // Center map on ISS if it's the first position
      if (isFirstPosition.current) {
        console.log('First position - centering map');
        map.current.getView().setCenter(transformedPosition);
        map.current.getView().setZoom(4);
        isFirstPosition.current = false;
      }
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
