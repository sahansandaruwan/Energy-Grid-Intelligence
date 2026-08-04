import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, unit, subtitle, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="text-slate-400">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-light text-slate-900">
          {value} {unit && <span className="text-xl font-normal text-slate-400">{unit}</span>}
        </p>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-2 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value} vs 24h avg
          </p>
        )}
      </div>
    </div>
  );
}
