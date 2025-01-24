import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';

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
  
  if (positions.length > 1) {
    console.log('Creating line segments with', positions.length, 'positions');
    
    // Create line segments with fading colors
    for (let i = 0; i < positions.length - 1; i++) {
      console.log(`Creating segment ${i} from`, positions[i].coords, 'to', positions[i + 1].coords);
      
      const segment = new Feature({
        geometry: new LineString([
          positions[i].coords,
          positions[i + 1].coords
        ])
      });

      // Calculate opacity based on age
      const currentTime = Date.now();
      const segmentAge = (currentTime - positions[i].timestamp) / 5400000; // 90 minutes
      const opacity = Math.max(0.1, 1 - segmentAge);
      
      console.log(`Segment ${i} age:`, segmentAge, 'opacity:', opacity);

      segment.setStyle(
        new Style({
          stroke: new Stroke({
            color: `rgba(0, 191, 255, ${opacity})`,
            width: 3,
            lineCap: 'round',
            lineJoin: 'round'
          }),
        })
      );

      source.addFeature(segment);
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