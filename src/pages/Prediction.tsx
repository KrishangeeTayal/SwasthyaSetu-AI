import { useMemo, useState } from 'react';
import { Thermometer, Droplets, CloudRain, Activity, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { PageHeader, RiskBadge } from '@/components/ui';
import { computeRisk, type RiskResult, type RiskFactor } from '@/lib/risk';
import { DISEASES, DISEASE_LIST, VILLAGES, type DiseaseId, type Village } from '@/data/villages';

export default function Prediction() {
  const [villageId, setVillageId] = useState<string>('v01');
  const [diseaseId, setDiseaseId] = useState<DiseaseId>('dengue');

  // Live-adjustable inputs — default to the selected village's current weather.
  const village = VILLAGES.find(v => v.id === villageId)!;
  const [tempC, setTempC] = useState<number>(village.weather.tempC);
  const [humidity, setHumidity] = useState<number>(village.weather.humidity);
  const [rainfallMm, setRainfallMm] = useState<number>(village.weather.rainfallMm);
  const [previousCases, setPreviousCases] = useState<number>(village.weeklyCases[diseaseId]);

  // When village/disease changes, snap inputs to that context.
  const onVillageChange = (id: string) => {
    setVillageId(id);
    const v = VILLAGES.find(x => x.id === id)!;
    setTempC(v.weather.tempC);
    setHumidity(v.weather.humidity);
    setRainfallMm(v.weather.rainfallMm);
    setPreviousCases(v.weeklyCases[diseaseId]);
  };
  const onDiseaseChange = (id: DiseaseId) => {
    setDiseaseId(id);
    const v = VILLAGES.find(x => x.id === villageId)!;
    setPreviousCases(v.weeklyCases[id]);
  };

  const result = useMemo<RiskResult>(() => {
    // Build an ad-hoc Village with overridden weather + a synthetic history
    // where the last bar equals `previousCases` and prior bars are 60% of that.
    const synthetic: Village = {
      ...village,
      weather: { tempC, humidity, rainfallMm },
      history: {
        ...village.history,
        [diseaseId]: [...village.history[diseaseId].slice(0, -1), previousCases],
      },
      weeklyCases: {
        ...village.weeklyCases,
        [diseaseId]: previousCases,
      },
    };
    return computeRisk(synthetic, diseaseId);
  }, [village, diseaseId, tempC, humidity, rainfallMm, previousCases]);

  const disease = DISEASES[diseaseId];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Predictive Engine"
        title="Disease Risk Prediction"
        description="Adjust the inputs to model how weather and case history compound into outbreak risk. The model runs in your browser in real time."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* INPUTS */}
        <div className="lg:col-span-2 card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Model Inputs</h2>
          </div>

          <Field label="Village" hint="Auto-fills weather + case history">
            <select value={villageId} onChange={e => onVillageChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400">
              {VILLAGES.map(v => (
                <option key={v.id} value={v.id}>{v.name} · {v.block}</option>
              ))}
            </select>
          </Field>

          <Field label="Disease">
            <div className="grid grid-cols-1 gap-2">
              {DISEASE_LIST.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDiseaseChange(d.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition ${
                    diseaseId === d.id
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xl">{d.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.category}</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                </button>
              ))}
            </div>
          </Field>

          <Slider
            label="Temperature" icon={<Thermometer className="w-4 h-4" />}
            unit="°C"
            value={tempC} min={5} max={45} step={0.5}
            onChange={setTempC}
            hint={`Optimal for ${disease.name}: ${disease.optimalTemp[0]}–${disease.optimalTemp[1]}°C`}
          />
          <Slider
            label="Humidity" icon={<Droplets className="w-4 h-4" />}
            unit="%"
            value={humidity} min={20} max={100} step={1}
            onChange={setHumidity}
            hint={`Optimal: ${disease.optimalHumidity[0]}–${disease.optimalHumidity[1]}%`}
          />
          <Slider
            label="Rainfall (7d)" icon={<CloudRain className="w-4 h-4" />}
            unit="mm"
            value={rainfallMm} min={0} max={120} step={0.5}
            onChange={setRainfallMm}
            hint={`Higher rainfall compounds ${disease.category.toLowerCase()} risk`}
          />
          <Slider
            label="Previous cases (this week)" icon={<Activity className="w-4 h-4" />}
            unit="cases"
            value={previousCases} min={0} max={50} step={1}
            onChange={setPreviousCases}
            hint="Last week's reported cases from ASHA + PHC"
          />
        </div>

        {/* OUTPUT */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-600" />
                <div className="section-title">Predicted Output</div>
              </div>
              <span className="chip bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-slow" /> live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              <RiskGauge score={result.score} level={result.level} />
              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                <KPI label="7-day forecast" value={result.predictedCases7d} hint="cases" accent="brand" />
                <KPI label="14-day forecast" value={result.predictedCases14d} hint="cases" accent="warn" />
                <KPI label="Current weekly" value={result.currentWeeklyCases} hint="reported" accent="brand" />
                <KPI label="Disease" value={disease.name} hint={disease.category} accent="accent" />
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-brand-50 via-white to-accent-50 border border-brand-100">
              <div className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Explanation
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="section-title">Causal Signal Breakdown</div>
            <h3 className="text-lg font-semibold text-slate-900 mt-0.5 mb-4">Why this score? Top contributing factors</h3>
            <div className="space-y-3">
              {result.factors.map(f => (
                <FactorBar key={f.label} f={f} />
              ))}
            </div>
          </div>

          <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-700 to-brand-800 border-0 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-100 mb-1">Recommended Next Action</div>
                <div className="text-lg font-semibold mb-1.5">
                  {result.level === 'high'
                    ? `Pre-position medicines and broadcast advisory in ${village.name}`
                    : result.level === 'medium'
                      ? `Increase ASHA surveillance in ${village.name}`
                      : `Maintain routine monitoring for ${village.name}`}
                </div>
                <p className="text-sm text-brand-100 leading-relaxed">
                  {result.level === 'high'
                    ? `Forecast ${result.predictedCases14d} cases in 14 days. Stock ${disease.medicines.join(', ')} at PHC and request state buffer.`
                    : result.level === 'medium'
                      ? `Watchlist for next 7 days. ASHA to report new symptomatic cases via weekly sync.`
                      : `No active concern. Continue standard surveillance cadence.`}
                </p>
                <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-100">
                  Open in Action Center <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Pieces ----------

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({ label, icon, value, min, max, step, unit, onChange, hint }: {
  label: string; icon: React.ReactNode; value: number; min: number; max: number;
  step: number; unit: string; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <span className="text-slate-400">{icon}</span>{label}
        </label>
        <span className="text-sm font-semibold text-brand-700 tabular-nums">
          {value}{unit === 'cases' ? '' : unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600"
      />
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function RiskGauge({ score, level }: { score: number; level: 'low' | 'medium' | 'high' }) {
  const color = level === 'high' ? '#EF4444' : level === 'medium' ? '#F59E0B' : '#10B981';
  const label = level.toUpperCase();
  const bgFill = level === 'high' ? 'bg-red-50' : level === 'medium' ? 'bg-amber-50' : 'bg-emerald-50';
  const text = level === 'high' ? 'text-red-700' : level === 'medium' ? 'text-amber-700' : 'text-emerald-700';

  // SVG arc 270°
  const radius = 80, stroke = 14, circ = 2 * Math.PI * radius * 0.75;
  const offset = circ - (Math.min(100, score) / 100) * circ;

  return (
    <div className={`rounded-2xl p-5 sm:p-6 ${bgFill} flex flex-col items-center justify-center`}>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-[135deg]">
          <circle cx="100" cy="100" r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="none"
            strokeDasharray={`${circ} ${2 * Math.PI * radius}`} strokeLinecap="round" />
          <circle cx="100" cy="100" r={radius} stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${circ} ${2 * Math.PI * radius}`}
            strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div className="relative text-center">
          <div className={`text-5xl font-extrabold tabular-nums ${text}`}>{score}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">/ 100</div>
        </div>
      </div>
      <div className="mt-4">
        <RiskBadge level={level} className="text-sm px-3 py-1.5" />
      </div>
      <div className="text-xs text-slate-500 mt-2 font-medium">{label} RISK</div>
    </div>
  );
}

function KPI({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent: 'brand' | 'accent' | 'warn' }) {
  const cls = { brand: 'border-brand-100 bg-brand-50/50', accent: 'border-accent-100 bg-accent-50/50', warn: 'border-amber-100 bg-amber-50/50' }[accent];
  return (
    <div className={`p-4 rounded-xl border ${cls}`}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function FactorBar({ f }: { f: RiskFactor }) {
  const pct = Math.round(f.contribution * 100);
  const color = pct > 30 ? '#EF4444' : pct > 18 ? '#F59E0B' : '#10B981';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-sm font-medium text-slate-700">{f.label}</div>
        <div className="text-sm font-semibold tabular-nums" style={{ color }}>{pct}%</div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-xs text-slate-500 mt-1">{f.note}</div>
    </div>
  );
}
