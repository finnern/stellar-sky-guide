import mapboxgl from 'mapbox-gl';

export const initializeMap = (container: HTMLDivElement): mapboxgl.Map => {
  mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHMxYXB5YmkwMGR1MmpxdDZ4NHJqZm9rIn0.Sj6ZTDPGiXkU5XaQPZj7PA';
  
  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    projection: 'globe',
    zoom: 1.5,
    center: [0, 0],
    pitch: 45,
  });

  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true,
    }),
    'top-right'
  );

  return map;
};

export const setupMapEffects = (map: mapboxgl.Map) => {
  map.setFog({
    color: 'rgb(23, 25, 37)',
    'high-color': 'rgb(36, 37, 49)',
    'horizon-blend': 0.2,
  });
};

export const createISSMarker = (map: mapboxgl.Map): mapboxgl.Marker => {
  const el = document.createElement('div');
  el.className = 'iss-marker';
  el.innerHTML = '⊕';
  
  return new mapboxgl.Marker(el)
    .setLngLat([0, 0])
    .addTo(map);
};