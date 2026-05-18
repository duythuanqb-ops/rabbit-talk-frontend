import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AttendanceTracker() {
  // Mock data - in real app, this would come from props/API
  const attendance = [true, true, true, false, true, false, false];
  const currentStreak = 18;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Daily Attendance</h3>
          <p className="text-slate-500 text-sm">Keep your streak alive!</p>
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
              "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300",
              attendance[index] 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                : "bg-slate-50 text-slate-300"
            )}>
              {attendance[index] ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase",
              attendance[index] ? "text-emerald-600" : "text-slate-400"
            )}>
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-emerald-800 text-sm font-medium">You earned 50 XP today!</p>
        </div>
        <button className="text-xs font-bold text-emerald-600 hover:underline">Details</button>
      </div>
    </div>
  );
}
