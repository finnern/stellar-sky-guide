import L from 'leaflet';

export const initializeMap = (container: HTMLElement): L.Map => {
  const map = L.map(container, {
    zoomSnap: 0.5,
    minZoom: 2,
    maxZoom: 8
  }).setView([0, 0], 2);

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
    html: `<img src="/iss-icon.svg" alt="ISS" style="width: 100%; height: 100%;" />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
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