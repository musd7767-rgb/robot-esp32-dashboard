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
      headers: { 'X-AIO-Key': config.key, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      try { return JSON.parse(data[0].value); } catch (e) { return null; }
    }
    return null;
  } catch (error) { return null; }
};
export const saveAdafruitConfig = (config: AdafruitConfig) => {
  localStorage.setItem('adafruit_config', JSON.stringify(config));
};
export const getAdafruitConfig = (): AdafruitConfig => {
  const params = new URLSearchParams(window.location.search);
  const urlUser = params.get('aio_user');
  const urlKey = params.get('aio_key');
  if (urlUser && urlKey) {
    const config = { username: urlUser, key: urlKey };
    saveAdafruitConfig(config);
    const newUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    return config;
  }
  const saved = localStorage.getItem('adafruit_config');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return { username: '', key: '' }; }
  }
  return { username: '', key: '' };
};
