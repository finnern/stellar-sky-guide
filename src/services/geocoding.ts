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
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};