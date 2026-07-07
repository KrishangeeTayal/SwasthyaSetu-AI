// Mock data for Nashik district, Maharashtra.
// Coordinates are approximate village centers. Deterministic seed
// keeps the dataset stable across reloads (important for demo).

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Village {
  id: string;
  name: string;
  block: string;
  population: number;
  ashaCount: number;
  lat: number;
  lng: number;
  // Most recent weekly disease signals
  weeklyCases: Record<DiseaseId, number>;
  // 12-week case history (oldest → newest)
  history: Record<DiseaseId, number[]>;
  // Latest weather
  weather: { tempC: number; humidity: number; rainfallMm: number };
  // Active alerts for this village
  alertIds: string[];
}

export type DiseaseId =
  | 'dengue'
  | 'malaria'
  | 'diarrhea'
  | 'typhoid'
  | 'respiratory';

export interface Disease {
  id: DiseaseId;
  name: string;
  category: 'Vector-borne' | 'Water-borne' | 'Air-borne' | 'Contact';
  emoji: string;
  // Optimal weather ranges for spread
  optimalTemp: [number, number]; // °C
  optimalHumidity: [number, number]; // %
  rainfallFactor: number; // multiplier per mm above baseline
  color: string;
  // Typical medicine of first response
  medicines: string[];
}

export const DISEASES: Record<DiseaseId, Disease> = {
  dengue: {
    id: 'dengue',
    name: 'Dengue',
    category: 'Vector-borne',
    emoji: '🦟',
    optimalTemp: [25, 32],
    optimalHumidity: [60, 85],
    rainfallFactor: 1.8,
    color: '#EF4444',
    medicines: ['Paracetamol 500mg', 'ORS Powder', 'Platelet Test Kit'],
  },
  malaria: {
    id: 'malaria',
    name: 'Malaria',
    category: 'Vector-borne',
    emoji: '🦟',
    optimalTemp: [22, 30],
    optimalHumidity: [55, 80],
    rainfallFactor: 2.1,
    color: '#F97316',
    medicines: ['ACT (Artemether-Lumefantrine)', 'Paracetamol 500mg', 'RDT Malaria Kit'],
  },
  diarrhea: {
    id: 'diarrhea',
    name: 'Diarrhea',
    category: 'Water-borne',
    emoji: '💧',
    optimalTemp: [28, 38],
    optimalHumidity: [50, 90],
    rainfallFactor: 2.6,
    color: '#0EA5E9',
    medicines: ['ORS Powder', 'Zinc Tablets 20mg', 'Metronidazole 400mg'],
  },
  typhoid: {
    id: 'typhoid',
    name: 'Typhoid',
    category: 'Water-borne',
    emoji: '🧪',
    optimalTemp: [25, 35],
    optimalHumidity: [50, 80],
    rainfallFactor: 1.9,
    color: '#8B5CF6',
    medicines: ['Ceftriaxone 1g Inj', 'Azithromycin 500mg', 'Widal Test Kit'],
  },
  respiratory: {
    id: 'respiratory',
    name: 'Respiratory Infection',
    category: 'Air-borne',
    emoji: '🫁',
    optimalTemp: [10, 22],
    optimalHumidity: [40, 70],
    rainfallFactor: 0.6,
    color: '#14B8A6',
    medicines: ['Salbutamol Inhaler', 'Amoxicillin 500mg', 'Cetirizine 10mg'],
  },
};

export const DISEASE_LIST: Disease[] = Object.values(DISEASES);

// Real Nashik district blocks + villages (approximate coords)
export const BLOCKS = [
  'Nashik', 'Sinnar', 'Niphad', 'Yeola', 'Nandgaon',
  'Chandwad', 'Dindori', 'Trimbakeshwar', 'Igatpuri', 'Kalwan',
];

const VILLAGE_SEEDS: Array<Omit<Village, 'weeklyCases' | 'history' | 'weather' | 'alertIds'>> = [
  // Nashik block
  { id: 'v01', name: 'Panchavati',        block: 'Nashik',         population: 8420, ashaCount: 6, lat: 20.0074, lng: 73.7907 },
  { id: 'v02', name: 'Ramkund',           block: 'Nashik',         population: 5120, ashaCount: 4, lat: 20.0118, lng: 73.7845 },
  { id: 'v03', name: 'Mhasrul',           block: 'Nashik',         population: 6230, ashaCount: 5, lat: 20.0451, lng: 73.7621 },
  { id: 'v04', name: 'Indira Nagar',      block: 'Nashik',         population: 4980, ashaCount: 4, lat: 19.9812, lng: 73.8089 },
  { id: 'v05', name: 'Gangapur',          block: 'Nashik',         population: 7240, ashaCount: 5, lat: 20.0367, lng: 73.7291 },
  // Sinnar
  { id: 'v06', name: 'Sinnar Town',       block: 'Sinnar',         population: 11200, ashaCount: 8, lat: 19.8473, lng: 74.0047 },
  { id: 'v07', name: 'Dapur',             block: 'Sinnar',         population: 3680, ashaCount: 3, lat: 19.8812, lng: 73.9512 },
  { id: 'v08', name: 'Mohu',              block: 'Sinnar',         population: 2890, ashaCount: 3, lat: 19.9014, lng: 74.0431 },
  { id: 'v09', name: 'Pimpalgaon',        block: 'Sinnar',         population: 4560, ashaCount: 4, lat: 19.8203, lng: 73.9821 },
  // Niphad
  { id: 'v10', name: 'Niphad',            block: 'Niphad',         population: 9870, ashaCount: 7, lat: 20.0794, lng: 74.1047 },
  { id: 'v11', name: 'Lasalgaon',         block: 'Niphad',         population: 6720, ashaCount: 5, lat: 20.1401, lng: 74.2381 },
  { id: 'v12', name: 'Pimpalgaon Baswant',block: 'Niphad',         population: 5430, ashaCount: 4, lat: 20.1651, lng: 74.0731 },
  { id: 'v13', name: 'Vadali',            block: 'Niphad',         population: 3210, ashaCount: 3, lat: 20.1102, lng: 74.1702 },
  // Yeola
  { id: 'v14', name: 'Yeola Town',        block: 'Yeola',          population: 12450, ashaCount: 8, lat: 20.0437, lng: 74.3081 },
  { id: 'v15', name: 'Andarsul',          block: 'Yeola',          population: 4180, ashaCount: 4, lat: 20.0789, lng: 74.3502 },
  { id: 'v16', name: 'Nandur',            block: 'Yeola',          population: 2980, ashaCount: 3, lat: 20.0118, lng: 74.2812 },
  // Nandgaon
  { id: 'v17', name: 'Nandgaon',          block: 'Nandgaon',       population: 5640, ashaCount: 4, lat: 20.3047, lng: 74.6551 },
  { id: 'v18', name: 'Manmad',            block: 'Nandgaon',       population: 8920, ashaCount: 6, lat: 20.2531, lng: 74.4391 },
  { id: 'v19', name: 'Hiswal',            block: 'Nandgaon',       population: 2640, ashaCount: 2, lat: 20.3501, lng: 74.5812 },
  // Chandwad
  { id: 'v20', name: 'Chandwad',          block: 'Chandwad',       population: 7620, ashaCount: 5, lat: 20.3312, lng: 74.2441 },
  { id: 'v21', name: 'Dugaon',            block: 'Chandwad',       population: 3120, ashaCount: 3, lat: 20.3812, lng: 74.2101 },
  { id: 'v22', name: 'Mangrul',           block: 'Chandwad',       population: 2890, ashaCount: 2, lat: 20.2951, lng: 74.1812 },
  // Dindori
  { id: 'v23', name: 'Dindori',           block: 'Dindori',        population: 6720, ashaCount: 5, lat: 20.1981, lng: 73.8331 },
  { id: 'v24', name: 'Ozar',              block: 'Dindori',        population: 5430, ashaCount: 4, lat: 20.0891, lng: 73.9201 },
  { id: 'v25', name: 'Vani',              block: 'Dindori',        population: 4120, ashaCount: 3, lat: 20.1701, lng: 73.8801 },
  { id: 'v26', name: 'Palkhed',           block: 'Dindori',        population: 2980, ashaCount: 2, lat: 20.1402, lng: 73.7901 },
  // Trimbakeshwar
  { id: 'v27', name: 'Trimbak',           block: 'Trimbakeshwar',  population: 8120, ashaCount: 6, lat: 19.9321, lng: 73.5308 },
  { id: 'v28', name: 'Brahmagiri',        block: 'Trimbakeshwar',  population: 2480, ashaCount: 2, lat: 19.9501, lng: 73.5401 },
  { id: 'v29', name: 'Harsul',            block: 'Trimbakeshwar',  population: 1980, ashaCount: 2, lat: 19.9102, lng: 73.5601 },
  // Igatpuri
  { id: 'v30', name: 'Igatpuri',          block: 'Igatpuri',       population: 7820, ashaCount: 6, lat: 19.6972, lng: 73.5621 },
  { id: 'v31', name: 'Ghoti',             block: 'Igatpuri',       population: 4320, ashaCount: 4, lat: 19.7101, lng: 73.5801 },
  { id: 'v32', name: 'Kasara',            block: 'Igatpuri',       population: 5120, ashaCount: 4, lat: 19.6501, lng: 73.4812 },
  { id: 'v33', name: 'Khodala',           block: 'Igatpuri',       population: 2890, ashaCount: 3, lat: 19.7301, lng: 73.4201 },
  // Kalwan
  { id: 'v34', name: 'Kalwan',            block: 'Kalwan',         population: 5680, ashaCount: 4, lat: 20.4812, lng: 74.0201 },
  { id: 'v35', name: 'Manur',             block: 'Kalwan',         population: 3120, ashaCount: 3, lat: 20.5201, lng: 74.0801 },
  { id: 'v36', name: 'Kanashi',           block: 'Kalwan',         population: 2640, ashaCount: 2, lat: 20.4501, lng: 73.9701 },
];

// Deterministic seeded RNG (Mulberry32) so mock data is identical each load.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(seed: number, base: number, weeks = 12): number[] {
  const rng = mulberry32(seed);
  const arr: number[] = [];
  // build up to current with mild upward trend
  for (let i = 0; i < weeks; i++) {
    const trend = 1 + (i / weeks) * 0.4;
    const noise = 0.6 + rng() * 0.9;
    arr.push(Math.max(0, Math.round(base * trend * noise)));
  }
  return arr;
}

function buildWeather(seed: number) {
  const rng = mulberry32(seed + 7);
  // Monsoon-style values typical for August in Nashik
  const baseTemp = 26 + rng() * 6;       // 26-32 °C
  const humidity = 60 + rng() * 30;      // 60-90 %
  const rainfall = rng() * 45;           // 0-45 mm in last 7 days
  return {
    tempC: Math.round(baseTemp * 10) / 10,
    humidity: Math.round(humidity),
    rainfallMm: Math.round(rainfall * 10) / 10,
  };
}

const HIGH_RISK_VILLAGES = new Set(['v01', 'v10', 'v14', 'v23', 'v27', 'v30']);
const MEDIUM_RISK_VILLAGES = new Set(['v02', 'v05', 'v06', 'v11', 'v17', 'v20', 'v24', 'v31']);

function buildVillage(seed: typeof VILLAGE_SEEDS[number]): Village {
  const seedNum = parseInt(seed.id.slice(1)) * 137;
  const isHigh = HIGH_RISK_VILLAGES.has(seed.id);
  const isMedium = MEDIUM_RISK_VILLAGES.has(seed.id);

  const multiplier = isHigh ? 3.2 : isMedium ? 1.6 : 0.7;
  const rng = mulberry32(seedNum);

  const weeklyCases: Record<DiseaseId, number> = {
    dengue:      Math.round((2 + rng() * 6) * multiplier),
    malaria:     Math.round((1 + rng() * 4) * multiplier),
    diarrhea:    Math.round((4 + rng() * 8) * multiplier),
    typhoid:     Math.round((1 + rng() * 3) * multiplier),
    respiratory: Math.round((3 + rng() * 7) * multiplier),
  };

  const history: Record<DiseaseId, number[]> = {
    dengue:      buildHistory(seedNum + 1, weeklyCases.dengue * 0.6),
    malaria:     buildHistory(seedNum + 2, weeklyCases.malaria * 0.6),
    diarrhea:    buildHistory(seedNum + 3, weeklyCases.diarrhea * 0.6),
    typhoid:     buildHistory(seedNum + 4, weeklyCases.typhoid * 0.6),
    respiratory: buildHistory(seedNum + 5, weeklyCases.respiratory * 0.6),
  };

  return {
    ...seed,
    weeklyCases,
    history,
    weather: buildWeather(seedNum),
    alertIds: [],
  };
}

export const VILLAGES: Village[] = VILLAGE_SEEDS.map(buildVillage);

// --- Alerts ----------------------------------------------------------

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  villageId: string;
  diseaseId: DiseaseId;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
  predictedCases7d: number;
  currentCases: number;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

export const ALERTS: Alert[] = [
  {
    id: 'al01', villageId: 'v01', diseaseId: 'dengue', severity: 'critical',
    title: 'Dengue cluster forming — Panchavati',
    message: 'Sustained rainfall + humidity >80%. 14 cases this week vs 4 last month. ASHA screening advised.',
    createdAt: hoursAgo(2), predictedCases7d: 34, currentCases: 14,
  },
  {
    id: 'al02', villageId: 'v10', diseaseId: 'diarrhea', severity: 'critical',
    title: 'Diarrhea surge — Niphad Town',
    message: 'Contamination likely in open wells. ORS stock at 18 packets, demand forecast 240 in 14 days.',
    createdAt: hoursAgo(5), predictedCases7d: 47, currentCases: 22,
  },
  {
    id: 'al03', villageId: 'v14', diseaseId: 'typhoid', severity: 'warning',
    title: 'Typhoid watch — Yeola Town',
    message: '3 confirmed cases clustered in Ward 4. Recommend water testing + chlorination drive.',
    createdAt: hoursAgo(9), predictedCases7d: 18, currentCases: 6,
  },
  {
    id: 'al04', villageId: 'v23', diseaseId: 'malaria', severity: 'critical',
    title: 'Malaria outbreak risk — Dindori',
    message: 'Stagnant water after monsoon showers. Mosquito density elevated. ACT stock critical.',
    createdAt: hoursAgo(14), predictedCases7d: 28, currentCases: 11,
  },
  {
    id: 'al05', villageId: 'v27', diseaseId: 'respiratory', severity: 'warning',
    title: 'Respiratory uptick — Trimbak',
    message: 'Cooler temperatures at higher altitude. Vulnerable population (under-5 + elderly) at risk.',
    createdAt: hoursAgo(20), predictedCases7d: 22, currentCases: 9,
  },
  {
    id: 'al06', villageId: 'v30', diseaseId: 'dengue', severity: 'warning',
    title: 'Dengue watch — Igatpuri',
    message: 'Traveller inflow from Pune corridor. Vector index trending up.',
    createdAt: hoursAgo(28), predictedCases7d: 19, currentCases: 7,
  },
  {
    id: 'al07', villageId: 'v06', diseaseId: 'diarrhea', severity: 'warning',
    title: 'Diarrhea — Sinnar Town',
    message: 'Moderate risk. School survey flagged 4 symptomatic students.',
    createdAt: hoursAgo(36), predictedCases7d: 16, currentCases: 8,
  },
  {
    id: 'al08', villageId: 'v02', diseaseId: 'respiratory', severity: 'info',
    title: 'Respiratory cluster — Ramkund',
    message: 'Routine monitoring. PILs for inhaler refill advised.',
    createdAt: hoursAgo(48), predictedCases7d: 12, currentCases: 5,
  },
];

// attach alerts to villages
for (const alert of ALERTS) {
  const v = VILLAGES.find(x => x.id === alert.villageId);
  if (v) v.alertIds.push(alert.id);
}

export function villageById(id: string): Village | undefined {
  return VILLAGES.find(v => v.id === id);
}
