import React from 'react';
import L from 'leaflet';

interface ISSMarkerProps {
  map: L.Map;
  position: [number, number];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  return L.circleMarker(position, {
    radius: 10,
    color: '#33C3F0',
    fillColor: '#33C3F0',
    fillOpacity: 0.8,
    weight: 2,
    className: 'iss-marker',
    interactive: true,
    title: 'International Space Station'
  }).addTo(map);
};

export default ISSMarker;