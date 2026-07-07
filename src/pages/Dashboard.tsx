import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, ShieldAlert, TrendingUp, Pill, MapPin, CloudRain, ArrowUpRight, AlertCircle,
} from 'lucide-react';
import { PageHeader, StatCard, RiskBadge, SeverityChip, StatusDot } from '@/components/ui';
import {
  computeDistrictStats, diseaseTrend, diseaseBreakdown, villageRiskLevel,
  villageOverallScore, forecastMedicines,
} from '@/lib/risk';
import { VILLAGES, ALERTS, villageById, DISEASES } from '@/data/villages';

export default function Dashboard() {
  const stats = useMemo(() => computeDistrictStats(), []);
  const trend = useMemo(() => diseaseTrend('dengue'), []); // default to dengue as featured
  const breakdown = useMemo(() => diseaseBreakdown(), []);
  const forecasts = useMemo(() => forecastMedicines(), []);

  const highRiskVillages = useMemo(() => {
    return [...VILLAGES]
      .map(v => ({ v, score: villageOverallScore(v), level: villageRiskLevel(v) }))
      .filter(x => x.level !== 'low')
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, []);

  const criticalMeds = forecasts.filter(f => f.status === 'critical' || f.status === 'warning').slice(0, 4);

  const recentAlerts = [...ALERTS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Average weather across district
  const weather = useMemo(() => {
    const temp = VILLAGES.reduce((s, v) => s + v.weather.tempC, 0) / VILLAGES.length;
    const hum  = VILLAGES.reduce((s, v) => s + v.weather.humidity, 0) / VILLAGES.length;
    const rain = VILLAGES.reduce((s, v) => s + v.weather.rainfallMm, 0) / VILLAGES.length;
    return { temp: temp.toFixed(1), hum: Math.round(hum), rain: rain.toFixed(1) };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="District Command Center"
        title="Health Intelligence Dashboard"
        description="Real-time view of outbreak risk, medicine supply, and field intelligence across Nashik district."
        action={
          <div className="flex gap-2">
            <Link to="/predict" className="btn-ghost border border-slate-200">Run prediction</Link>
            <Link to="/actions" className="btn-primary">View action center</Link>
          </div>
        }
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Population" value={(stats.totalPopulation / 100000).toFixed(2) + 'L'}
          hint={`${stats.totalVillages} villages · ${stats.totalAsha} ASHA workers`} accent="brand" icon={Users} />
        <StatCard label="High-Risk Villages" value={stats.highRiskVillages}
          hint={`${stats.mediumRiskVillages} on watchlist`} accent="danger" icon={ShieldAlert} />
        <StatCard label="Predicted 14d Cases" value={stats.predictedCases14d}
          hint={`vs ${stats.weeklyCases} this week`} accent="warn" icon={TrendingUp} />
        <StatCard label="Critical Medicines" value={stats.criticalMedicines}
          hint="shortage risk in 14 days" accent="danger" icon={Pill} />
      </div>

      {/* Trend + Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="section-title">Disease Trend</div>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Dengue — 12-week district trajectory</h2>
            </div>
            <div className="chip bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
              <TrendingUp className="w-3.5 h-3.5" /> +38% next 7d
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F7A86" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0F7A86" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="cases" stroke="#0F7A86" strokeWidth={2.5} fill="url(#grad)" isAnimationActive />
                <Area type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2.5} strokeDasharray="5 4" fill="transparent" isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-brand-600" /> Observed
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="6" className="text-accent-500" aria-hidden>
                <line x1="0" y1="3" x2="16" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
              </svg>
              Predicted
            </span>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="section-title">Disease Breakdown</div>
          <h2 className="text-lg font-semibold text-slate-900 mt-0.5">This week, all villages</h2>
          <div className="h-56 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="cases" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {breakdown.map(d => <Cell key={d.id} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            {breakdown.slice(0, 3).map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-slate-900 num">{d.cases}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-risk villages + Recent alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Top Risk Villages</div>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Prioritize ASHA visits today</h2>
            </div>
            <Link to="/heatmap" className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
              View on map <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-hidden -mx-2">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left font-semibold px-2 py-2">Village</th>
                  <th className="text-left font-semibold px-2 py-2">Block</th>
                  <th className="text-right font-semibold px-2 py-2">Population</th>
                  <th className="text-right font-semibold px-2 py-2">Risk Score</th>
                  <th className="text-right font-semibold px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {highRiskVillages.map(({ v, score, level }) => (
                  <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <StatusDot level={level} />
                        <span className="font-medium text-slate-900">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-slate-600">{v.block}</td>
                    <td className="px-2 py-3 text-right num text-slate-700">{v.population.toLocaleString()}</td>
                    <td className="px-2 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={level === 'high' ? 'bg-red-500' : 'bg-amber-500'}
                            style={{ width: `${Math.min(100, score)}%`, height: '100%' }}
                          />
                        </div>
                        <span className="font-semibold num w-7 text-right">{score}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <RiskBadge level={level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Recent Alerts</div>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Last 48 hours</h2>
            </div>
            <span className="chip bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
              <AlertCircle className="w-3.5 h-3.5" /> {ALERTS.filter(a => a.severity === 'critical').length} critical
            </span>
          </div>
          <div className="space-y-3">
            {recentAlerts.map(a => {
              const v = villageById(a.villageId);
              const disease = DISEASES[a.diseaseId];
              return (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-medium text-slate-900 text-sm">{a.title}</div>
                    <SeverityChip severity={a.severity} />
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{v?.name} · {disease.name}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600">Current: <b className="text-slate-900 tabular-nums">{a.currentCases}</b></span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-600">7d forecast: <b className="text-red-600 tabular-nums">{a.predictedCases7d}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Medicine + Weather row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Medicine Stock Overview</div>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Top shortages to resolve</h2>
            </div>
            <Link to="/medicine" className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
              Forecast <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {criticalMeds.map(f => (
              <div key={f.medicine.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{f.medicine.name}</div>
                    <div className="text-xs text-slate-500">{f.medicine.category} · stock {f.medicine.stock.toLocaleString()} {f.medicine.unit}s</div>
                  </div>
                  <span className={`chip ${
                    f.status === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' :
                    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Days at surge:</span>{' '}
                    <b className="text-slate-900 tabular-nums">{f.surgeDays}</b>
                  </div>
                  <div className="text-slate-300">·</div>
                  <div>
                    <span className="text-slate-500">Order:</span>{' '}
                    <b className="text-brand-700 tabular-nums">{f.recommendedOrder.toLocaleString()}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="section-title">District Weather</div>
          <h2 className="text-lg font-semibold text-slate-900 mt-0.5">Past 7 days · aggregate</h2>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <WeatherTile icon={<CloudRain className="w-5 h-5" />} label="Rainfall" value={`${weather.rain}mm`} accent="brand" />
            <WeatherTile icon="🌡️" label="Avg temp" value={`${weather.temp}°C`} accent="warn" />
            <WeatherTile icon="💧" label="Humidity" value={`${weather.hum}%`} accent="accent" />
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100">
            <div className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">AI Insight</div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Sustained humidity above 75% across Nashik and Niphad blocks is driving vector-borne risk. Recommend proactive fogging in <b>4 villages</b>.
            </p>
          </div>

          <Link to="/heatmap" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800">
            <MapPin className="w-4 h-4" /> View village-level weather on map →
          </Link>
        </div>
      </div>
    </div>
  );
}

function WeatherTile({ icon, label, value, accent }:
  { icon: React.ReactNode; label: string; value: string; accent: 'brand' | 'accent' | 'warn' }) {
  const cls = { brand: 'bg-brand-50 text-brand-600', accent: 'bg-accent-50 text-accent-600', warn: 'bg-amber-50 text-amber-600' }[accent];
  return (
    <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
      <div className={`w-9 h-9 rounded-lg ${cls} mx-auto mb-2 flex items-center justify-center`}>{icon}</div>
      <div className="text-lg font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
