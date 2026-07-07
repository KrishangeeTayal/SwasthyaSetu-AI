import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Package, AlertTriangle, TrendingUp, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { forecastMedicines, type MedicineForecast } from '@/lib/risk';

const STATUS_ORDER: Record<MedicineForecast['status'], number> = {
  critical: 0, warning: 1, ok: 2, surplus: 3,
};

export default function Medicine() {
  const [filter, setFilter] = useState<'all' | MedicineForecast['status']>('all');
  const [search, setSearch] = useState('');

  const all = useMemo(() => forecastMedicines(), []);
  const filtered = useMemo(() => {
    return all
      .filter(f => filter === 'all' ? true : f.status === filter)
      .filter(f => f.medicine.name.toLowerCase().includes(search.toLowerCase()));
  }, [all, filter, search]);

  const stats = useMemo(() => ({
    total: all.length,
    critical: all.filter(f => f.status === 'critical').length,
    warning: all.filter(f => f.status === 'warning').length,
    ok: all.filter(f => f.status === 'ok').length,
    surplus: all.filter(f => f.status === 'surplus').length,
    totalReorderValue: all
      .filter(f => f.status === 'critical' || f.status === 'warning')
      .reduce((s, f) => s + f.recommendedOrder * f.medicine.unitCostINR, 0),
  }), [all]);

  // Bar chart: baseline days vs surge days
  const chartData = useMemo(() => {
    return all
      .filter(f => f.status !== 'surplus')
      .sort((a, b) => a.surgeDays - b.surgeDays)
      .slice(0, 10)
      .map(f => ({
        name: f.medicine.name.replace(/ (500mg|400mg|10mg|20mg|1g Inj|5g|100mcg MDI|21g|80mg\/480mg)/g, ''),
        baseline: Math.round(f.baselineDays),
        surge: Math.round(f.surgeDays),
        status: f.status,
      }));
  }, [all]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Supply Intelligence"
        title="Medicine Demand Forecasting"
        description="Predicting medicine shortages 14 days ahead using outbreak forecasts and consumption baselines."
        action={
          <button className="btn-primary">
            <Package className="w-4 h-4" /> Generate State Requisition
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="Total SKUs" value={stats.total} accent="brand" icon={Package} />
        <KPI label="Critical" value={stats.critical} accent="danger" icon={AlertTriangle} />
        <KPI label="Warning" value={stats.warning} accent="warn" icon={TrendingUp} />
        <KPI label="Healthy" value={stats.ok} accent="accent" icon={CheckCircle2} />
        <KPI label="Reorder value" value={`₹${(stats.totalReorderValue / 1000).toFixed(1)}k`} hint="next 14 days" accent="brand" icon={Package} />
      </div>

      {/* Chart */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="section-title">Days-of-Stock Projection</div>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Baseline vs worst-case surge scenario</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-slate-400" /> Baseline</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-400" /> Under surge</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} label={{ value: 'days', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: 16 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} isAnimationActive />
              <Bar dataKey="surge" radius={[4, 4, 0, 0]} isAnimationActive>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.status === 'critical' ? '#EF4444' : d.status === 'warning' ? '#F59E0B' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div>
            <div className="section-title">District Warehouse Inventory</div>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">{filtered.length} of {all.length} medicines</h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
            <div className="flex gap-1.5 items-center pl-2 border-l border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {(['all', 'critical', 'warning', 'ok', 'surplus'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize border transition focus-ring ${
                    filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50/60">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Medicine</th>
                <th className="text-right font-semibold px-4 py-3">Stock</th>
                <th className="text-right font-semibold px-4 py-3">Daily use</th>
                <th className="text-right font-semibold px-4 py-3">Days @ base</th>
                <th className="text-right font-semibold px-4 py-3">Days @ surge</th>
                <th className="text-right font-semibold px-4 py-3">14d demand</th>
                <th className="text-right font-semibold px-4 py-3">Reorder</th>
                <th className="text-center font-semibold px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
                .map(f => {
                  const stockPct = Math.min(100, (f.medicine.stock / (f.medicine.minStock * 2)) * 100);
                  return (
                    <tr key={f.medicine.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900">{f.medicine.name}</div>
                        <div className="text-xs text-slate-500">{f.medicine.category} · ₹{f.medicine.unitCostINR}/{f.medicine.unit}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="font-semibold num text-slate-900">{f.medicine.stock.toLocaleString()}</div>
                        <div className="mt-1 w-16 ml-auto h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${stockPct}%`,
                              background: stockPct < 30 ? '#EF4444' : stockPct < 60 ? '#F59E0B' : '#10B981',
                            }} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right num text-slate-700">{f.medicine.dailyConsumption}</td>
                      <td className="px-4 py-3.5 text-right num text-slate-700 font-medium">{f.baselineDays}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`num font-semibold ${
                          f.surgeDays < 7 ? 'text-red-600' : f.surgeDays < 14 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{f.surgeDays}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right num text-slate-700">{f.expectedDemand14d.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-semibold num text-brand-700">{f.recommendedOrder.toLocaleString()}</span>
                        <div className="text-[10px] text-slate-400">{f.medicine.unit}s</div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`chip ${
                          f.status === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' :
                          f.status === 'warning' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200' :
                          f.status === 'surplus' ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200' :
                          'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reasons / Insights */}
      <div className="card p-5 sm:p-6">
        <div className="section-title mb-3">Why these forecasts?</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Causal drivers behind the top critical medicines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {all.filter(f => f.status === 'critical' || f.status === 'warning').slice(0, 4).map(f => (
            <div key={f.medicine.id} className="p-4 rounded-xl border border-slate-100 hover:border-brand-200 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-slate-900">{f.medicine.name}</div>
                <ArrowRight className="w-4 h-4 text-brand-500" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{f.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, hint, accent, icon: Icon }: {
  label: string; value: React.ReactNode; hint?: string;
  accent: 'brand' | 'accent' | 'warn' | 'danger';
  icon: React.ElementType;
}) {
  const styles = {
    brand:  { bg: 'bg-brand-50', text: 'text-brand-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warn:   { bg: 'bg-amber-50', text: 'text-amber-600' },
    danger: { bg: 'bg-red-50', text: 'text-red-600' },
  }[accent];
  return (
    <div className="stat-tile">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.bg}`}>
          <Icon className={`w-4 h-4 ${styles.text}`} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
