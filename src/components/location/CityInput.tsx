import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { geocodeLocation } from '@/services/geocoding';
import { toast } from "@/hooks/use-toast";

interface CityInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const CityInput = ({ onLocationSubmit }: CityInputProps) => {
  const [cityCountry, setCityCountry] = useState('Berlin, Germany');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast({
        title: "Location Updated",
        description: `Location set to ${cityCountry}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get location coordinates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};

export default CityInput;