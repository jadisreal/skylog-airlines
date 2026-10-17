export interface HubWeather {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  wind: number;
  condition: string;
}

// WMO weather interpretation codes (Open-Meteo docs).
const WMO: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Dense freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain",
  71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
};

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather service error (${res.status})`);
  return res.json();
}

export async function getHubWeather(city: string): Promise<HubWeather> {
  const geo = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const place = geo.results?.[0];
  if (!place) throw new Error(`City "${city}" not found`);

  const fc = await getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
  );
  const c = fc.current;
  return {
    city: place.name,
    country: place.country ?? "",
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    condition: WMO[c.weather_code] ?? `Unknown (${c.weather_code})`,
  };
}
