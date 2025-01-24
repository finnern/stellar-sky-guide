interface GeocodingResult {
  lat: number;
  lon: number;
  error?: string;
}

const BERLIN_COORDS = {
  lat: 52.5200,
  lon: 13.4050,
};

export const getDefaultLocation = () => BERLIN_COORDS;

export const geocodeLocation = async (location: string): Promise<GeocodingResult> => {
  try {
    // For now, return default Berlin coordinates since we don't have a valid API key
    // In a production environment, you would use a proper geocoding service
    console.log(`Geocoding request for location: ${location}`);
    return {
      ...BERLIN_COORDS,
      error: "Using default location (Berlin, Germany) - Geocoding service not configured."
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      ...BERLIN_COORDS,
      error: "Error fetching location. Using default location (Berlin, Germany)."
    };
  }
};