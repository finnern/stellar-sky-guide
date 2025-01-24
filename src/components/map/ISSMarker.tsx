import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';
import { fromLonLat } from 'ol/proj';

interface ISSMarkerProps {
  map: Map;
  position: [number, number];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  const source = new VectorSource();
  const feature = new Feature({
    geometry: new Point(fromLonLat(position)),
  });

  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: '#33C3F0' }),
        stroke: new Stroke({ color: '#33C3F0', width: 2 }),
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