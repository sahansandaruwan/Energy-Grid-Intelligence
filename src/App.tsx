/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { fetchGridData, fetchWeatherData } from './api';
import { EnergyDataPoint, WeatherDataPoint } from './types';
import { EuropeMap } from './components/EuropeMap';

export default function App() {
  const [country, setCountry] = useState('de');
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([]);
  const [weatherData, setWeatherData] = useState<{ current: any; hourly: WeatherDataPoint[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentCountry: string) => {
    try {
      setLoading(true);
      setError(null);
      const [energy, weather] = await Promise.all([
        fetchGridData(currentCountry),
        fetchWeatherData(currentCountry)
      ]);
      setEnergyData(energy);
      setWeatherData(weather);
    } catch (err: any) {
      setError(err.message || 'Failed to load grid data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(country);
    const interval = setInterval(() => loadData(country), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [country]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
        <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-md text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-500 font-bold text-xl">!</div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">System Connection Failed</h2>
          <p className="text-slate-500 text-sm font-medium">{error}</p>
          <button onClick={() => loadData(country)} className="mt-4 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const current = energyData.length > 0 ? energyData[energyData.length - 1] : null;
  const currentW = weatherData?.current || null;

  // Calculate dynamic values
  const demand = current ? (current.demand / 1000).toFixed(1) : '0.0';
  const thermal = current ? (current.fossil / 1000).toFixed(1) : '0.0';
  const renewables = current ? ((current.solar + current.wind + current.hydro) / 1000).toFixed(1) : '0.0';
  const totalSupply = current ? ((current.fossil + current.solar + current.wind + current.hydro + current.transmission) / 1000).toFixed(1) : '0.0';

  const thermalPercent = current ? (current.fossil / (current.demand || 1)) * 100 : 0;
  const renewablePercent = current ? ((current.solar + current.wind + current.hydro) / (current.demand || 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-200 font-['Inter',sans-serif]">
      <style>{`
        .metric-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
        .grid-line { stroke: #cbd5e1; stroke-width: 1; }
        .alert-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      <div className="max-w-[1280px] mx-auto min-h-screen flex flex-col p-4 md:p-8 gap-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4 md:gap-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2">
              Energy Grid Intelligence
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>REGION:</span>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent border-b border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-slate-900 uppercase cursor-pointer py-0.5"
              >
                <option value="de">Germany (DE-HUB)</option>
                <option value="fr">France (FR)</option>
                <option value="it">Italy (IT)</option>
                <option value="es">Spain (ES)</option>
                <option value="at">Austria (AT)</option>
                <option value="ch">Switzerland (CH)</option>
                <option value="nl">Netherlands (NL)</option>
                <option value="be">Belgium (BE)</option>
                <option value="dk">Denmark (DK)</option>
                <option value="se">Sweden (SE)</option>
                <option value="no">Norway (NO)</option>
                <option value="fi">Finland (FI)</option>
                <option value="pl">Poland (PL)</option>
              </select>
              <span>&bull; LIVE FEED</span>
            </div>
          </div>
          <div className="flex gap-8 text-left md:text-right">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Status</p>
              <div className={`flex items-center gap-2 md:justify-end ${loading ? 'text-slate-400' : 'text-emerald-600'}`}>
                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-slate-400' : 'bg-emerald-500 alert-pulse'}`}></span>
                <span className="text-sm font-bold">{loading ? 'SYNCING...' : 'OPERATIONAL'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last Sync</p>
              <p className="text-sm font-mono text-slate-700">{new Date().toLocaleTimeString()} UTC</p>
            </div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT COLUMN: DEMAND & SUPPLY */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="metric-card flex-1 flex flex-col justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Demand</p>
              <div className="space-y-1 mt-2">
                <p className="text-4xl font-light text-slate-900">{demand} <span className="text-xl font-normal text-slate-400">GW</span></p>
                <p className="text-xs text-slate-500 font-medium">Real-time load</p>
              </div>
              <div className="h-24 flex items-end gap-1 mt-4">
                {/* Simulated bar chart for history, or could use real data slices */}
                {energyData.slice(-15).map((d, i) => {
                  const maxD = Math.max(...energyData.slice(-15).map(x => x.demand));
                  const h = maxD > 0 ? (d.demand / maxD) * 100 : 0;
                  return (
                    <div key={i} className={`flex-1 ${i === 14 ? 'bg-slate-900' : 'bg-slate-200'} transition-all`} style={{ height: `${h}%` }}></div>
                  );
                })}
              </div>
            </div>
            
            <div className="metric-card flex-1 flex flex-col justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Supply</p>
              <div className="space-y-1 mt-2">
                <p className="text-4xl font-light text-slate-900">{totalSupply} <span className="text-xl font-normal text-slate-400">GW</span></p>
                <p className="text-xs text-slate-500 font-medium">Including transmission</p>
              </div>
              <div className="flex flex-col gap-2 mt-4 text-[11px] font-medium">
                <div className="flex justify-between">
                  <span>Thermal (Fossil)</span>
                  <span className="text-slate-400">{thermal} GW</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full" style={{ width: `${Math.min(100, thermalPercent)}%` }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Renewables</span>
                  <span className="text-slate-400">{renewables} GW</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, renewablePercent)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: VISUALIZATION */}
          <div className="lg:col-span-6 flex flex-col min-h-[400px]">
            <EuropeMap selectedCountry={country} onSelectCountry={setCountry} />
          </div>

          {/* RIGHT COLUMN: RESOURCES & INSIGHTS */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="metric-card flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Top Resources</p>
              <div className="space-y-5 mt-2">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 text-sm">☀</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Solar Gen</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{currentW?.cloudcover > 50 ? 'Limited' : 'Optimal'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{current ? (current.solar / 1000).toFixed(1) : '0'} GW</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 text-sm">≈</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Wind Farms</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Avg {currentW?.windspeed || 0} km/h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{current ? (current.wind / 1000).toFixed(1) : '0'} GW</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 text-sm">⚡</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Fossil Assets</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Baseload</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{current ? (current.fossil / 1000).toFixed(1) : '0'} GW</p>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col justify-between h-48 shadow-md">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold tracking-widest opacity-60">INTELLIGENCE INSIGHT</p>
                {current && current.price > 100 && (
                  <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">High Price</span>
                )}
                {current && current.price <= 100 && (
                  <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Optimal</span>
                )}
              </div>
              
              <div className="mt-2">
                {currentW && currentW.windspeed > 25 ? (
                  <p className="text-sm leading-relaxed font-light">High wind speeds detected across the network. Wind generation is strong. <span className="text-emerald-400 font-bold underline">No action required.</span></p>
                ) : current && current.price > 150 ? (
                  <p className="text-sm leading-relaxed font-light">Day-ahead market prices are elevated ({current.price.toFixed(0)}€/MWh). High thermal generation. <span className="text-amber-400 font-bold underline">Consider demand reduction.</span></p>
                ) : (
                  <p className="text-sm leading-relaxed font-light">Grid frequency and generation mix are stable. Current market price is {current?.price?.toFixed(0) || 0}€/MWh. <span className="text-emerald-400 font-bold underline">Operating nominally.</span></p>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/10 mt-auto">
                <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest">RENEWABLE PENETRATION: {current ? renewablePercent.toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex justify-between items-center text-[11px] text-slate-400 font-medium mt-4">
          <div className="flex gap-6">
            <span>&copy; {new Date().getFullYear()} GridCore Systems</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live API Connected</span>
            <span>Market Price: {current ? current.price.toFixed(2) : 0} €/MWh</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Data: energy-charts.info</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Weather: Open-Meteo</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

