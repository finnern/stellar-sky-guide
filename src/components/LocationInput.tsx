import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocationInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const LocationInput = ({ onLocationSubmit }: LocationInputProps) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSubmit(lat, lon);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h2 className="text-xl font-bold text-space-blue mb-4">Enter Location</h2>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="bg-space-purple/50 border-space-blue/30 text-white"
        />
        <Input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="bg-space-purple/50 border-space-blue/30 text-white"
        />
        <Button 
          type="submit"
          className="w-full bg-space-blue hover:bg-space-accent transition-colors"
        >
          Track ISS
        </Button>
      </div>
    </form>
  );
};

export default LocationInput;