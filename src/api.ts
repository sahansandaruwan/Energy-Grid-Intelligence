import { EnergyDataPoint, WeatherDataPoint } from './types';

const COUNTRY_COORDS: Record<string, { lat: number, lon: number }> = {
  de: { lat: 51.1657, lon: 10.4515 },
  fr: { lat: 46.2276, lon: 2.2137 },
  it: { lat: 41.8719, lon: 12.5674 },
  es: { lat: 40.4637, lon: -3.7492 },
  at: { lat: 47.5162, lon: 14.5501 },
  ch: { lat: 46.8182, lon: 8.2275 },
  nl: { lat: 52.1326, lon: 5.2913 },
  be: { lat: 50.5039, lon: 4.4699 },
  dk: { lat: 56.2639, lon: 9.5018 },
  se: { lat: 60.1282, lon: 18.6435 },
  no: { lat: 60.4720, lon: 8.4689 },
  fi: { lat: 61.9241, lon: 25.7482 },
  pl: { lat: 51.9194, lon: 19.1451 },
};

export async function fetchGridData(country: string = 'de') {
  // Try to fetch public power (generation mix and load)
  let powerData;
  try {
    const powerRes = await fetch(`https://api.energy-charts.info/public_power?country=${country}`);
    if (!powerRes.ok) throw new Error('Failed');
    powerData = await powerRes.json();
  } catch (err) {
    console.warn("Direct fetch failed (likely CORS on GH Pages), generating mock data");
    return generateMockData();
  }

  // Fetch prices
  let priceData: any = { unix_seconds: [], price: [] };
  try {
    const priceRes = await fetch(`https://api.energy-charts.info/price?country=${country}`);
    if (priceRes.ok) {
      priceData = await priceRes.json();
    }
  } catch (err) {
    console.warn("Price fetch failed");
  }

  const times: number[] = powerData.unix_seconds || [];
  const types = powerData.production_types || [];
  
  const getSeriesValues = (names: string[]) => {
    let sum = new Array(times.length).fill(0);
    names.forEach(name => {
      const data = types.find((t: any) => t.name === name)?.data;
      if (data) {
         for (let i = 0; i < sum.length; i++) {
           sum[i] += (data[i] || 0);
         }
      }
    });
    return sum;
  };

  const load = getSeriesValues(['Load', 'Load (incl. self-consumption)']);
  const solar = getSeriesValues(['Solar']);
  const wind = getSeriesValues(['Wind onshore', 'Wind offshore']);
  const fossil = getSeriesValues(['Nuclear', 'Fossil brown coal / lignite', 'Fossil hard coal', 'Fossil oil', 'Fossil gas', 'Fossil coal-derived gas', 'Waste']);
  const hydro = getSeriesValues(['Hydro water reservoir', 'Hydro pumped storage', 'Hydro Run-of-River']);
  const transmission = getSeriesValues(['Cross border electricity trading']);

  const combined: EnergyDataPoint[] = [];

  // energy-charts gives data in 15m intervals usually
  for (let i = 0; i < times.length; i++) {
    const time = times[i] * 1000; // ms
    
    // Find closest price (price is usually hourly)
    const priceIdx = priceData.unix_seconds && priceData.unix_seconds.length > 0
      ? priceData.unix_seconds.findIndex((t: number) => Math.abs((t * 1000) - time) < 3600000)
      : -1;
    const price = priceIdx !== -1 && priceData.price ? priceData.price[priceIdx] : 0;

    combined.push({
      time,
      demand: load[i] || 0,
      solar: solar[i] || 0,
      wind: wind[i] || 0,
      fossil: fossil[i] || 0,
      hydro: hydro[i] || 0,
      transmission: transmission[i] || 0,
      price: price || 0
    });
  }

  // Filter out future data that has no load yet (if any)
  const validData = combined.filter(d => d.demand > 0);
  
  return validData;
}

export async function fetchWeatherData(country: string = 'de') {
  const coords = COUNTRY_COORDS[country.toLowerCase()] || COUNTRY_COORDS['de'];
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,cloudcover,windspeed_10m&current=temperature_2m,cloudcover,windspeed_10m&timezone=Europe%2FBerlin`);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
  const data = await res.json();
  
  const times = data.hourly.time;
  const clouds = data.hourly.cloudcover;
  const winds = data.hourly.windspeed_10m;
  const temps = data.hourly.temperature_2m;

  const hourly: WeatherDataPoint[] = times.map((t: string, i: number) => ({
    time: new Date(t).getTime(),
    temperature: temps[i],
    cloudcover: clouds[i],
    windspeed: winds[i]
  }));

  return {
    current: {
      temperature: data.current.temperature_2m,
      cloudcover: data.current.cloudcover,
      windspeed: data.current.windspeed_10m,
      time: new Date(data.current.time).getTime()
    },
    hourly
  };
}

function generateMockData(): EnergyDataPoint[] {
  const data: EnergyDataPoint[] = [];
  const now = new Date();
  // Generate past 24 hours of data in 15 minute intervals
  for (let i = 96; i >= 0; i--) {
    const time = now.getTime() - i * 15 * 60 * 1000;
    const hour = new Date(time).getHours();
    
    // Day night cycle for solar
    const solarFactor = hour >= 6 && hour <= 20 ? Math.sin((hour - 6) / 14 * Math.PI) : 0;
    
    // Base demand curve (higher in evening and morning)
    const demandFactor = 1 + 0.2 * Math.sin((hour - 6) / 24 * Math.PI * 2) + 0.1 * Math.sin((hour - 18) / 24 * Math.PI * 2);
    
    const demand = 45000 * demandFactor;
    const solar = 15000 * solarFactor + Math.random() * 2000;
    const wind = 10000 + Math.random() * 8000;
    const hydro = 3000 + Math.random() * 1000;
    const fossil = Math.max(0, demand - solar - wind - hydro - 2000);
    const transmission = demand - (solar + wind + hydro + fossil);
    
    const price = 50 + (fossil / demand) * 100 + Math.random() * 20;

    data.push({
      time,
      demand,
      solar,
      wind,
      fossil,
      hydro,
      transmission,
      price
    });
  }
  return data;
}
