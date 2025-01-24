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

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  return map;
};

export default MapBase;