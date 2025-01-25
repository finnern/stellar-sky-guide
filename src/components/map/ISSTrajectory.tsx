import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';
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
  console.log('Creating trajectory with position:', issLocation);
  
  const source = new VectorSource();
  
  if (issLocation) {
    const { latitude, longitude, velocity } = issLocation;
    
    // Calculate trajectory points
    const numPoints = 30; // Number of points for past and future
    const timeStep = 180; // 3 minutes per step
    const trajectoryPoints: [number, number][] = [];
    
    // ISS orbital parameters
    const earthRadius = 6371; // km
    const orbitalPeriod = 92.68 * 60; // seconds
    const orbitalSpeed = velocity / 3.6; // Convert km/h to km/s
    const inclination = 51.6 * (Math.PI / 180); // Convert to radians
    
    // Calculate past trajectory points
    let currentLat = latitude * (Math.PI / 180); // Convert to radians
    let currentLon = longitude;
    
    // Generate past points
    for (let i = 0; i < numPoints; i++) {
      trajectoryPoints.unshift([currentLon, currentLat * (180 / Math.PI)]); // Convert lat back to degrees
      
      // Calculate position change based on orbital parameters
      const distance = orbitalSpeed * timeStep;
      
      // Calculate changes considering orbital mechanics
      const deltaLat = (distance / earthRadius) * Math.sin(inclination) * Math.cos(i * 2 * Math.PI / numPoints);
      const deltaLon = (distance / (earthRadius * Math.cos(currentLat))) * Math.cos(inclination);
      
      // Move backwards in time
      currentLat -= deltaLat;
      currentLon -= deltaLon;
      
      // Keep latitude within bounds
      currentLat = Math.max(Math.min(currentLat, inclination), -inclination);
      
      // Normalize longitude to [-180, 180]
      currentLon = ((currentLon + 180) % 360) - 180;
    }
    
    // Reset to current position for future trajectory
    currentLat = latitude * (Math.PI / 180);
    currentLon = longitude;
    
    // Generate future points
    for (let i = 0; i < numPoints; i++) {
      trajectoryPoints.push([currentLon, currentLat * (180 / Math.PI)]);
      
      const distance = orbitalSpeed * timeStep;
      
      const deltaLat = (distance / earthRadius) * Math.sin(inclination) * Math.cos(i * 2 * Math.PI / numPoints);
      const deltaLon = (distance / (earthRadius * Math.cos(currentLat))) * Math.cos(inclination);
      
      // Move forward in time
      currentLat += deltaLat;
      currentLon += deltaLon;
      
      currentLat = Math.max(Math.min(currentLat, inclination), -inclination);
      currentLon = ((currentLon + 180) % 360) - 180;
    }
    
    // Create line segments with varying opacity
    for (let i = 0; i < trajectoryPoints.length - 1; i++) {
      const start = transform(trajectoryPoints[i], 'EPSG:4326', 'EPSG:3857');
      const end = transform(trajectoryPoints[i + 1], 'EPSG:4326', 'EPSG:3857');
      
      const segment = new Feature({
        geometry: new LineString([start, end])
      });
      
      // Calculate opacity - past trajectory fades from current position
      const isPast = i < numPoints;
      const opacity = isPast 
        ? Math.max(0.2, (i / numPoints)) // Past trajectory fades towards the past
        : Math.max(0.2, 1 - ((i - numPoints) / numPoints)); // Future trajectory fades towards the future
      
      segment.setStyle(
        new Style({
          stroke: new Stroke({
            color: isPast 
              ? `rgba(0, 191, 255, ${opacity})` // Blue for past
              : `rgba(255, 100, 100, ${opacity})`, // Red for future
            width: isPast ? 3 : 2,
            lineCap: 'round',
            lineJoin: 'round'
          }),
        })
      );
      
      source.addFeature(segment);
    }
  }

  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 2,
  });

  console.log('Adding trajectory layer to map');
  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSTrajectory;
