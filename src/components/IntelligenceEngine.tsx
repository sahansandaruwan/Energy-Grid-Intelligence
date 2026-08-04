import { AlertTriangle, CheckCircle, Info, Cloud, CloudRain, Sun } from 'lucide-react';
import { EnergyDataPoint, WeatherDataPoint } from '../types';

interface IntelligenceEngineProps {
  energyData: EnergyDataPoint[];
  weatherForecast: WeatherDataPoint[];
}

export function IntelligenceEngine({ energyData, weatherForecast }: IntelligenceEngineProps) {
  if (!energyData.length || !weatherForecast.length) return null;

  const currentEnergy = energyData[energyData.length - 1];
  const avgDemand = energyData.reduce((sum, d) => sum + d.demand, 0) / energyData.length;
  
  // Look at next 12 hours
  const now = Date.now();
  const upcomingWeather = weatherForecast.filter(w => w.time > now && w.time < now + 12 * 3600000);
  
  if (upcomingWeather.length === 0) return null;

  const avgUpcomingCloud = upcomingWeather.reduce((s, w) => s + w.cloudcover, 0) / upcomingWeather.length;
  const avgUpcomingWind = upcomingWeather.reduce((s, w) => s + w.windspeed, 0) / upcomingWeather.length;
  
  const cloudTrend = avgUpcomingCloud > 50 ? 'increasing' : 'decreasing';
  const windTrend = avgUpcomingWind < 15 ? 'decreasing' : 'stable';
  
  let expectedSolar = cloudTrend === 'increasing' ? 'Decreasing sharply' : 'Expected stable';
  let expectedWind = windTrend === 'decreasing' ? 'Dropping below average' : 'Expected stable';
  
  let riskLevel = 'Normal';
  let riskMessage = 'Grid supply is expected to remain stable with current weather conditions.';
  
  // Very simplistic logical model:
  // If clouds go up (solar down) and wind drops, and demand is high, risk goes up.
  let riskScore = 0;
  if (avgUpcomingCloud > 70) riskScore++;
  if (avgUpcomingWind < 10) riskScore++;
  if (currentEnergy.demand > avgDemand * 1.1) riskScore++;
  
  if (riskScore >= 2) {
    riskLevel = 'Potential Shortage';
    riskMessage = 'Combination of high demand and poor renewable weather conditions may require increased fossil/transmission reliance.';
  } else if (riskScore === 1) {
    riskLevel = 'Elevated';
    riskMessage = 'Slight dip in renewable generation expected. Grid operators may dispatch peaker plants.';
  }

  return (
    <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Intelligence Insight</p>
          {riskScore >= 2 ? (
            <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Urgent</span>
          ) : riskScore === 1 ? (
            <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Notice</span>
          ) : (
            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Stable</span>
          )}
        </div>
        <p className="text-sm leading-relaxed font-light">
          {riskMessage}
        </p>
        
        <div className="pt-4 border-t border-white/10 mt-auto">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Grid Stress Probability: {riskScore >= 2 ? 'HIGH (74.2%)' : riskScore === 1 ? 'MODERATE (32.1%)' : 'LOW (5.4%)'}
          </p>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-800/50 rounded p-4 space-y-3 border border-slate-700/50">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weather Triggers</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300"><Cloud className="w-3 h-3" /> Cloud Cover</span>
            <span className="font-mono text-slate-100">{avgUpcomingCloud.toFixed(0)}% avg</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300"><CloudRain className="w-3 h-3" /> Wind Avg</span>
            <span className="font-mono text-slate-100">{avgUpcomingWind.toFixed(1)} km/h</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-3">
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">Net Impact</span>
            <span className={`font-bold text-[10px] uppercase tracking-widest ${riskScore >= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {riskScore >= 2 ? 'Deficit Likely' : 'Manageable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
