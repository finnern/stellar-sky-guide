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
  const source = new VectorSource();
  
  if (positions.length > 1) {
    // Create line segments with fading colors
    for (let i = 0; i < positions.length - 1; i++) {
      const segment = new Feature({
        geometry: new LineString([
          positions[i].coords,
          positions[i + 1].coords
        ]),
      });

      // Calculate age as a fraction of 90 minutes (5400000 milliseconds)
      const age = (Date.now() - positions[i].timestamp) / 5400000;
      const opacity = Math.max(0, 1 - age);

      segment.setStyle(
        new Style({
          stroke: new Stroke({
            color: `rgba(51, 195, 240, ${opacity})`,
            width: 2,
          }),
        })
      );

      source.addFeature(segment);
    }
  }

  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 1,
  });

  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSTrajectory;