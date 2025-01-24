import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapBaseProps {
  container: HTMLElement;
}

const MapBase = ({ container }: MapBaseProps) => {
  const map = L.map(container, {
    zoomSnap: 0.5,
    minZoom: 2,
    maxZoom: 8,
    center: [0, 0],
    zoom: 2
  });

  const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 8
  }).addTo(map);

  // Add error handling for tile loading
  tileLayer.on('tileerror', (error) => {
    console.error('Tile loading error:', error);
  });

  return map;
};

export default MapBase;