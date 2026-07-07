// Outbreak Simulator — counterfactual logistic-spread model.
// Explainable, deterministic, runs entirely in the browser.
//
// Mathematical model
// ------------------
// We use a discrete logistic growth equation for cumulative cases:
//
//   N[t+1] = N[t] + r · N[t] · (1 − N[t]/K)
//
// where:
//   N[t]    = cumulative cases at day t
//   r       = intrinsic growth rate, modulated by environment & intervention
//   K       = district carrying capacity (saturation)
//
// Growth-rate modulation (the "why" behind the sliders):
//
//   r = r_base · (1 + 0.30 · rainfall/50 + 0.20 · humidity/100) · (1 − intervention_reduction)
//
//   - r_base = 0.18  (typical for vector/water-borne outbreaks in early phase)
//   - rainfall boosts standing water → vector breeding & contamination
//   - humidity boosts vector survival
//   - each intervention reduces transmission via a distinct pathway
//
// Interventions COMPOUND via independent failure rates:
//
//   effective_reduction = 1 − (1 − r1)(1 − r2)(1 − r3)
//
//   - mosquito_control   r1 = 0.35  (cuts vector density via fogging/larvicide)
//   - awareness          r2 = 0.25  (earlier care-seeking + behavior change)
//   - medicine_alloc     r3 = 0.20  (shorter infectious period via treatment)
//
// All 3 active:  1 − (0.65)(0.75)(0.80) = 0.61  →  61% reduction in growth rate.

export type InterventionId = 'mosquito' | 'awareness' | 'medicine';

export interface InterventionDef {
  id: InterventionId;
  title: string;
  short: string;
  mechanism: string;
  reduction: number;   // 0..1
  costINR: number;     // 14-day district campaign
  iconName: 'Bug' | 'Megaphone' | 'Pill';
  color: 'brand' | 'accent' | 'warn';
}

export const INTERVENTIONS: InterventionDef[] = [
  {
    id: 'mosquito',
    title: 'Mosquito Control Campaign',
    short: 'Fogging + larvicide across 6 highest-risk villages',
    mechanism: 'Reduces adult vector density and destroys breeding sites. Most effective against dengue, malaria.',
    reduction: 0.35,
    costINR: 75000,
    iconName: 'Bug',
    color: 'brand',
  },
  {
    id: 'awareness',
    title: 'Awareness Campaign',
    short: 'IVR + ASHA + loudspeaker advisories in Hindi & Marathi',
    mechanism: 'Drives earlier care-seeking and protective behaviour (boiled water, nets, sanitation).',
    reduction: 0.25,
    costINR: 35000,
    iconName: 'Megaphone',
    color: 'accent',
  },
  {
    id: 'medicine',
    title: 'Emergency Medicine Allocation',
    short: 'Pre-position ORS, ACT, paracetamol at 6 PHCs',
    mechanism: 'Shorter infectious period and lower complication rate when treatment starts within 24h.',
    reduction: 0.20,
    costINR: 60000,
    iconName: 'Pill',
    color: 'warn',
  },
];

// --- Tunable model constants -----------------------------------------

const R_BASE = 0.18;             // base daily growth rate
const PEAK_CAP = 1500;            // district carrying capacity (cases)
const SIM_DAYS = 14;
const CASE_COST_INR = 3200;       // avg cost of treating one moderate case (meds + OPD + lost wages proxy)
const BASE_VILLAGES_AFFECTED = 8; // villages likely to see >5 cases without intervention

// --- Simulation -------------------------------------------------------

export interface SimDay {
  day: number;
  cases: number;        // cumulative
  newToday: number;     // new cases on this day
}

export interface SimResult {
  series: SimDay[];
  totalCases: number;
  peakDay: number;
}

function simulate(
  initial: number,
  rainfall: number,    // mm in last 7d
  humidity: number,    // %
  reduction: number,   // 0..0.7
  days = SIM_DAYS,
): SimResult {
  const r = R_BASE
    * (1 + 0.30 * Math.min(1, rainfall / 50) + 0.20 * Math.min(1, humidity / 100))
    * (1 - reduction);

  const series: SimDay[] = [{ day: 0, cases: initial, newToday: initial }];
  let cumulative = initial;

  for (let d = 1; d <= days; d++) {
    const newToday = r * cumulative * (1 - cumulative / PEAK_CAP);
    cumulative = Math.min(PEAK_CAP, cumulative + newToday);
    series.push({
      day: d,
      cases: Math.round(cumulative),
      newToday: Math.round(newToday),
    });
  }

  const peakDay = series.reduce((p, x) => (x.newToday > series[p].newToday ? x.day : p), 0);
  return { series, totalCases: Math.round(cumulative), peakDay };
}

function combinedReduction(active: Set<InterventionId>): number {
  // 1 - product of (1 - ri)
  let prod = 1;
  for (const def of INTERVENTIONS) {
    if (active.has(def.id)) prod *= (1 - def.reduction);
  }
  return 1 - prod;
}

export interface Impact {
  noInt: SimResult;
  withInt: SimResult;
  casesPrevented: number;
  pctReduction: number;
  interventionCost: number;
  grossSavingsINR: number;
  netSavingsINR: number;
  villagesAffectedNoInt: number;
  villagesAffectedWithInt: number;
  villagesProtected: number;
  combinedReduction: number;
  activeInterventions: InterventionDef[];
}

export function runSimulation(opts: {
  rainfallMm: number;
  humidityPct: number;
  existingCases: number;
  active: InterventionId[];
}): Impact {
  const { rainfallMm, humidityPct, existingCases, active } = opts;
  const activeSet = new Set(active);
  const red = combinedReduction(activeSet);
  const activeDefs = INTERVENTIONS.filter(d => activeSet.has(d.id));

  const noInt = simulate(existingCases, rainfallMm, humidityPct, 0);
  const withInt = simulate(existingCases, rainfallMm, humidityPct, red);

  const casesPrevented = Math.max(0, noInt.totalCases - withInt.totalCases);
  const pctReduction = noInt.totalCases > 0
    ? (casesPrevented / noInt.totalCases) * 100
    : 0;

  const interventionCost = activeDefs.reduce((s, d) => s + d.costINR, 0);
  const grossSavingsINR = casesPrevented * CASE_COST_INR;
  const netSavingsINR = grossSavingsINR - interventionCost;

  // Scale village count by how effectively the spread is contained.
  // Without intervention: 8 villages get >5 cases.
  // With intervention: fewer because the curve flattens earlier.
  const villagesAffectedNoInt = BASE_VILLAGES_AFFECTED;
  const villagesAffectedWithInt = Math.max(
    1,
    Math.round(BASE_VILLAGES_AFFECTED * (1 - red * 0.85)),
  );
  const villagesProtected = Math.max(0, villagesAffectedNoInt - villagesAffectedWithInt);

  return {
    noInt, withInt,
    casesPrevented, pctReduction,
    interventionCost, grossSavingsINR, netSavingsINR,
    villagesAffectedNoInt, villagesAffectedWithInt, villagesProtected,
    combinedReduction: red,
    activeInterventions: activeDefs,
  };
}

// --- Counterfactual chart payload ------------------------------------

export interface ChartPoint {
  day: number;
  noInt: number;
  withInt: number;
  delta: number;
}

export function chartData(impact: Impact): ChartPoint[] {
  return impact.noInt.series.map((p, i) => ({
    day: p.day,
    noInt: p.cases,
    withInt: impact.withInt.series[i].cases,
    delta: p.cases - impact.withInt.series[i].cases,
  }));
}
