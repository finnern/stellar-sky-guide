interface ISSLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const getISSLocation = async (): Promise<ISSLocation> => {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  const data = await response.json();
  
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timestamp: data.timestamp,
  };
};

export const getISSPassTimes = async (lat: number, lon: number): Promise<any> => {
  const response = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}`);
  const data = await response.json();
  return data.response[0];
};
