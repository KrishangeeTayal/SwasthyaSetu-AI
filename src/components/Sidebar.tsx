import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Brain, Map, Pill, Zap, ShieldCheck, Activity, FlaskConical,
} from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/predict',   label: 'Prediction', icon: Brain },
  { to: '/heatmap',   label: 'Heatmap', icon: Map },
  { to: '/medicine',  label: 'Medicine', icon: Pill },
  { to: '/simulator', label: 'Simulator', icon: FlaskConical },
  { to: '/actions',   label: 'Actions', icon: Zap },
];

export default function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">SwasthyaSetu</div>
              <div className="text-[11px] uppercase tracking-wider text-brand-600 font-semibold">AI · v0.1</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-ring',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx('w-[18px] h-[18px] shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')} strokeWidth={2} />
                  <span className="truncate">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-100 mb-1">
              <Activity className="w-3.5 h-3.5" /> Live District
            </div>
            <div className="font-bold text-base">Nashik, Maharashtra</div>
            <div className="text-xs text-brand-100 mt-1">36 villages · 6 PHCs · 1.68L population</div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-6 gap-0.5 px-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => clsx(
                'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-medium transition-colors focus-ring',
                isActive ? 'text-brand-700' : 'text-slate-500',
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                  <span className="truncate w-full text-center px-0.5">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
