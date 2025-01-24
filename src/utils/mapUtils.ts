import mapboxgl from 'mapbox-gl';

export const initializeMap = (container: HTMLDivElement, accessToken: string): mapboxgl.Map => {
  mapboxgl.accessToken = accessToken;
  
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    projection: 'globe',
    zoom: 1.5,
    center: [0, 0],
    pitch: 45,
  });
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