import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, MessageCircle, Loader2 } from 'lucide-react';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { StaggerContainer, StaggerItem } from '@/shared/components/animations/StaggerContainer';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface AlertRecord {
  id: string;
  studentName: string;
  type: string;
  reason: string;
  avatarUrl?: string;
}

export function NeedsAttention() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getTeacherAlerts()
      .then((res) => setAlerts((res as { data?: AlertRecord[] }).data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner bg-surface p-6 hover:shadow-lg transition-fluid">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 ring-1 ring-rose-500/20">
              <AlertTriangle size={18} strokeWidth={2} />
            </div>
            Needs Attention
          </h3>
          <span className="flex items-center justify-center bg-rose-500 text-white text-xs font-bold w-6 h-6 rounded-full shadow-sm">
            {alerts.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-rose-500" size={24} /></div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">All students are doing great!</div>
        ) : (
          <StaggerContainer className="space-y-4">
            {alerts.map((alert) => (
              <StaggerItem key={alert.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-surface-hover/50 hover:bg-surface hover:border-rose-500/30 transition-all hover:shadow-md cursor-pointer">
                  {alert.avatarUrl ? (
                    <Image unoptimized src={alert.avatarUrl} alt={alert.studentName} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-border shadow-sm shrink-0 group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                      {alert.studentName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="truncate">
                        <h4 className="font-bold text-foreground text-sm truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{alert.studentName}</h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{alert.type === 'low_score' ? 'Low Exam Score' : 'Missed Class'}</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 bg-surface-hover text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-border/50 shadow-sm shrink-0" 
                        title="Message Student"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:?subject=Checking in&body=Hi ${alert.studentName}, I noticed that you...`;
                        }}
                      >
                        <MessageCircle size={16} />
                      </motion.button>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 w-fit px-2.5 py-1 rounded-lg">
                      <TrendingDown size={14} />
                      <span className="truncate">{alert.reason}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
