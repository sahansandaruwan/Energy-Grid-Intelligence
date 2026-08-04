import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { EnergyDataPoint } from '../types';
import { format } from 'date-fns';

interface GenerationChartProps {
  data: EnergyDataPoint[];
}

export function GenerationChart({ data }: GenerationChartProps) {
  // Use last 24 hours of data roughly (assuming 15m intervals, that's 96 points)
  const chartData = data.slice(-96);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Generation Mix & Demand (Last 24h)</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFossil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(tick) => format(new Date(tick), 'HH:mm')}
              stroke="#cbd5e1"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              stroke="#cbd5e1"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)} GW`}
              width={50}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
              itemStyle={{ color: '#0f172a', fontSize: '12px' }}
              labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}
              labelFormatter={(label) => format(new Date(label), 'MMM d, HH:mm')}
              formatter={(value: number) => [`${(value/1000).toFixed(2)} GW`, undefined]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#64748b' }} iconType="circle" />
            
            <Area type="monotone" dataKey="fossil" name="Fossil" stackId="1" stroke="#94a3b8" fill="url(#colorFossil)" />
            <Area type="monotone" dataKey="hydro" name="Hydro" stackId="1" stroke="#3b82f6" fill="url(#colorHydro)" />
            <Area type="monotone" dataKey="wind" name="Wind" stackId="1" stroke="#10b981" fill="url(#colorWind)" />
            <Area type="monotone" dataKey="solar" name="Solar" stackId="1" stroke="#f59e0b" fill="url(#colorSolar)" />
            
            {/* Demand line overlay */}
            <Area type="monotone" dataKey="demand" name="Total Demand" stroke="#0f172a" strokeWidth={2} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
