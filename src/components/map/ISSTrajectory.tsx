import React from 'react';
import L from 'leaflet';

interface ISSTrajectoryProps {
  map: L.Map;
  positions: [number, number][];
}

const ISSTrajectory = ({ map, positions }: ISSTrajectoryProps) => {
  return L.polyline(positions, { 
    color: '#33C3F0',
    weight: 2,
    opacity: 0.6
  }).addTo(map);
};

export default ISSTrajectory;