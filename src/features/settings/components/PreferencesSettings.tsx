import { Save } from 'lucide-react';

export function PreferencesSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
        <p className="text-sm text-slate-500 mt-1">Customize your RibbitTalk experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>English (US)</option>
            <option>Vietnamese</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Timezone</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>(GMT+07:00) Indochina Time</option>
            <option>(GMT-05:00) Eastern Time</option>
            <option>(GMT+00:00) UTC</option>
            <option>(GMT+09:00) Japan Standard Time</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-medium text-slate-900 mb-4">Theme</h3>
        <div className="flex gap-4">
          <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center gap-3 transition-all relative">
            <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"></div>
            <div className="w-full max-w-[120px] h-20 bg-white rounded border border-slate-200 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-100 w-full border-b border-slate-200"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-50 border-r border-slate-200"></div>
                <div className="flex-1 bg-white p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-emerald-700">Light Mode</span>
          </button>
          
          <button className="flex-1 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center gap-3 transition-all relative">
            <div className="w-full max-w-[120px] h-20 bg-slate-900 rounded border border-slate-800 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-950 w-full border-b border-slate-800"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-950 border-r border-slate-800"></div>
                <div className="flex-1 bg-slate-900 p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-slate-600">Dark Mode</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20">
          <Save size={18} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}