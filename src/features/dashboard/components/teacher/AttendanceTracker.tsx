import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export function AttendanceTracker() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [paddingStartDays, setPaddingStartDays] = useState<number[]>([]);
  const [paddingEndDays, setPaddingEndDays] = useState<number[]>([]);

  useEffect(() => {
    dashboardService.getStudentAttendance()
      .then(res => {
        setAttendance(res.data.history || []);
        setCurrentStreak(res.data.streak || 0);
        setCurrentMonth(res.data.currentMonth || '');
        setPaddingStartDays(res.data.paddingStartDays || []);
        setPaddingEndDays(res.data.paddingEndDays || []);
      })
      .catch(console.error);
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await dashboardService.checkInStudent();
      if (res.data?.success || res.success) {
        // Refresh attendance
        const attendanceRes = await dashboardService.getStudentAttendance();
        setAttendance(attendanceRes.data.history || []);
        setCurrentStreak(attendanceRes.data.streak || 0);
        setCurrentMonth(attendanceRes.data.currentMonth || '');
        setPaddingStartDays(attendanceRes.data.paddingStartDays || []);
        setPaddingEndDays(attendanceRes.data.paddingEndDays || []);
        toast.success("Check in successful! +50 XP");
      } else {
        toast.error(res.data?.message || res.message || "Already checked in!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to check in");
    }
  };

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Daily Attendance</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {currentMonth ? `Calendar for ${currentMonth}` : 'Keep your streak alive!'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{currentStreak}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {attendance.length > 0 && paddingStartDays.map((dayNum, i) => (
          <div key={`empty-start-${i}`} className="flex flex-col items-center">
            <div className="w-full h-8 md:h-10 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400/40 bg-slate-50/50 dark:bg-slate-800/30 opacity-60 transition-fluid">
              {dayNum}
            </div>
          </div>
        ))}
        {attendance.map((day, index) => (
          <div key={day.date || index} className="flex flex-col items-center">
            <div className={cn(
              "w-full h-8 md:h-10 rounded-lg flex items-center justify-center transition-fluid text-xs font-bold relative",
              day.isPresent && day.isActiveStreak
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-none" 
                : day.isPresent && !day.isActiveStreak
                ? "bg-slate-200 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 ring-1 ring-slate-300 dark:ring-slate-600"
                : day.isToday
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 ring-1 ring-amber-400"
                : "bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}>
              {day.date.split('-')[2].replace(/^0/, '')}
              {day.isPresent && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full">
                  <CheckCircle2 size={10} className={day.isActiveStreak ? "text-emerald-500" : "text-slate-400"} />
                </div>
              )}
            </div>
          </div>
        ))}
        {attendance.length > 0 && paddingEndDays.map((dayNum, i) => (
          <div key={`empty-end-${i}`} className="flex flex-col items-center">
            <div className="w-full h-8 md:h-10 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400/40 bg-slate-50/50 dark:bg-slate-800/30 opacity-60 transition-fluid">
              {dayNum}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {attendance.find(d => d.isToday)?.isPresent ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">You checked in today!</p>
            </div>
            <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Details</button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">Claim your daily XP!</p>
            </div>
            <button 
              className="text-xs font-bold bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              onClick={handleCheckIn}
            >
              Check In
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
