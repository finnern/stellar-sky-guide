import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CityInput from './location/CityInput';
import CoordinatesInput from './location/CoordinatesInput';

interface LocationInputProps {
  onLocationSubmit: (lat: number, lon: number) => void;
}

const LocationInput = ({ onLocationSubmit }: LocationInputProps) => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-space-blue mb-4">Enter Location</h2>
      <Tabs defaultValue="city" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="city">City, Country</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="city">
          <CityInput onLocationSubmit={onLocationSubmit} />
        </TabsContent>

        <TabsContent value="coordinates">
          <CoordinatesInput onLocationSubmit={onLocationSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationInput;