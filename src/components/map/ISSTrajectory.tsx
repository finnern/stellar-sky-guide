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
  // Remove existing trajectory layers
  map.getLayers().getArray()
    .filter(layer => layer.get('name')?.toString().startsWith('issTrajectory'))
    .forEach(layer => map.removeLayer(layer));

  const { latitude, longitude } = issLocation;
  
  // Get the ISS position in map coordinates
  const issPosition = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
  
  // Parameters for a complete orbit
  const ORBITAL_PERIOD = 5400; // seconds (90 minutes)
  const INCLINATION = 51.6; // degrees
  const ORBITAL_SPEED = 360 / ORBITAL_PERIOD; // degrees per second
  
  // Calculate time needed to cross 1 degree of longitude at the equator
  const SECONDS_PER_DEGREE = ORBITAL_PERIOD / 360;
  
  // Time windows (in seconds)
  const PAST_WINDOW = 4800; // 80 minutes
  const FUTURE_START = 60; // 1 minute (just after ISS)
  const FUTURE_WINDOW = 3600; // 60 minutes
  
  // Function to calculate position at a given time offset (negative = past, positive = future)
  const calculatePosition = (timeOffset: number) => {
    // Calculate longitude change: ISS moves eastward at constant angular speed
    // For past trajectory, we subtract; for future, we add
    const lonChange = -(timeOffset * ORBITAL_SPEED);
    let lon = longitude + lonChange;
    
    // Adjust for Earth's rotation (15 degrees per hour = 0.00417 degrees per second)
    lon -= (timeOffset * 0.00417);
    
    // Normalize longitude to [-180, 180]
    lon = ((lon + 540) % 360) - 180;
    
    // Calculate latitude using a sine wave based on orbit inclination
    // First determine the current phase based on latitude
    const currentPhase = Math.asin(latitude / INCLINATION); 
    
    // Calculate new phase: moves with angular velocity
    const phaseChange = (timeOffset / ORBITAL_PERIOD) * 2 * Math.PI;
    const newPhase = currentPhase - phaseChange;
    
    // Calculate new latitude
    const lat = INCLINATION * Math.sin(newPhase);
    
    return { lon, lat };
  };
  
  // Helper function to detect if two points cross the antimeridian
  const crossesAntimeridian = (lon1: number, lon2: number) => {
    // If the longitude difference is more than 180 degrees, it crosses the antimeridian
    const diff = Math.abs(lon1 - lon2);
    return diff > 180;
  };
  
  // Past trajectory: solid line, 80 minutes back, ending at ISS (moves westward)
  const pastLines: number[][][] = [];
  let pastLine: number[][] = [];
  let prevLon: number | null = null;
  const step = 60;
  // Draw from oldest to newest (so ISS is last point)
  for (let t = -PAST_WINDOW; t <= 0; t += step) {
    // For the past, longitude should decrease (westward)
    const { lon, lat } = calculatePosition(-t); // Use -t for westward movement
    if (prevLon !== null && crossesAntimeridian(prevLon, lon)) {
      if (pastLine.length > 1) pastLines.push([...pastLine]);
      pastLine = [];
    }
    const point = transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    pastLine.push(point);
    prevLon = lon;
  }
  if (pastLine.length > 1) pastLines.push(pastLine);

  // Future trajectory: dashed line, starts just after ISS, goes 60 minutes forward (moves eastward)
  const futureLines: number[][][] = [];
  let futureLine: number[][] = [];
  prevLon = null;
  for (let t = FUTURE_START; t <= FUTURE_WINDOW + FUTURE_START; t += step) {
    // For the future, longitude should increase (eastward)
    const { lon, lat } = calculatePosition(t); // Use t for eastward movement
    if (prevLon !== null && crossesAntimeridian(prevLon, lon)) {
      if (futureLine.length > 1) futureLines.push([...futureLine]);
      futureLine = [];
    }
    const point = transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    futureLine.push(point);
    prevLon = lon;
  }
  if (futureLine.length > 1) futureLines.push(futureLine);

  // Draw past trajectory (solid)
  if (pastLines.length > 0) {
    const features = pastLines.map(line => new Feature({ geometry: new LineString(line) }));
    const layer = new VectorLayer({
      source: new VectorSource({ features }),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 191, 255, 1)',
          width: 3,
          lineDash: []
        })
      })
    });
    layer.set('name', 'issTrajectory-past');
    map.addLayer(layer);
  }

  // Draw future trajectory (dashed)
  if (futureLines.length > 0) {
    const features = futureLines.map(line => new Feature({ geometry: new LineString(line) }));
    const layer = new VectorLayer({
      source: new VectorSource({ features }),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 191, 255, 0.6)',
          width: 2,
          lineDash: [8, 8]
        })
      })
    });
    layer.set('name', 'issTrajectory-future');
    map.addLayer(layer);
  }
};

export default ISSTrajectory;