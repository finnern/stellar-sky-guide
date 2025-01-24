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
  const source = new VectorSource();
  
  if (positions.length > 1) {
    console.log('Creating trajectory with positions:', positions.length);
    
    // Create line segments with fading colors
    for (let i = 0; i < positions.length - 1; i++) {
      // Transform coordinates back to EPSG:4326 for line creation
      const start = transform(positions[i].coords, 'EPSG:3857', 'EPSG:4326');
      const end = transform(positions[i + 1].coords, 'EPSG:3857', 'EPSG:4326');
      
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
            color: `rgba(0, 191, 255, ${opacity})`,
            width: 3,
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
    zIndex: 2, // Below ISS dot but above map
  });

  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSTrajectory;