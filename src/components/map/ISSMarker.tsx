import React from 'react';
import L from 'leaflet';

interface ISSMarkerProps {
  map: L.Map;
  position: [number, number];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  const issIcon = L.divIcon({
    className: 'iss-marker',
    html: `<img src="/iss-icon.svg" alt="ISS" style="width: 100%; height: 100%;" />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return L.marker(position, { icon: issIcon }).addTo(map);
};

export default ISSMarker;