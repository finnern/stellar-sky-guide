interface GeocodingResult {
  lat: number;
  lon: number;
  error?: string;
}

const BERLIN_COORDS = {
  lat: 52.5200,
  lon: 13.4050,
};

export const geocodeLocation = async (location: string): Promise<GeocodingResult> => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=YOUR_OPENCAGE_API_KEY`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0].geometry;
      return {
        lat: result.lat,
        lon: result.lng,
      };
    }
    
    return {
      ...BERLIN_COORDS,
      error: "Location not found. Using default location (Berlin, Germany)."
    };
  } catch (error) {
    return {
      ...BERLIN_COORDS,
      error: "Error fetching location. Using default location (Berlin, Germany)."
    };
  }
};

export const getDefaultLocation = () => BERLIN_COORDS;