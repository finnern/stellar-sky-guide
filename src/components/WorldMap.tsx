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
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize Mapbox with a valid token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHMxYXB5YmkwMGR1MmpxdDZ4NHJqZm9rIn0.Sj6ZTDPGiXkU5XaQPZj7PA';
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1', // Dark theme
      projection: 'globe',
      zoom: 1.5,
      center: [0, 0],
      pitch: 45,
    });

    map.on('style.load', () => {
      // Set fog effect for better atmosphere
      map.setFog({
        color: 'rgb(23, 25, 37)', // Dark blue fog
        'high-color': 'rgb(36, 37, 49)',
        'horizon-blend': 0.2,
      });

      // Create custom ISS marker
      const el = document.createElement('div');
      el.className = 'iss-marker';
      el.innerHTML = '⊕'; // ISS symbol
      markerInstance.current = new mapboxgl.Marker(el)
        .setLngLat([0, 0])
        .addTo(map);
    });

    mapInstance.current = map;

    // Cleanup
    return () => {
      if (markerInstance.current) {
        markerInstance.current.remove();
        markerInstance.current = null;
      }
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update ISS position
  useEffect(() => {
    if (!issLocation || !mapInstance.current || !markerInstance.current) return;

    const { longitude, latitude } = issLocation;
    
    // Update marker position
    markerInstance.current.setLngLat([longitude, latitude]);
    
    // Smoothly move map to new position
    mapInstance.current.easeTo({
      center: [longitude, latitude],
      duration: 2000,
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
        `}
      </style>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
    </div>
  );
};

export default WorldMap;