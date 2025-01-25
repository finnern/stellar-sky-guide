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
import { Style, Stroke, Circle, Fill } from 'ol/style';
import Point from 'ol/geom/Point';

interface WorldMapProps {
  issLocation: {
    latitude: number;
    longitude: number;
    velocity: number;
    altitude: number;
  } | null;
  userLocation?: { lat: number; lon: number } | null;
}

const MAX_PATH_POINTS = 50;

const WorldMap = ({ issLocation, userLocation }: WorldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [pathPoints, setPathPoints] = useState<number[][]>([]);
  const pathLayer = useRef<VectorLayer<VectorSource>>();
  const userLocationLayer = useRef<VectorLayer<VectorSource>>();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = MapBase({ container: mapContainer.current });
      console.log('Map initialized');
      
      // Create path layer with updated styling
      const vectorSource = new VectorSource();
      pathLayer.current = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'rgba(51, 195, 240, 0.6)',
            width: 1.5
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

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove existing user location layer
    if (userLocationLayer.current) {
      map.current.removeLayer(userLocationLayer.current);
    }

    try {
      const transformedCoord = transform(
        [userLocation.lon, userLocation.lat],
        'EPSG:4326',
        'EPSG:3857'
      );

      const locationFeature = new Feature({
        geometry: new Point(transformedCoord)
      });

      userLocationLayer.current = new VectorLayer({
        source: new VectorSource({
          features: [locationFeature]
        }),
        style: new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: '#ff4444' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          })
        })
      });

      map.current.addLayer(userLocationLayer.current);
    } catch (error) {
      console.error('User location update error:', error);
    }
  }, [userLocation]);

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