import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';
import { transform } from 'ol/proj';

interface ISSTrajectoryProps {
  map: Map;
  positions: Array<{
    coords: [number, number];
    timestamp: number;
  }>;
}

const ISSTrajectory = ({ map, positions }: ISSTrajectoryProps) => {
  console.log('Creating trajectory with positions:', positions);
  
  const source = new VectorSource();
  
  if (positions.length > 0) {
    // Get the most recent position
    const lastPosition = positions[positions.length - 1];
    const [lastLon, lastLat] = lastPosition.coords;
    
    // Calculate trajectory points
    const numPoints = 30; // Number of future points to predict
    const timeStep = 180; // 3 minutes per step
    const trajectoryPoints: [number, number][] = [];
    
    // ISS orbital parameters (approximate)
    const orbitalPeriod = 92.68 * 60; // Convert to seconds
    const orbitalSpeed = (2 * Math.PI * (6371 + 408)) / orbitalPeriod; // km/s
    
    let currentLat = lastLat;
    let currentLon = lastLon;
    
    // Generate future points
    for (let i = 0; i < numPoints; i++) {
      trajectoryPoints.push([currentLon, currentLat]);
      
      // Calculate position change based on orbital parameters
      const distance = orbitalSpeed * timeStep;
      const earthRadius = 6371; // km
      
      // Convert distance to lat/lon changes (simplified calculation)
      const deltaLat = (distance / earthRadius) * (180 / Math.PI);
      const deltaLon = (distance / (earthRadius * Math.cos(Math.PI * currentLat / 180))) * (180 / Math.PI);
      
      // Update position (ISS moves west to east)
      currentLat += deltaLat * Math.sin(51.6 * Math.PI / 180); // Account for orbital inclination
      currentLon += deltaLon;
      
      // Normalize longitude to [-180, 180]
      currentLon = ((currentLon + 180) % 360) - 180;
    }
    
    console.log('Generated trajectory points:', trajectoryPoints);
    
    // Create line segments with fading opacity
    for (let i = 0; i < trajectoryPoints.length - 1; i++) {
      const start = transform(trajectoryPoints[i], 'EPSG:4326', 'EPSG:3857');
      const end = transform(trajectoryPoints[i + 1], 'EPSG:4326', 'EPSG:3857');
      
      const segment = new Feature({
        geometry: new LineString([start, end])
      });
      
      // Calculate opacity (fade out along the prediction)
      const opacity = Math.max(0.2, 1 - (i / trajectoryPoints.length));
      
      segment.setStyle(
        new Style({
          stroke: new Stroke({
            color: `rgba(255, 100, 100, ${opacity})`, // Red for predicted path
            width: 3,
            lineCap: 'round',
            lineJoin: 'round'
          }),
        })
      );
      
      source.addFeature(segment);
    }
    
    // Add historical path
    if (positions.length > 1) {
      for (let i = 0; i < positions.length - 1; i++) {
        const start = transform(positions[i].coords, 'EPSG:4326', 'EPSG:3857');
        const end = transform(positions[i + 1].coords, 'EPSG:4326', 'EPSG:3857');
        
        const segment = new Feature({
          geometry: new LineString([start, end])
        });
        
        // Calculate opacity based on age
        const currentTime = Date.now();
        const segmentAge = (currentTime - positions[i].timestamp) / 5400000; // 90 minutes
        const opacity = Math.max(0.1, 1 - segmentAge);
        
        segment.setStyle(
          new Style({
            stroke: new Stroke({
              color: `rgba(0, 191, 255, ${opacity})`, // Blue for historical path
              width: 3,
              lineCap: 'round',
              lineJoin: 'round'
            }),
          })
        );
        
        source.addFeature(segment);
      }
    }
  } else {
    console.warn('Not enough positions to create trajectory line');
  }

  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 2, // Below ISS dot but above map
  });

  console.log('Adding trajectory layer to map');
  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSTrajectory;