import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';
import { fromLonLat } from 'ol/proj';

interface ISSTrajectoryProps {
  map: Map;
  positions: [number, number][];
}

const ISSTrajectory = ({ map, positions }: ISSTrajectoryProps) => {
  const source = new VectorSource();
  const coordinates = positions.map(pos => fromLonLat(pos));
  
  if (coordinates.length > 1) {
    const feature = new Feature({
      geometry: new LineString(coordinates),
    });

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#33C3F0',
          width: 2,
          opacity: 0.6,
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