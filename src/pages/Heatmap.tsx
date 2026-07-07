import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Users, AlertCircle, Pill, Thermometer, Droplets, CloudRain, Activity, MapPin } from 'lucide-react';
import { PageHeader, RiskBadge, StatusDot, SeverityChip } from '@/components/ui';
import {
  villageRiskLevel, villageOverallScore, computeRisk, forecastMedicines,
} from '@/lib/risk';
import { VILLAGES, ALERTS, DISEASES, villageById, type Village, type DiseaseId, type RiskLevel } from '@/data/villages';

const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

export default function Heatmap() {
  const [selectedId, setSelectedId] = useState<string>('v01');
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');

  const visibleVillages = useMemo(
    () => VILLAGES.filter(v => filter === 'all' ? true : villageRiskLevel(v) === filter),
    [filter],
  );

  const selected = villageById(selectedId)!;

  // Fit map to Nashik district on first render
  const center: [number, number] = [20.05, 73.95];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Geospatial Intelligence"
        title="Risk Heatmap"
        description="Color-coded outbreak risk across 36 villages in Nashik district. Click any marker for full breakdown."
        action={
          <div className="flex flex-wrap gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition focus-ring ${
                  filter === f
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {f === 'all' ? 'All villages' : `${f} risk`}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Map */}
        <div className="lg:col-span-2 card overflow-hidden h-[560px] relative">
          <MapContainer
            center={center} zoom={9}
            className="h-full w-full"
            scrollWheelZoom
            style={{ background: '#eef5f6' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds />
            {visibleVillages.map(v => {
              const lvl = villageRiskLevel(v);
              const score = villageOverallScore(v);
              return (
                <CircleMarker
                  key={v.id}
                  center={[v.lat, v.lng]}
                  radius={lvl === 'high' ? 14 : lvl === 'medium' ? 11 : 9}
                  pathOptions={{
                    color: '#ffffff',
                    weight: lvl === 'high' ? 3 : 2,
                    fillColor: RISK_COLOR[lvl],
                    fillOpacity: lvl === 'high' ? 0.95 : 0.85,
                  }}
                  eventHandlers={{ click: () => setSelectedId(v.id) }}
                >
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <div className="font-bold text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500 mb-2">{v.block} · pop. {v.population.toLocaleString()}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <RiskBadge level={lvl} />
                        <span className="text-xs text-slate-600">Score <b className="text-slate-900">{score}</b>/100</span>
                      </div>
                      <button onClick={() => setSelectedId(v.id)}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                        View details →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 card p-3 text-xs z-[400] bg-white/95 backdrop-blur-sm">
            <div className="font-semibold text-slate-700 mb-2">Risk Level</div>
            <div className="space-y-1.5">
              {(['high', 'medium', 'low'] as const).map(l => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ background: RISK_COLOR[l] }} />
                  <span className="capitalize text-slate-600">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Count overlay */}
          <div className="absolute top-4 right-4 card px-3 py-2 text-xs z-[400] bg-white/95 backdrop-blur-sm">
            <span className="text-slate-500">Showing </span>
            <b className="text-slate-900">{visibleVillages.length}</b>
            <span className="text-slate-500"> of {VILLAGES.length} villages</span>
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-1 space-y-4 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1 lg:scroll-smooth">
          <VillageDetailPanel village={selected} />
        </div>
      </div>
    </div>
  );
}

function FitBounds() {
  const map = useMap();
  const bounds = useMemo(() => VILLAGES.map(v => [v.lat, v.lng] as [number, number]), []);
  if (bounds.length > 0) {
    try { map.fitBounds(bounds, { padding: [30, 30] }); }
    catch (e) { console.warn('Leaflet fitBounds failed:', e); }
  }
  return null;
}

function VillageDetailPanel({ village }: { village: Village }) {
  const lvl = villageRiskLevel(village);
  const score = villageOverallScore(village);
  const forecasts = forecastMedicines().filter(f =>
    f.medicine.treats.some(d => village.weeklyCases[d as DiseaseId] > 0),
  ).slice(0, 3);

  const diseaseRisks = (Object.keys(DISEASES) as DiseaseId[])
    .map(id => ({ id, risk: computeRisk(village, id) }))
    .sort((a, b) => b.risk.score - a.risk.score);

  const villageAlerts = ALERTS.filter(a => a.villageId === village.id);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5" /> {village.block}, Nashik
            </div>
            <h2 className="text-xl font-bold text-slate-900">{village.name}</h2>
          </div>
          <StatusDot level={lvl} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Tile icon={<Users className="w-4 h-4" />} label="Population" value={<span className="num">{village.population.toLocaleString()}</span>} />
          <Tile icon={<Activity className="w-4 h-4" />} label="ASHAs" value={<span className="num">{village.ashaCount}</span>} />
          <Tile icon={<Thermometer className="w-4 h-4" />} label="Temp" value={<span className="num">{village.weather.tempC}°C</span>} />
          <Tile icon={<Droplets className="w-4 h-4" />} label="Humidity" value={<span className="num">{village.weather.humidity}%</span>} />
          <Tile icon={<CloudRain className="w-4 h-4" />} label="Rain (7d)" value={<span className="num">{village.weather.rainfallMm}mm</span>} />
          <Tile icon={<AlertCircle className="w-4 h-4" />} label="Risk Score" value={<span className="num">{score}/100</span>} />
        </div>
        <div className="mt-4">
          <RiskBadge level={lvl} className="w-full justify-center py-1.5 text-sm" />
        </div>
      </div>

      {/* Disease risks */}
      <div className="card p-5">
        <div className="section-title mb-3">Disease Risk Profile</div>
        <div className="space-y-2.5">
          {diseaseRisks.map(({ id, risk }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="text-xl">{DISEASES[id].emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800 truncate">{DISEASES[id].name}</span>
                  <span className="text-xs font-semibold num text-slate-600">{risk.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${risk.score}%`,
                      background: risk.level === 'high' ? '#EF4444' : risk.level === 'medium' ? '#F59E0B' : '#10B981',
                    }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {villageAlerts.length > 0 && (
        <div className="card p-5">
          <div className="section-title mb-3">Active Alerts ({villageAlerts.length})</div>
          <div className="space-y-2.5">
            {villageAlerts.map(a => (
              <div key={a.id} className="p-3 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-medium text-slate-900">{a.title}</div>
                  <SeverityChip severity={a.severity} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended medicines */}
      {forecasts.length > 0 && (
        <div className="card p-5">
          <div className="section-title mb-3">Relevant Medicines</div>
          <div className="space-y-2">
            {forecasts.map(f => (
              <div key={f.medicine.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Pill className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-700">{f.medicine.name}</span>
                </div>
                <span className={`chip text-[11px] ${
                  f.status === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' :
                  f.status === 'warning' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200' :
                  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                }`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
        {icon} {label}
      </div>
      <div className="font-bold text-slate-900 num mt-0.5">{value}</div>
    </div>
  );
}
