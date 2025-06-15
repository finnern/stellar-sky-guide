interface GeocodingResult {
  lat: number;
  lon: number;
  error?: string;
}

const BERLIN_COORDS = {
  lat: 52.5200,
  lon: 13.4050,
};

import { geoApiArraySchema } from "@/utils/securitySchemas";

export const getDefaultLocation = () => BERLIN_COORDS;

export const geocodeLocation = async (location: string): Promise<GeocodingResult> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const rawData = await response.json();

    // Validate shape of API response
    const safeData = geoApiArraySchema.safeParse(rawData);
    if (!safeData.success || safeData.data.length === 0) {
      return {
        lat: BERLIN_COORDS.lat,
        lon: BERLIN_COORDS.lon,
        error: "Could not geocode this location."
      };
    }

    return {
      lat: parseFloat(safeData.data[0].lat),
      lon: parseFloat(safeData.data[0].lon)
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      lat: BERLIN_COORDS.lat,
      lon: BERLIN_COORDS.lon,
      error: "An error occurred while retrieving location."
    };
  }
};
