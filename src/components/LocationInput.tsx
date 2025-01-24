import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { geocodeLocation, getDefaultLocation } from '@/services/geocoding';
import { toast } from "@/components/ui/use-toast";

interface LocationInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const LocationInput = ({ onLocationSubmit }: LocationInputProps) => {
  const [cityCountry, setCityCountry] = useState('Berlin, Germany');
  const [latitude, setLatitude] = useState(getDefaultLocation().lat.toString());
  const [longitude, setLongitude] = useState(getDefaultLocation().lon.toString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleCitySubmit(new Event('submit') as any);
  }, []);

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await geocodeLocation(cityCountry);
      
      if (result.error) {
        toast({
          title: "Location Notice",
          description: result.error,
        });
      }

      onLocationSubmit(result.lat, result.lon);
      setLatitude(result.lat.toString());
      setLongitude(result.lon.toString());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get location coordinates. Using default location.",
        variant: "destructive",
      });
      const defaultLoc = getDefaultLocation();
      onLocationSubmit(defaultLoc.lat, defaultLoc.lon);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSubmit(lat, lon);
    } else {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude and longitude values.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-space-blue mb-4">Enter Location</h2>
      <Tabs defaultValue="city" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="city">City, Country</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="city">
          <form onSubmit={handleCitySubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter city, country (e.g., Berlin, Germany)"
              value={cityCountry}
              onChange={(e) => setCityCountry(e.target.value)}
              className="bg-space-purple/50 border-space-blue/30 text-white"
            />
            <Button 
              type="submit"
              className="w-full bg-space-blue hover:bg-space-accent transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Track ISS"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="coordinates">
          <form onSubmit={handleCoordinatesSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Latitude (-90° to 90°)</label>
              <Input
                type="text"
                placeholder="e.g., 52.5200"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="bg-space-purple/50 border-space-blue/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Longitude (-180° to 180°)</label>
              <Input
                type="text"
                placeholder="e.g., 13.4050"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="bg-space-purple/50 border-space-blue/30 text-white"
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-space-blue hover:bg-space-accent transition-colors"
            >
              Track ISS
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationInput;