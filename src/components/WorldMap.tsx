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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // Replace with your Mapbox token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 0],
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(23, 25, 37)',
        'high-color': 'rgb(36, 37, 49)',
        'horizon-blend': 0.2,
      });

      // Create ISS marker
      const el = document.createElement('div');
      el.className = 'iss-marker';
      el.innerHTML = '⊕';
      
      marker.current = new mapboxgl.Marker(el)
        .setLngLat([0, 0])
        .addTo(map.current);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update ISS position
  useEffect(() => {
    if (issLocation && map.current && marker.current) {
      marker.current.setLngLat([issLocation.longitude, issLocation.latitude]);
      
      // Smoothly animate to new position
      map.current.easeTo({
        center: [issLocation.longitude, issLocation.latitude],
        duration: 2000,
      });
    }
  }, [issLocation]);

  return (
    <div className="glass-card overflow-hidden">
      <style>
        {`
          .iss-marker {
            font-size: 24px;
            color: #33C3F0;
            cursor: pointer;
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