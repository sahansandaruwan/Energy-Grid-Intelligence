export interface EnergyDataPoint {
  time: number; // unix timestamp
  demand: number;
  solar: number;
  wind: number;
  fossil: number;
  hydro: number;
  transmission: number; // cross border
  price: number;
}

export interface WeatherDataPoint {
  time: number;
  temperature: number;
  cloudcover: number;
  windspeed: number;
}

export interface GridStatus {
  currentDemand: number;
  currentSolar: number;
  currentWind: number;
  currentTransmission: number;
  currentPrice: number;
}
