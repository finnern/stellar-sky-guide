import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHMxYXB5YmkwMGR1MmpxdDZ4NHJqZm9rIn0.Sj6ZTDPGiXkU5XaQPZj7PA';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 0],
      pitch: 45,
    });

    newMap.on('style.load', () => {
      if (!map.current) return;
      
      map.current.setFog({
        color: 'rgb(23, 25, 37)',
        'high-color': 'rgb(36, 37, 49)',
        'horizon-blend': 0.2,
      });

      // Create ISS marker
      const el = document.createElement('div');
      el.className = 'iss-marker';
      el.innerHTML = '⊕';
      
      if (marker.current) {
        marker.current.remove();
      }
      
      marker.current = new mapboxgl.Marker(el)
        .setLngLat([0, 0])
        .addTo(map.current);
    });

    map.current = newMap;

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update ISS position
  useEffect(() => {
    if (!issLocation || !map.current || !marker.current) return;

    const { longitude, latitude } = issLocation;
    
    // Update marker position without creating new instances
    marker.current.setLngLat([longitude, latitude]);
    
    // Use a simple center update to avoid complex state
    map.current.setCenter([longitude, latitude]);
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