import { Search, Bell, Sparkles, ChevronDown } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search villages, medicines, alerts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition"
          />
        </label>
      </div>

      {/* District switcher (visual only) */}
      <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-sm focus-ring">
        <div className="w-6 h-6 rounded-md bg-accent-100 text-accent-700 flex items-center justify-center text-[10px] font-bold">NSK</div>
        <span className="font-medium text-slate-700">Nashik District</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {/* Hackathon badge */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100">
        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
        <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">Demo Mode</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl hover:bg-slate-50 transition focus-ring" aria-label="Notifications">
        <Bell className="w-5 h-5 text-slate-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
      </button>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-slate-900 leading-tight">Dr. A. Deshmukh</div>
          <div className="text-[11px] text-slate-500">District Health Officer</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}
