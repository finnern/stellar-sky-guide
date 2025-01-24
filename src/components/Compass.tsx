import { useEffect, useState } from 'react';
import { calculateBearing, getCardinalDirection } from '@/utils/compassUtils';

interface CompassProps {
  userLocation: { lat: number; lon: number };
  issLocation: { latitude: number; longitude: number };
}

const Compass = ({ userLocation, issLocation }: CompassProps) => {
  const [bearing, setBearing] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [hasOrientationSupport, setHasOrientationSupport] = useState(false);

  // Calculate initial bearing
  useEffect(() => {
    const newBearing = calculateBearing(
      userLocation.lat,
      userLocation.lon,
      issLocation.latitude,
      issLocation.longitude
    );
    setBearing(newBearing);
  }, [userLocation, issLocation]);

  // Setup device orientation
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      setHasOrientationSupport(true);
      
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setDeviceOrientation(event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }
  }, []);

  // Calculate the final rotation including device orientation
  const finalRotation = hasOrientationSupport
    ? bearing - deviceOrientation
    : bearing;

  return (
    <div className="glass-card p-6 relative">
      <h2 className="text-xl font-bold text-space-blue mb-4">ISS Direction</h2>
      <div className="relative w-48 h-48 mx-auto">
        {/* Compass Rose */}
        <div className="absolute inset-0 rounded-full border-2 border-space-blue/30">
          {/* Cardinal Directions */}
          {['N', 'E', 'S', 'W'].map((direction, index) => (
            <div
              key={direction}
              className="absolute text-space-blue font-bold"
              style={{
                top: direction === 'N' ? '0.5rem' : direction === 'S' ? 'calc(100% - 2rem)' : '50%',
                left: direction === 'W' ? '0.5rem' : direction === 'E' ? 'calc(100% - 2rem)' : '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {direction}
            </div>
          ))}
          
          {/* Direction Arrow */}
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `rotate(${finalRotation}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 flex flex-col items-center">
              <div className="w-4 h-4 bg-space-blue transform -translate-y-1/2 rotate-45" />
              <div className="flex-1 w-0.5 bg-space-blue/50" />
            </div>
          </div>
        </div>

        {/* Cardinal Direction Text */}
        <div className="text-center mt-4">
          <p className="text-gray-400">ISS is {getCardinalDirection(bearing)}</p>
          <p className="text-sm text-gray-500">{bearing.toFixed(1)}°</p>
        </div>
      </div>
    </div>
  );
};

export default Compass;