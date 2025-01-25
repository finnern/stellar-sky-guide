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
    velocity: number;
    altitude: number;
  } | null;
}

const WorldMap = ({ issLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      console.log('Map initialized');
      
      // Set initial view
      map.current.getView().setZoom(1.5);
      map.current.getView().setCenter(transform([0, 0], 'EPSG:4326', 'EPSG:3857'));
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
      
      // Transform coordinates for display
      const transformedCoord = transform(
        [issLocation.longitude, issLocation.latitude], 
        'EPSG:4326', 
        'EPSG:3857'
      );

      // Update marker
      ISSMarker({ 
        map: map.current, 
        position: transformedCoord
      });
      
      // Update trajectory
      ISSTrajectory({ 
        map: map.current, 
        issLocation
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