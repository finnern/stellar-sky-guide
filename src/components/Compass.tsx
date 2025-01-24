import { useEffect, useState } from 'react';
import { calculateBearing, getCardinalDirection } from '@/utils/compassUtils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CompassProps {
  userLocation: { lat: number; lon: number };
  issLocation: { latitude: number; longitude: number };
}

const Compass = ({ userLocation, issLocation }: CompassProps) => {
  const [bearing, setBearing] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [hasOrientationSupport, setHasOrientationSupport] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

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

  // Request device orientation permission and setup
  const setupDeviceOrientation = async () => {
    console.log("Setting up device orientation...");

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      console.log("Device supports permission requests for orientation events");
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          console.log("Orientation permission granted");
          setPermissionGranted(true);
          setHasOrientationSupport(true);
          initializeOrientationTracking();
        } else {
          console.log("Orientation permission denied");
          setPermissionGranted(false);
          toast({
            title: "Permission Denied",
            description: "Please enable motion sensors in your device settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error requesting orientation permission:", error);
        toast({
          title: "Permission Request Error",
          description: "An error occurred requesting permissions.",
          variant: "destructive",
        });
        setHasOrientationSupport(false);
      }
    } else if ('DeviceOrientationEvent' in window) {
      console.log("Device supports orientation events (no permission needed)");
      setHasOrientationSupport(true);
      setPermissionGranted(true);
      initializeOrientationTracking();
    } else {
      console.log("Device does not support orientation events");
      setHasOrientationSupport(false);
      toast({
        title: "Device Not Supported",
        description: "Your device doesn't support orientation tracking.",
        variant: "destructive",
      });
    }
  };

  const initializeOrientationTracking = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      console.log("Orientation event received:", {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
      
      if (event.alpha !== null) {
        setDeviceOrientation(event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    
    toast({
      title: "Orientation Tracking Active",
      description: "Your device will now point to the ISS location.",
    });
  };

  // Cleanup orientation tracking on unmount
  useEffect(() => {
    return () => {
      if (permissionGranted) {
        window.removeEventListener('deviceorientation', () => {}, true);
      }
    };
  }, [permissionGranted]);

  // Calculate the final rotation including device orientation
  const finalRotation = permissionGranted
    ? bearing - deviceOrientation
    : bearing;

  return (
    <div className="glass-card p-6 relative">
      <h2 className="text-xl font-bold text-space-blue mb-4">ISS Direction</h2>
      
      {!permissionGranted && hasOrientationSupport && (
        <Button 
          onClick={setupDeviceOrientation}
          className="mb-4 bg-space-blue hover:bg-space-accent transition-colors"
        >
          Enable Device Orientation
        </Button>
      )}

      {!hasOrientationSupport && (
        <p className="text-yellow-400 mb-4">
          Your device doesn't support orientation tracking. The compass will show static directions only.
        </p>
      )}

      <div className="relative w-48 h-48 mx-auto">
        {/* Compass Rose */}
        <div className="absolute inset-0 rounded-full border-2 border-space-blue/30">
          {/* Cardinal Directions */}
          {['N', 'E', 'S', 'W'].map((direction) => (
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
          
          {/* Direction Arrow with smooth transition */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${finalRotation}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 flex flex-col items-center">
              <div className="w-4 h-4 bg-space-blue transform -translate-y-1/2 rotate-45" />
              <div className="flex-1 w-0.5 bg-space-blue/50" />
            </div>
          </div>
        </div>

        {/* Direction Information */}
        <div className="text-center mt-4">
          <p className="text-gray-400">ISS is {getCardinalDirection(bearing)}</p>
          <p className="text-sm text-gray-500">{bearing.toFixed(1)}°</p>
          {permissionGranted && (
            <p className="text-sm text-gray-500">
              Device heading: {deviceOrientation.toFixed(1)}°
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compass;