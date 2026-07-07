// Real risk prediction logic — not random.
// Combines weather suitability, rainfall, and historical case momentum
// into a 0-100 risk score per (village, disease) pair, plus a plain-English
// explanation of which signals contributed most.

import { DISEASES, type Disease, type DiseaseId, type Village, type RiskLevel, VILLAGES } from '@/data/villages';
import { MEDICINES, computeDiseaseDemand, type Medicine } from '@/data/medicines';

// ---------- Helpers ----------

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

// Triangular membership: 1 inside the optimal range, falling to 0 at +/- 6 units.
function tempSuitability(tempC: number, range: [number, number]) {
  const [lo, hi] = range;
  if (tempC >= lo && tempC <= hi) return 1;
  const dist = tempC < lo ? lo - tempC : tempC - hi;
  return clamp01(1 - dist / 6);
}

function humiditySuitability(humidity: number, range: [number, number]) {
  const [lo, hi] = range;
  if (humidity >= lo && humidity <= hi) return 1;
  const dist = humidity < lo ? lo - humidity : humidity - hi;
  return clamp01(1 - dist / 25);
}

// Rainfall contribution saturates around 60mm in a week for most diseases.
function rainfallContribution(mm: number, factor: number) {
  const base = clamp01(mm / 60);
  // Heavy rainfall compounds vector/water-borne risk.
  return clamp01(base * factor / 2);
}

// Momentum: ratio of last 2 weeks vs prior 4-week baseline.
function momentumSignal(history: number[]) {
  if (history.length < 6) return 0.5;
  const recent = history.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const baseline = history.slice(-6, -2).reduce((a, b) => a + b, 0) / 4;
  if (baseline === 0) return Math.min(1, recent / 5);
  const ratio = recent / Math.max(baseline, 0.5);
  return clamp01((ratio - 0.7) / 1.8);
}

// ---------- Risk score ----------

export interface RiskFactor {
  label: string;
  weight: number;     // 0..1
  value: number;      // raw value
  contribution: number; // weight * signal
  note: string;
}

export interface RiskResult {
  disease: Disease;
  score: number;        // 0..100
  level: RiskLevel;
  predictedCases7d: number;
  predictedCases14d: number;
  currentWeeklyCases: number;
  factors: RiskFactor[];
  explanation: string;  // human-readable
}

export function computeRisk(village: Village, diseaseId: DiseaseId): RiskResult {
  const disease = DISEASES[diseaseId];
  const { tempC, humidity, rainfallMm } = village.weather;
  const history = village.history[diseaseId];
  const current = village.weeklyCases[diseaseId];

  const tempSig   = tempSuitability(tempC, disease.optimalTemp);
  const humSig    = humiditySuitability(humidity, disease.optimalHumidity);
  const rainSig   = rainfallContribution(rainfallMm, disease.rainfallFactor);
  const momSig    = momentumSignal(history);

  // Weighted blend; previous cases dominate because they're direct signal.
  const weights = { temp: 0.18, hum: 0.14, rain: 0.18, mom: 0.50 };
  const blended =
    weights.temp * tempSig +
    weights.hum  * humSig  +
    weights.rain * rainSig +
    weights.mom  * momSig;

  // Scale by absolute recent cases so a quiet village doesn't shout.
  const recentSum = history.slice(-3).reduce((a, b) => a + b, 0);
  const magnitude = clamp01(recentSum / 30); // 30 cases in 3 wks = full magnitude
  const score = Math.round(100 * (0.4 * blended + 0.6 * magnitude));

  const level: RiskLevel =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  // Forecast: scale recent weekly cases by blended signal growth.
  const growth = clamp01(0.6 + blended * 1.4);
  const predicted7  = Math.round(current * growth * 1.4);
  const predicted14 = Math.round(current * growth * 2.1);

  const factors: RiskFactor[] = [
    {
      label: 'Temperature',
      weight: weights.temp, value: tempSig, contribution: weights.temp * tempSig,
      note: `${tempC.toFixed(1)}°C vs optimal ${disease.optimalTemp[0]}–${disease.optimalTemp[1]}°C for ${disease.name}`,
    },
    {
      label: 'Humidity',
      weight: weights.hum, value: humSig, contribution: weights.hum * humSig,
      note: `${humidity}% vs optimal ${disease.optimalHumidity[0]}–${disease.optimalHumidity[1]}%`,
    },
    {
      label: 'Rainfall (7d)',
      weight: weights.rain, value: rainSig, contribution: weights.rain * rainSig,
      note: `${rainfallMm.toFixed(1)} mm in last 7 days`,
    },
    {
      label: 'Case momentum',
      weight: weights.mom, value: momSig, contribution: weights.mom * momSig,
      note: `${current} new cases this week · ${recentSum} in last 3 weeks`,
    },
  ].sort((a, b) => b.contribution - a.contribution);

  const top = factors.slice(0, 2);
  const explanation =
    `${disease.name} risk in ${village.name} is ${level.toUpperCase()} (${score}/100). ` +
    `Top drivers: ${top.map(f => f.label.toLowerCase()).join(' and ')}. ` +
    `${top[0].note}.`;

  return {
    disease,
    score,
    level,
    predictedCases7d: predicted7,
    predictedCases14d: predicted14,
    currentWeeklyCases: current,
    factors,
    explanation,
  };
}

// ---------- Village-level composite ----------

export function villageRiskLevel(village: Village): RiskLevel {
  let max: RiskLevel = 'low';
  for (const id of Object.keys(DISEASES) as DiseaseId[]) {
    const r = computeRisk(village, id);
    if (r.level === 'high') return 'high';
    if (r.level === 'medium') max = 'medium';
  }
  return max;
}

export function villageOverallScore(village: Village): number {
  const scores = (Object.keys(DISEASES) as DiseaseId[])
    .map(id => computeRisk(village, id).score);
  return Math.round(Math.max(...scores));
}

// ---------- Medicine forecast ----------

export interface MedicineForecast {
  medicine: Medicine;
  daysOfStock: number;
  baselineDays: number;
  surgeDays: number;        // days until stockout if surge hits
  expectedDemand14d: number;
  baselineDemand14d: number;
  status: 'critical' | 'warning' | 'ok' | 'surplus';
  recommendedOrder: number;
  reason: string;
}

export function forecastMedicines(): MedicineForecast[] {
  const surges = new Map(computeDiseaseDemand().map(s => [s.diseaseId, s]));
  return MEDICINES.map(med => {
    const baselineDays = med.stock / Math.max(med.dailyConsumption, 0.1);

    // Aggregate surge multiplier across diseases this medicine treats.
    let maxMult = 1;
    let topSurge: { diseaseId: string; multiplier: number; cases: number } | null = null;
    for (const dId of med.treats) {
      const s = surges.get(dId);
      if (s && s.multiplier > maxMult) {
        maxMult = s.multiplier;
        topSurge = { diseaseId: dId, multiplier: s.multiplier, cases: s.predictedCases14d };
      }
    }

    const surgeDaily = med.dailyConsumption * maxMult;
    const surgeDays  = med.stock / Math.max(surgeDaily, 0.1);
    const expectedDemand14d = Math.round(surgeDaily * 14);
    const baselineDemand14d = Math.round(med.dailyConsumption * 14);

    // Status thresholds (in days under surge).
    let status: MedicineForecast['status'] = 'ok';
    if (surgeDays < 7) status = 'critical';
    else if (surgeDays < 14) status = 'warning';
    else if (baselineDays > 30 && med.stock > med.minStock * 3) status = 'surplus';

    const recommendedOrder = status === 'critical' || status === 'warning'
      ? Math.max(med.minStock * 2, Math.ceil(surgeDaily * 21) - med.stock)
      : Math.max(0, Math.ceil(med.minStock * 1.5) - med.stock);

    const diseaseName = topSurge
      ? (DISEASES[topSurge.diseaseId as DiseaseId]?.name ?? topSurge.diseaseId)
      : null;

    const reason = topSurge && surgeDays < 14
      ? `Surge in ${diseaseName} (${topSurge.multiplier}× baseline, ${topSurge.cases} cases forecast in 14d). Stock-out in ${surgeDays.toFixed(1)} days under surge.`
      : surgeDays < 7
        ? `Stock-out in ${surgeDays.toFixed(1)} days at current consumption.`
        : `Healthy stock — ${baselineDays.toFixed(0)} days at baseline, ${surgeDays.toFixed(0)} days even under worst surge.`;

    return {
      medicine: med,
      daysOfStock: Math.round(baselineDays * 10) / 10,
      baselineDays: Math.round(baselineDays * 10) / 10,
      surgeDays: Math.round(surgeDays * 10) / 10,
      expectedDemand14d,
      baselineDemand14d,
      status,
      recommendedOrder,
      reason,
    };
  });
}

// ---------- Aggregate stats for dashboard ----------

export interface DistrictStats {
  totalVillages: number;
  totalPopulation: number;
  totalAsha: number;
  highRiskVillages: number;
  mediumRiskVillages: number;
  weeklyCases: number;
  predictedCases7d: number;
  predictedCases14d: number;
  criticalMedicines: number;
  activeAlerts: number;
}

export function computeDistrictStats(): DistrictStats {
  const high = VILLAGES.filter(v => villageRiskLevel(v) === 'high').length;
  const med  = VILLAGES.filter(v => villageRiskLevel(v) === 'medium').length;
  const weekly = VILLAGES.reduce((s, v) =>
    s + Object.values(v.weeklyCases).reduce((a, b) => a + b, 0), 0);
  const forecasts = forecastMedicines();
  return {
    totalVillages: VILLAGES.length,
    totalPopulation: VILLAGES.reduce((s, v) => s + v.population, 0),
    totalAsha: VILLAGES.reduce((s, v) => s + v.ashaCount, 0),
    highRiskVillages: high,
    mediumRiskVillages: med,
    weeklyCases: weekly,
    predictedCases7d: Math.round(weekly * 1.35),
    predictedCases14d: Math.round(weekly * 1.85),
    criticalMedicines: forecasts.filter(f => f.status === 'critical').length,
    activeAlerts: forecasts.filter(f => f.status === 'critical' || f.status === 'warning').length,
  };
}

// ---------- Disease trend (for dashboard chart) ----------

export interface TrendPoint { week: string; cases: number; predicted?: number }

export function diseaseTrend(diseaseId: DiseaseId): TrendPoint[] {
  const weeks = 12;
  const out: TrendPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    const sum = VILLAGES.reduce((s, v) => s + v.history[diseaseId][i], 0);
    const label = `W${i + 1}`;
    const point: TrendPoint = { week: label, cases: sum };
    if (i === weeks - 1) point.predicted = Math.round(sum * 1.4);
    out.push(point);
  }
  return out;
}

export function diseaseBreakdown(): { id: DiseaseId; cases: number; name: string; color: string }[] {
  const ids = Object.keys(DISEASES) as DiseaseId[];
  return ids.map(id => ({
    id,
    name: DISEASES[id].name,
    color: DISEASES[id].color,
    cases: VILLAGES.reduce((s, v) => s + v.weeklyCases[id], 0),
  })).sort((a, b) => b.cases - a.cases);
}
