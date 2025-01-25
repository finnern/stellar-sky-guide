import { Map } from 'ol';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';

interface ISSMarkerProps {
  map: Map;
  position: number[];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  // Remove existing ISS marker layer if it exists
  map.getLayers().getArray()
    .filter(layer => layer.get('name') === 'issMarker')
    .forEach(layer => map.removeLayer(layer));

  // Create new marker
  const marker = new Feature({
    geometry: new Point(position)
  });

  const layer = new VectorLayer({
    source: new VectorSource({
      features: [marker]
    }),
    style: new Style({
      image: new Icon({
        src: '/lovable-uploads/cee69201-adcb-4828-8a41-7b2b6fe68e8f.png',
        scale: 0.5,
        anchor: [0.5, 0.5]
      })
    })
  });

  layer.set('name', 'issMarker');
  map.addLayer(layer);

  return layer;
};

export default ISSMarker;