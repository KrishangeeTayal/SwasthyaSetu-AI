// NLEM-aligned essential medicine inventory for the demo.
// All numbers are synthetic but realistic for a district warehouse + 6 PHCs.

export interface Medicine {
  id: string;
  name: string;
  category: 'Antipyretic' | 'Antimalarial' | 'Antibiotic' | 'ORS' | 'Diagnostic' | 'Inhaler' | 'Other';
  unit: string;
  // Disease IDs it primarily treats
  treats: string[];
  // District warehouse current stock
  stock: number;
  // Reorder threshold
  minStock: number;
  // Average daily consumption across all PHCs
  dailyConsumption: number;
  // Expected lead time in days from state supply
  leadTimeDays: number;
  // Per-unit cost in INR (for context)
  unitCostINR: number;
  // Generic name shown to district pharmacists
  genericName: string;
}

export const MEDICINES: Medicine[] = [
  {
    id: 'med01', name: 'Paracetamol 500mg', category: 'Antipyretic',
    unit: 'tablet', treats: ['dengue', 'malaria', 'respiratory'],
    stock: 18200, minStock: 10000, dailyConsumption: 1840, leadTimeDays: 4,
    unitCostINR: 0.5, genericName: 'Paracetamol IP',
  },
  {
    id: 'med02', name: 'ORS Powder 21g', category: 'ORS',
    unit: 'packet', treats: ['diarrhea', 'dengue'],
    stock: 1240, minStock: 1500, dailyConsumption: 95, leadTimeDays: 3,
    unitCostINR: 5, genericName: 'WHO-ORS',
  },
  {
    id: 'med03', name: 'Zinc Tablets 20mg', category: 'Other',
    unit: 'tablet', treats: ['diarrhea'],
    stock: 6200, minStock: 4000, dailyConsumption: 380, leadTimeDays: 5,
    unitCostINR: 1.2, genericName: 'Zinc Sulphate IP',
  },
  {
    id: 'med04', name: 'ACT (Artemether-Lumefantrine)', category: 'Antimalarial',
    unit: 'strip', treats: ['malaria'],
    stock: 320, minStock: 400, dailyConsumption: 28, leadTimeDays: 7,
    unitCostINR: 28, genericName: 'AL 80mg/480mg',
  },
  {
    id: 'med05', name: 'RDT Malaria Kit', category: 'Diagnostic',
    unit: 'kit', treats: ['malaria'],
    stock: 84, minStock: 100, dailyConsumption: 6, leadTimeDays: 10,
    unitCostINR: 45, genericName: 'SD Bioline Malaria Ag P.f/Pan',
  },
  {
    id: 'med06', name: 'Ceftriaxone 1g Inj', category: 'Antibiotic',
    unit: 'vial', treats: ['typhoid'],
    stock: 410, minStock: 250, dailyConsumption: 14, leadTimeDays: 6,
    unitCostINR: 42, genericName: 'Ceftriaxone IP',
  },
  {
    id: 'med07', name: 'Azithromycin 500mg', category: 'Antibiotic',
    unit: 'tablet', treats: ['typhoid', 'respiratory'],
    stock: 2900, minStock: 2000, dailyConsumption: 145, leadTimeDays: 5,
    unitCostINR: 6, genericName: 'Azithromycin IP',
  },
  {
    id: 'med08', name: 'Salbutamol Inhaler', category: 'Inhaler',
    unit: 'inhaler', treats: ['respiratory'],
    stock: 142, minStock: 120, dailyConsumption: 7, leadTimeDays: 8,
    unitCostINR: 95, genericName: 'Salbutamol 100mcg MDI',
  },
  {
    id: 'med09', name: 'Amoxicillin 500mg', category: 'Antibiotic',
    unit: 'capsule', treats: ['respiratory', 'typhoid'],
    stock: 7800, minStock: 5000, dailyConsumption: 520, leadTimeDays: 4,
    unitCostINR: 2.1, genericName: 'Amoxicillin IP',
  },
  {
    id: 'med10', name: 'Cetirizine 10mg', category: 'Other',
    unit: 'tablet', treats: ['respiratory'],
    stock: 5400, minStock: 3000, dailyConsumption: 220, leadTimeDays: 5,
    unitCostINR: 0.6, genericName: 'Cetirizine IP',
  },
  {
    id: 'med11', name: 'Metronidazole 400mg', category: 'Antibiotic',
    unit: 'tablet', treats: ['diarrhea'],
    stock: 3200, minStock: 2500, dailyConsumption: 180, leadTimeDays: 4,
    unitCostINR: 1.0, genericName: 'Metronidazole IP',
  },
  {
    id: 'med12', name: 'Widal Test Kit', category: 'Diagnostic',
    unit: 'kit', treats: ['typhoid'],
    stock: 28, minStock: 50, dailyConsumption: 3, leadTimeDays: 12,
    unitCostINR: 65, genericName: 'Widal Slide Agglutination',
  },
  {
    id: 'med13', name: 'Platelet Test Kit', category: 'Diagnostic',
    unit: 'kit', treats: ['dengue'],
    stock: 18, minStock: 30, dailyConsumption: 2, leadTimeDays: 14,
    unitCostINR: 380, genericName: 'Dengue NS1 Ag + IgG/IgM',
  },
  {
    id: 'med14', name: 'IV Fluids (RL 500ml)', category: 'Other',
    unit: 'bottle', treats: ['dengue', 'diarrhea', 'typhoid'],
    stock: 1240, minStock: 800, dailyConsumption: 62, leadTimeDays: 3,
    unitCostINR: 18, genericName: 'Ringer Lactate IP',
  },
  {
    id: 'med15', name: 'Chlorine Tablets 5g', category: 'Other',
    unit: 'tablet', treats: ['diarrhea', 'typhoid'],
    stock: 8400, minStock: 5000, dailyConsumption: 410, leadTimeDays: 6,
    unitCostINR: 0.8, genericName: 'Halazone 5g',
  },
];

// Pre-computed demand surge based on outbreak forecast.
// Maps diseaseId -> multiplier applied on top of baseline daily consumption.
export interface SurgeFactor {
  diseaseId: string;
  multiplier: number;       // e.g. 2.8 = current demand is 2.8x baseline
  predictedCases14d: number;
  contributingVillages: string[];
}

import { ALERTS, type DiseaseId } from './villages';

export function computeDiseaseDemand(): SurgeFactor[] {
  const acc = new Map<DiseaseId, { mult: number; cases: number; v: Set<string> }>();
  for (const a of ALERTS) {
    const cur = acc.get(a.diseaseId) ?? { mult: 1, cases: 0, v: new Set() };
    // Multiplier grows with predicted/observed ratio, capped.
    const ratio = Math.min(3.5, 1 + (a.predictedCases7d - a.currentCases) / Math.max(1, a.currentCases));
    cur.mult = Math.max(cur.mult, ratio);
    cur.cases += a.predictedCases7d;
    cur.v.add(a.villageId);
    acc.set(a.diseaseId, cur);
  }
  return Array.from(acc.entries()).map(([diseaseId, v]) => ({
    diseaseId,
    multiplier: Math.round(v.mult * 10) / 10,
    predictedCases14d: v.cases,
    contributingVillages: Array.from(v.v),
  }));
}
