import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';

interface ISSMarkerProps {
  map: Map;
  position: [number, number];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  const source = new VectorSource();
  const feature = new Feature({
    geometry: new Point(position),
  });

  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({ color: '#33C3F0' }),
        stroke: new Stroke({ 
          color: '#FFFFFF',
          width: 2
        }),
      }),
    })
  );

  source.addFeature(feature);

  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 2,
  });

  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSMarker;