import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';

interface ISSMarkerProps {
  map: Map;
  position: [number, number];
}

const ISSMarker = ({ map, position }: ISSMarkerProps) => {
  console.log('Creating ISS marker at position:', position);
  
  // Create a new vector source
  const source = new VectorSource();
  
  // Create a feature with the ISS position
  const feature = new Feature({
    geometry: new Point(position),
  });

  // Apply styling to make the ISS dot visible
  const style = new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#00BFFF' }),
      stroke: new Stroke({ 
        color: '#FFFFFF',
        width: 2
      }),
    }),
  });

  console.log('Setting style for ISS marker');
  feature.setStyle(style);

  console.log('Adding feature to source');
  source.addFeature(feature);

  // Create and add the vector layer
  const vectorLayer = new VectorLayer({
    source: source,
    zIndex: 3, // Keep ISS dot on top
  });

  console.log('Adding vector layer to map');
  map.addLayer(vectorLayer);
  return vectorLayer;
};

export default ISSMarker;