/**
 * Adafruit IO Service
 * Handles communication with Adafruit IO API to fetch robot data.
 */

export interface RobotData {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  battery: number;
  motor_status: string;
  timestamp: string;
}

export interface AdafruitConfig {
  username: string;
  key: string;
}

const BASE_URL = 'https://io.adafruit.com/api/v2';

export const fetchRobotData = async (config: AdafruitConfig, feedKey: string): Promise<RobotData | null> => {
  if (!config.username || !config.key) return null;

  try {
    const response = await fetch(`${BASE_URL}/${config.username}/feeds/${feedKey}/data?limit=1`, {
      headers: {
        'X-AIO-Key': config.key,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Feed ${feedKey} not found on Adafruit IO`);
      }
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      try {
        // The value is stored as a JSON string in Adafruit IO
        return JSON.parse(data[0].value);
      } catch (e) {
        console.error('Failed to parse feed data as JSON:', data[0].value);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching data from Adafruit IO:', error);
    return null;
  }
};

export const saveAdafruitConfig = (config: AdafruitConfig) => {
  localStorage.setItem('adafruit_config', JSON.stringify(config));
};

export const getAdafruitConfig = (): AdafruitConfig => {
  const saved = localStorage.getItem('adafruit_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return { username: '', key: '' };
    }
  }
  return { username: '', key: '' };
};
