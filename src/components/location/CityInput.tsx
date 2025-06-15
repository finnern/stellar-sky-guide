import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { geocodeLocation } from '@/services/geocoding';
import { toast } from "@/hooks/use-toast";
import { cityInputSchema } from "@/utils/securitySchemas";

interface CityInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const CityInput = ({ onLocationSubmit }: CityInputProps) => {
  const [cityCountry, setCityCountry] = useState('Berlin, Germany');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Restrict input length and sanitize for allowed chars before sending
    let sanitizedInput = cityCountry.trim().replace(/[^a-zA-Z0-9\s,\-'.]/g, "");
    if (sanitizedInput.length > 100) sanitizedInput = sanitizedInput.slice(0, 100);

    // Validate city input with schema
    const validationResult = cityInputSchema.safeParse(sanitizedInput);
    if (!validationResult.success) {
      toast({
        title: "Invalid Input",
        description: validationResult.error.issues[0].message,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await geocodeLocation(sanitizedInput);

      if (result.error) {
        toast({
          title: "Location Notice",
          description: "Sorry, this location could not be found.",
        });
        return;
      }

      onLocationSubmit(result.lat, result.lon);
      toast({
        title: "Location Updated",
        description: `Location set to ${sanitizedInput}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem looking up this location.",
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
