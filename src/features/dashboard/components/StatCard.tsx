import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'orange' | 'purple';
}

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, trend, trendType = 'neutral', color = 'emerald' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
            trendType === 'down' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
