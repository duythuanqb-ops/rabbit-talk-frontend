import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'orange' | 'purple';
}

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
};

export function StatCard({ title, value, icon: Icon, trend, trendType = 'neutral', color = 'emerald' }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="double-bezel group"
    >
      <div className="double-bezel-inner p-6 flex flex-col h-full relative overflow-hidden backdrop-blur-md bg-white/60 dark:bg-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.01)] border border-white/20 dark:border-slate-700/30 transition-fluid">
        {}
        <div className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-fluid duration-500",
          color === 'emerald' ? 'bg-emerald-500' :
          color === 'blue' ? 'bg-blue-500' :
          color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'
        )} />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className={cn("p-3 rounded-2xl shadow-sm transition-fluid duration-500 group-hover:scale-110", colorMap[color])}>
            <Icon size={22} strokeWidth={1.5} />
          </div>
          {trend && (
            <span className={cn(
              "text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm",
              trendType === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : 
              trendType === 'down' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div className="relative z-10 mt-auto">
          <p className="text-muted-foreground text-sm font-medium tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-1 tracking-tight">{value}</h3>
        </div>
      </div>
    </motion.div>
  );
}
