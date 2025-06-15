interface ISSLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
}

import { issApiSchema } from "@/utils/securitySchemas";

export const getISSLocation = async (): Promise<ISSLocation> => {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  const rawData = await response.json();

  // Validate with Zod
  const result = issApiSchema.safeParse(rawData);
  if (!result.success) {
    // Fall back to Berlin with zeroes for safety
    return {
      latitude: 52.52,
      longitude: 13.405,
      altitude: 0,
      velocity: 0,
      visibility: "unknown",
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  return result.data;
};

// Calculate next pass time based on current ISS position and user location
export const calculateNextPass = (
  issLat: number,
  issLon: number,
  userLat: number,
  userLon: number
): Date => {
  // Simple estimation - this could be improved with more sophisticated calculations
  const R = 6371; // Earth's radius in km
  const lat1 = issLat * Math.PI / 180;
  const lat2 = userLat * Math.PI / 180;
  const deltaLat = (userLat - issLat) * Math.PI / 180;
  const deltaLon = (userLon - issLon) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // ISS orbits Earth every ~90 minutes (5400 seconds)
  // Estimate next pass based on current distance
  const estimatedSeconds = (distance / 27576) * 5400; // Using average velocity
  const nextPass = new Date();
  nextPass.setSeconds(nextPass.getSeconds() + estimatedSeconds);

  return nextPass;
};
