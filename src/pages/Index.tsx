import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getISSLocation, calculateNextPass } from '../services/issLocation';
import Countdown from '../components/Countdown';
import LocationInput from '../components/LocationInput';
import Compass from '../components/Compass';
import WorldMap from '../components/WorldMap';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nextPass, setNextPass] = useState<Date | null>(null);

  const { data: issLocation, error } = useQuery({
    queryKey: ['issLocation'],
    queryFn: getISSLocation,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ISS location. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (issLocation && userLocation) {
      const nextPassTime = calculateNextPass(
        issLocation.latitude,
        issLocation.longitude,
        userLocation.lat,
        userLocation.lon
      );
      setNextPass(nextPassTime);
    }
  }, [issLocation, userLocation]);

  const handleLocationSubmit = (lat: number, lon: number) => {
    setUserLocation({ lat, lon });
    toast({
      title: "Location Updated",
      description: "Calculating next ISS pass time...",
    });
  };

  return (
    <div className="min-h-screen bg-space-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-space-blue mb-2">Stellar Compass</h1>
          <p className="text-lg text-gray-300">Track the International Space Station in real-time</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <LocationInput onLocationSubmit={handleLocationSubmit} />
          
          {nextPass && (
            <Countdown targetDate={nextPass} />
          )}
        </div>

        <WorldMap issLocation={issLocation ?? null} />

        <div className="grid md:grid-cols-2 gap-8">
          {issLocation && userLocation && (
            <Compass 
              userLocation={userLocation}
              issLocation={issLocation}
            />
          )}

          {issLocation && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-space-blue mb-4">Current ISS Status</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-400">Latitude</p>
                  <p className="text-2xl font-bold">{issLocation.latitude.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="text-gray-400">Longitude</p>
                  <p className="text-2xl font-bold">{issLocation.longitude.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="text-gray-400">Altitude</p>
                  <p className="text-2xl font-bold">{issLocation.altitude.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-gray-400">Velocity</p>
                  <p className="text-2xl font-bold">{(issLocation.velocity).toFixed(0)} km/h</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Visibility</p>
                  <p className="text-2xl font-bold capitalize">{issLocation.visibility}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;