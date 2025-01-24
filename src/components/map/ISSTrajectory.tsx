import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';

interface ISSTrajectoryProps {
  map: Map;
  positions: [number, number][];
}

const ISSTrajectory = ({ map, positions }: ISSTrajectoryProps) => {
  const source = new VectorSource();
  
  if (positions.length > 1) {
    const feature = new Feature({
      geometry: new LineString(positions),
    });

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'rgba(51, 195, 240, 0.6)',
          width: 2,
        }),
      })
    );

    source.addFeature(feature);
  }

  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 1,
  });

  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSTrajectory;