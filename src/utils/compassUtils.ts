/**
 * Calculates the bearing between two points on Earth
 * @returns Bearing in degrees (0° = North, 90° = East, etc.)
 */
export const calculateBearing = (
  userLat: number,
  userLon: number,
  issLat: number,
  issLon: number
): number => {
  // Convert to radians
  const lat1 = userLat * Math.PI / 180;
  const lat2 = issLat * Math.PI / 180;
  const dLon = (issLon - userLon) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
           Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return bearing;
};

/**
 * Converts bearing to cardinal direction
 */
export const getCardinalDirection = (bearing: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};