import { useEffect, useState, useCallback, useRef } from 'react';
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
  const listenersAttached = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Check for orientation support on mount
  useEffect(() => {
    const checkOrientationSupport = () => {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setHasOrientationSupport(true);
        return;
      }
      if ('DeviceOrientationEvent' in window) {
        setHasOrientationSupport(true);
        return;
      }
      setHasOrientationSupport(false);
    };
    checkOrientationSupport();
  }, []);

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

  // Attach orientation event listeners (deduplicated via ref)
  const attachListeners = useCallback(() => {
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    console.log("Setting up orientation listeners...");

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };

      // Log every 10th event to avoid spam
      if (Math.random() < 0.1) {
        console.log("Orientation event:", {
          alpha: event.alpha,
          webkitCompassHeading: webkitEvent.webkitCompassHeading,
          absolute: event.absolute
        });
      }

      if (typeof webkitEvent.webkitCompassHeading === 'number') {
        // iOS: webkitCompassHeading is degrees from magnetic north
        setDeviceOrientation(webkitEvent.webkitCompassHeading);
      } else if (event.alpha !== null) {
        // Android/other: convert alpha to compass heading
        const heading = event.absolute
          ? (360 - event.alpha) % 360
          : (360 - event.alpha) % 360;
        setDeviceOrientation(heading);
      }
    };

    // Try absolute orientation first (more accurate), fall back to regular
    const supportsAbsolute = 'ondeviceorientationabsolute' in window;
    const eventName = supportsAbsolute ? 'deviceorientationabsolute' : 'deviceorientation';

    console.log(`Using ${eventName} event, supportsAbsolute: ${supportsAbsolute}`);

    window.addEventListener(eventName, handleOrientation as EventListener);

    // Also listen to regular deviceorientation as fallback
    if (supportsAbsolute) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    toast({
      title: "Orientation Active",
      description: "Rotate your phone to point toward the ISS.",
    });

    cleanupRef.current = () => {
      console.log("Removing orientation listeners");
      window.removeEventListener(eventName, handleOrientation as EventListener);
      if (supportsAbsolute) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      listenersAttached.current = false;
    };
  }, []);

  // Request device orientation permission (iOS 13+ requires user gesture)
  const requestPermission = async () => {
    console.log("Requesting orientation permission...");

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+: request DeviceOrientationEvent permission
        const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
        console.log("Orientation permission result:", orientationPermission);

        // iOS also requires DeviceMotionEvent permission for full sensor access.
        // Some iOS versions need both granted for webkitCompassHeading to work.
        if (typeof DeviceMotionEvent !== 'undefined' &&
            typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const motionPermission = await (DeviceMotionEvent as any).requestPermission();
            console.log("Motion permission result:", motionPermission);
          } catch (motionError) {
            // Continue even if motion permission fails; orientation is the critical one
            console.warn("Motion permission request failed:", motionError);
          }
        }

        if (orientationPermission === 'granted') {
          console.log("Permission granted, attaching listeners in gesture context");
          // Attach listeners immediately within the user gesture call stack.
          // iOS Safari may ignore listeners added outside the gesture that
          // triggered requestPermission().
          attachListeners();
          setPermissionGranted(true);
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable motion & orientation access in Settings > Safari > Motion & Orientation Access.",
            variant: "destructive",
          });
        }
      } else if ('DeviceOrientationEvent' in window) {
        // Non-iOS browsers: no permission needed
        attachListeners();
        setPermissionGranted(true);
      } else {
        toast({
          title: "Not Supported",
          description: "Your device doesn't support orientation tracking.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast({
        title: "Permission Error",
        description: "Could not request sensor permissions. Ensure you are using HTTPS and try again.",
        variant: "destructive",
      });
    }
  };

  // Fallback: if permissionGranted was set but listeners weren't attached yet
  // (e.g. hot-reload or state restored), set them up via effect.
  useEffect(() => {
    if (permissionGranted && !listenersAttached.current) {
      attachListeners();
    }
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [permissionGranted, attachListeners]);

  // Calculate the final rotation including device orientation
  const finalRotation = permissionGranted
    ? bearing - deviceOrientation
    : bearing;

  return (
    <div className="glass-card p-6 relative">
      <h2 className="text-xl font-bold text-space-blue mb-4">ISS Direction</h2>
      
      {!permissionGranted && hasOrientationSupport && (
        <Button 
          onClick={requestPermission}
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
        {/* Compass Rose - rotates to keep N pointing to real north */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-space-blue/30 transition-transform duration-100 ease-out"
          style={{ transform: permissionGranted ? `rotate(${-deviceOrientation}deg)` : 'rotate(0deg)' }}
        >
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
        </div>
          
        {/* Direction Arrow - always points to ISS relative to screen */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out pointer-events-none"
          style={{ transform: `rotate(${finalRotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 flex flex-col items-center">
            <div className="w-4 h-4 bg-space-blue transform -translate-y-1/2 rotate-45" />
            <div className="flex-1 w-0.5 bg-space-blue/50" />
          </div>
        </div>

        {/* Direction Information */}
        <div className="text-center mt-4">
          <p className="text-gray-400">Point phone toward arrow to face ISS</p>
          <p className="text-sm text-gray-500">ISS is {getCardinalDirection(bearing)} ({bearing.toFixed(0)}°)</p>
          {permissionGranted && (
            <p className="text-xs text-gray-600">
              Heading: {deviceOrientation.toFixed(0)}°
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compass;
