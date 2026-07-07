import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart, ReferenceLine, Legend,
} from 'recharts';
import {
  CloudRain, Droplets, Activity, FlaskConical, TrendingDown, Wallet, MapPin,
  ArrowRight, Sparkles, Check, Bug, Megaphone, Pill,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/components/ui';
import {
  INTERVENTIONS, runSimulation, chartData,
  type InterventionId, type InterventionDef,
} from '@/lib/simulator';

const ICONS = { Bug, Megaphone, Pill } as const;

const INR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
};

export default function Simulator() {
  const [rainfall, setRainfall] = useState(45);
  const [humidity, setHumidity] = useState(72);
  const [existing, setExisting] = useState(18);
  const [active, setActive] = useState<Set<InterventionId>>(new Set(['mosquito', 'awareness']));

  const toggle = (id: InterventionId) => {
    setActive(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const impact = useMemo(() => runSimulation({
    rainfallMm: rainfall, humidityPct: humidity, existingCases: existing, active: Array.from(active),
  }), [rainfall, humidity, existing, active]);

  const data = useMemo(() => chartData(impact), [impact]);
  const peakDeltaDay = data.reduce((max, p) => p.delta > data[max].delta ? data.indexOf(p) : max, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Counterfactual Engine"
        title="Outbreak Simulator"
        description="Run what-if scenarios before committing resources. Compare outbreak trajectories with and without interventions — every projection is explainable."
        action={
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100">
            <FlaskConical className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-semibold text-brand-700">
              {active.size} intervention{active.size === 1 ? '' : 's'} active
            </span>
          </div>
        }
      />

      {/* Inputs row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <EnvCard
          icon={<CloudRain className="w-4 h-4" />}
          label="Rainfall (last 7d)"
          unit="mm"
          value={rainfall} min={0} max={150} step={1} onChange={setRainfall}
          hint="Higher rainfall boosts vector breeding and water contamination."
        />
        <EnvCard
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          unit="%"
          value={humidity} min={20} max={100} step={1} onChange={setHumidity}
          hint="Higher humidity extends vector survival and outdoor exposure."
        />
        <EnvCard
          icon={<Activity className="w-4 h-4" />}
          label="Existing cases"
          unit="cases"
          value={existing} min={0} max={100} step={1} onChange={setExisting}
          hint="Current week reported cases across the district."
        />
      </div>

      {/* Interventions */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Interventions</h2>
            <p className="text-sm text-slate-500">Toggle any combination. Effects compound independently.</p>
          </div>
          <div className="ml-auto chip bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
            <span className="font-semibold tabular-nums">−{Math.round(impact.combinedReduction * 100)}%</span> combined growth reduction
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTERVENTIONS.map(def => (
            <InterventionCard
              key={def.id} def={def} active={active.has(def.id)}
              onToggle={() => toggle(def.id)}
            />
          ))}
        </div>
      </section>

      {/* Impact cards */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Projected Impact (14 days)</h2>
            <p className="text-sm text-slate-500">If interventions are approved and deployed today.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <ImpactCard
            label="Cases Prevented"
            value={impact.casesPrevented.toLocaleString()}
            sub={`${impact.pctReduction.toFixed(1)}% reduction`}
            from={impact.noInt.totalCases}
            to={impact.withInt.totalCases}
            accent="accent"
            icon={TrendingDown}
          />
          <ImpactCard
            label="Net Cost Savings"
            value={INR(impact.netSavingsINR)}
            sub={`Gross ${INR(impact.grossSavingsINR)} − ${INR(impact.interventionCost)} campaign`}
            accent={impact.netSavingsINR >= 0 ? 'accent' : 'warn'}
            icon={Wallet}
          />
          <ImpactCard
            label="Villages Protected"
            value={impact.villagesProtected.toString()}
            sub={`${impact.villagesAffectedNoInt} affected → ${impact.villagesAffectedWithInt} contained`}
            from={impact.villagesAffectedNoInt}
            to={impact.villagesAffectedWithInt}
            accent="brand"
            icon={MapPin}
          />
        </div>
      </section>

      {/* Counterfactual chart */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="section-title">Counterfactual Projection</div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">14-day cumulative cases</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5" style={{ background: '#EF4444', borderTop: '2px dashed #EF4444' }} />
              No intervention
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-accent-500" /> With intervention
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded-sm bg-accent-100" /> Cases prevented
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80">
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false}
                label={{ value: 'days from today', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false}
                label={{ value: 'cases', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: 16 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', padding: '8px 12px' }}
                labelFormatter={(d) => `Day ${d}`}
                formatter={(v: number, name: string) => [v.toLocaleString(), name]}
                wrapperStyle={{ maxWidth: 220 }}
              />
              <Area type="monotone" dataKey="delta" stackId="savings" stroke="none" fill="url(#savings)" name="Cases prevented" isAnimationActive />
              <Line type="monotone" dataKey="noInt" stroke="#EF4444" strokeWidth={2.5} strokeDasharray="6 4" dot={false} name="No intervention" isAnimationActive />
              <Line type="monotone" dataKey="withInt" stroke="#10B981" strokeWidth={3} dot={false} name="With intervention" isAnimationActive />
              <ReferenceLine x={peakDeltaDay} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'peak gap', position: 'top', fill: '#64748b', fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day-by-day breakdown */}
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="section-title">Day-by-Day Breakdown</div>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Where do the cases get prevented?</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="chip bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">No intervention</span>
            <span className="chip bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200">With intervention</span>
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">Δ prevented</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50/60">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Day</th>
                <th className="text-right font-semibold px-4 py-3">No intervention</th>
                <th className="text-right font-semibold px-4 py-3">With intervention</th>
                <th className="text-right font-semibold px-4 py-3">Cases prevented</th>
                <th className="text-right font-semibold px-4 py-3">Reduction</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const pct = row.noInt > 0 ? (row.delta / row.noInt) * 100 : 0;
                const intensity = Math.min(100, pct * 1.4);
                return (
                  <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">Day {row.day}</td>
                    <td className="px-4 py-2.5 text-right num text-slate-700">{row.noInt.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right num text-accent-700 font-semibold">{row.withInt.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${intensity}%` }} />
                        </div>
                        <span className="font-semibold num text-slate-900 w-10 text-right">{row.delta.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right num text-slate-500">{pct.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability footer */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="section-title">How the projection is calculated</div>
            <h3 className="text-base font-semibold text-slate-900 mt-0.5">Logistic spread with environment-modulated growth</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 leading-relaxed">
          <div>
            <p className="mb-2">
              We model cumulative cases with a discrete logistic equation:
            </p>
            <code className="block px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed">
              N[t+1] = N[t] + r · N[t] · (1 − N[t] / K)
            </code>
            <p className="mt-2 text-xs text-slate-500">
              K = {impact.noInt.totalCases >= 1500 ? '1,500 (cap reached)' : '1,500 (district ceiling)'}
            </p>
          </div>
          <div>
            <p className="mb-2">
              Growth rate is scaled by environment and reduced by each active intervention:
            </p>
            <code className="block px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed">
              r = 0.18 · (1 + 0.30·{rainfall}/50 + 0.20·{humidity}/100) · (1 − {impact.combinedReduction.toFixed(2)})
            </code>
            <p className="mt-2 text-xs text-slate-500">
              Cost model: ₹3,200 per moderate case · +₹{INR(impact.interventionCost).replace('₹', '')} campaign cost
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Pieces ----------

function EnvCard({
  icon, label, value, min, max, step, unit, onChange, hint,
}: {
  icon: React.ReactNode; label: string; value: number;
  min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <span className="text-slate-400">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600"
      />
      {hint && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{hint}</p>}
    </div>
  );
}

function InterventionCard({ def, active, onToggle }: {
  def: InterventionDef; active: boolean; onToggle: () => void;
}) {
  const Icon = ICONS[def.iconName];
  const ring = {
    brand: 'border-brand-500 ring-1 ring-brand-200',
    accent: 'border-accent-500 ring-1 ring-accent-200',
    warn: 'border-amber-500 ring-1 ring-amber-200',
  }[def.color];
  const pillBg = {
    brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
    accent: 'bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200',
    warn: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  }[def.color];
  const iconBg = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    warn: 'bg-amber-50 text-amber-600',
  }[def.color];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={clsx(
        'text-left p-4 rounded-2xl border-2 transition-all duration-200 relative group focus-ring',
        active ? `${ring} bg-white shadow-md` : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      )}
    >
      {/* Active check */}
      <div className={clsx(
        'absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all',
        active ? 'bg-accent-500 text-white scale-100' : 'bg-slate-100 text-transparent scale-90',
      )}>
        <Check className="w-3 h-3" strokeWidth={3} />
      </div>

      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', iconBg)}>
        <Icon className="w-5 h-5" strokeWidth={2.2} />
      </div>

      <div className="font-semibold text-slate-900 mb-0.5 pr-6">{def.title}</div>
      <div className="text-xs text-slate-500 mb-3 leading-relaxed">{def.short}</div>

      <p className="text-xs text-slate-600 leading-relaxed mb-3">{def.mechanism}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={clsx('chip', pillBg)}>
          <ArrowRight className="w-3 h-3" />
          −{Math.round(def.reduction * 100)}% growth
        </span>
        <span className="chip bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
          {INR(def.costINR)} · 14d
        </span>
      </div>

      {/* Switch visual */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          {active ? 'Activated' : 'Inactive'}
        </span>
        <div className={clsx(
          'w-9 h-5 rounded-full p-0.5 transition-colors',
          active ? 'bg-accent-500' : 'bg-slate-300',
        )}>
          <div className={clsx(
            'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
            active ? 'translate-x-4' : 'translate-x-0',
          )} />
        </div>
      </div>
    </button>
  );
}

function ImpactCard({
  label, value, sub, from, to, accent, icon: Icon,
}: {
  label: string; value: string; sub: string;
  from?: number; to?: number;
  accent: 'brand' | 'accent' | 'warn';
  icon: React.ElementType;
}) {
  const cls = {
    brand:  { bg: 'bg-brand-50', text: 'text-brand-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warn:   { bg: 'bg-amber-50', text: 'text-amber-600' },
  }[accent];
  const valCls = accent === 'warn' ? 'text-amber-600' : accent === 'accent' ? 'text-accent-600' : 'text-brand-600';

  return (
    <div className="card p-5 sm:p-6 relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
          <div className={clsx('mt-2 text-3xl sm:text-4xl font-extrabold tabular-nums', valCls)}>{value}</div>
          <div className="text-xs text-slate-500 mt-1.5">{sub}</div>
        </div>
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', cls.bg)}>
          <Icon className={clsx('w-5 h-5', cls.text)} strokeWidth={2.2} />
        </div>
      </div>
      {from !== undefined && to !== undefined && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          <span className="text-slate-500">Without</span>
          <span className="font-semibold text-slate-700 tabular-nums">{from.toLocaleString()}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-500">With</span>
          <span className={clsx('font-semibold tabular-nums', valCls)}>{to.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
