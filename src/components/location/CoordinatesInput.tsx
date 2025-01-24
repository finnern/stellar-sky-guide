import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CoordinatesInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const CoordinatesInput = ({ onLocationSubmit }: CoordinatesInputProps) => {
  const [latitude, setLatitude] = useState('52.5200');
  const [longitude, setLongitude] = useState('13.4050');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude (-90° to 90°) and longitude (-180° to 180°) values.",
        variant: "destructive",
      });
      return;
    }

    onLocationSubmit(lat, lon);
    toast({
      title: "Location Updated",
      description: `Location set to ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};

export default CoordinatesInput;