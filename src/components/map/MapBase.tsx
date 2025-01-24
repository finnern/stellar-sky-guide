import React from 'react';
import L from 'leaflet';

interface MapBaseProps {
  container: HTMLElement;
}

const MapBase = ({ container }: MapBaseProps) => {
  const map = L.map(container, {
    zoomSnap: 0.5,
    minZoom: 2,
    maxZoom: 8
  }).setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
};

export default MapBase;