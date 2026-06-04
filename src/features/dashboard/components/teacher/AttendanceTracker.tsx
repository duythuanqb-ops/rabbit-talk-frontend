import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AttendanceTracker() {
  // Mock data - in real app, this would come from props/API
  const attendance = [true, true, true, false, true, false, false];
  const currentStreak = 18;

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Daily Attendance</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Keep your streak alive!</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{currentStreak}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-full aspect-square rounded-xl flex items-center justify-center transition-fluid",
              attendance[index] 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none" 
                : "bg-slate-50 dark:bg-slate-700/50 text-slate-300 dark:text-slate-500"
            )}>
              {attendance[index] ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase",
              attendance[index] ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
            )}>
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">You earned 50 XP today!</p>
        </div>
        <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Details</button>
      </div>
      </div>
    </div>
  );
}
