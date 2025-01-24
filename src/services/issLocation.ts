interface ISSLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const getISSLocation = async (): Promise<ISSLocation> => {
  const response = await fetch('http://api.open-notify.org/iss-now.json');
  const data = await response.json();
  
  return {
    latitude: parseFloat(data.iss_position.latitude),
    longitude: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
};

export const getISSPassTimes = async (lat: number, lon: number): Promise<any> => {
  const response = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}`);
  const data = await response.json();
  return data.response[0];
};