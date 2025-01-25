import { Map } from 'ol';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke } from 'ol/style';
import { transform } from 'ol/proj';

interface ISSTrajectoryProps {
  map: Map;
  issLocation: {
    latitude: number;
    longitude: number;
    velocity: number;
    altitude: number;
  };
}

const ISSTrajectory = ({ map, issLocation }: ISSTrajectoryProps) => {
  // Remove existing trajectory layer if it exists
  map.getLayers().getArray()
    .filter(layer => layer.get('name') === 'issTrajectory')
    .forEach(layer => map.removeLayer(layer));

  const { latitude, longitude, velocity } = issLocation;
  const points: number[][] = [];
  
  // Calculate trajectory points (both past and future)
  const numPoints = 30;
  const timeStep = 180; // 3 minutes
  const earthRadius = 6371; // km
  
  // Calculate points for trajectory
  let currentLat = latitude;
  let currentLon = longitude;
  
  for (let i = -numPoints/2; i < numPoints/2; i++) {
    points.push(transform([currentLon, currentLat], 'EPSG:4326', 'EPSG:3857'));
    
    const distance = (velocity/1000) * timeStep; // Convert velocity to km/s
    const deltaLat = (distance / earthRadius) * (180 / Math.PI) * Math.sin(Math.PI * currentLat / 180);
    const deltaLon = (distance / (earthRadius * Math.cos(Math.PI * currentLat / 180))) * (180 / Math.PI);
    
    currentLat += deltaLat * Math.sin(51.6 * Math.PI / 180); // Account for inclination
    currentLon += deltaLon;
    currentLon = ((currentLon + 180) % 360) - 180; // Normalize longitude
  }

  const feature = new Feature({
    geometry: new LineString(points)
  });

  const layer = new VectorLayer({
    source: new VectorSource({
      features: [feature]
    }),
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(0, 191, 255, 0.8)',
        width: 2
      })
    })
  });

  layer.set('name', 'issTrajectory');
  map.addLayer(layer);

  return layer;
};

export default ISSTrajectory;