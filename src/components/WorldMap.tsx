import React, { useEffect, useRef, useState } from 'react';
import { Map } from 'ol';
import 'ol/ol.css';
import { toast } from '@/components/ui/use-toast';
import MapBase from './map/MapBase';
import ISSMarker from './map/ISSMarker';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';
import Feature from 'ol/Feature';
import { Style, Stroke } from 'ol/style';

interface WorldMapProps {
  issLocation: {
    latitude: number;
    longitude: number;
    velocity: number;
    altitude: number;
  } | null;
}

const MAX_PATH_POINTS = 50;

const WorldMap = ({ issLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [pathPoints, setPathPoints] = useState<number[][]>([]);
  const pathLayer = useRef<VectorLayer<VectorSource>>();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      console.log('Map initialized');
      
      // Create path layer
      const vectorSource = new VectorSource();
      pathLayer.current = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: '#33C3F0',
            width: 2
          })
        })
      });
      
      map.current.addLayer(pathLayer.current);
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

  // Update ISS position and path
  useEffect(() => {
    if (!issLocation || !map.current || !pathLayer.current) {
      return;
    }

    try {
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
      
      // Update path points
      setPathPoints(prevPoints => {
        const newPoints = [...prevPoints, transformedCoord];
        return newPoints.slice(-MAX_PATH_POINTS);
      });

      // Update path layer
      if (pathPoints.length > 1) {
        const lineString = new LineString(pathPoints);
        const feature = new Feature(lineString);
        
        pathLayer.current.setSource(
          new VectorSource({
            features: [feature]
          })
        );
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