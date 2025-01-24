import L from 'leaflet';

export const initializeMap = (container: HTMLElement): L.Map => {
  const map = L.map(container).setView([52.52, 13.405], 3);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    className: 'dark-tiles'
  }).addTo(map);

  return map;
};

export const createISSMarker = (map: L.Map): L.Marker => {
  const issIcon = L.divIcon({
    className: 'iss-marker',
    html: '⊕',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  return L.marker([0, 0], { icon: issIcon }).addTo(map);
};

export const updateMarkerPosition = (
  map: L.Map,
  marker: L.Marker,
  position: { latitude: number; longitude: number }
) => {
  const { latitude, longitude } = position;
  marker.setLatLng([latitude, longitude]);
  map.panTo([latitude, longitude], { 
    animate: true,
    duration: 1.5 
  });
};