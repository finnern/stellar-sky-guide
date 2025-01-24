import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getISSLocation, getISSPassTimes } from '../services/issLocation';
import Countdown from '../components/Countdown';
import LocationInput from '../components/LocationInput';
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

  const handleLocationSubmit = async (lat: number, lon: number) => {
    try {
      setUserLocation({ lat, lon });
      const passTime = await getISSPassTimes(lat, lon);
      setNextPass(new Date(passTime.risetime * 1000));
      toast({
        title: "Location Updated",
        description: "Successfully calculated next ISS pass time.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate ISS pass times. Please try again.",
        variant: "destructive",
      });
    }
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

        {issLocation && (
          <div className="glass-card p-6 mt-8">
            <h2 className="text-xl font-bold text-space-blue mb-4">Current ISS Location</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-400">Latitude</p>
                <p className="text-2xl font-bold">{issLocation.latitude.toFixed(4)}°</p>
              </div>
              <div>
                <p className="text-gray-400">Longitude</p>
                <p className="text-2xl font-bold">{issLocation.longitude.toFixed(4)}°</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;