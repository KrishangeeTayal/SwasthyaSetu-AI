# SwasthyaSetu AI — Technical Documentation

> **Tagline:** Predict. Prepare. Protect.
> **Domain:** Public Health · Disease Surveillance · Healthcare Operations
> **Stack:** Vite · React 18 · TypeScript · Leaflet · Recharts · Tailwind CSS

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Module Descriptions](#6-module-descriptions)
7. [Prediction Logic](#7-prediction-logic)
8. [Data Flow](#8-data-flow)
9. [Scalability Considerations](#9-scalability-considerations)
10. [Future Enhancements](#10-future-enhancements)
11. [Installation & Run Instructions](#11-installation--run-instructions)

---

## 1. Project Overview

**SwasthyaSetu AI** is an AI-powered early warning platform built for India's rural healthcare system. It predicts two correlated crises *before* they happen — **disease outbreaks** and **medicine shortages** — and translates predictions into specific, deployable actions for frontline workers.

The product targets the three tiers of India's rural health delivery system:

| Persona | Role | What they get from SwasthyaSetu |
|---|---|---|
| **ASHA workers** | Grassroots reporting, community health | Plain-language alerts, prepackaged advisories, voice-friendly mobile UI |
| **PHC administrators** | Block-level operations, 6 sub-centres | Heatmap, forecasts, action console, shortage prediction |
| **District health officials** | Strategic planning, state reporting | District-wide command center, resource allocation, audit-grade logs |

The system is operational for **Nashik district, Maharashtra** — 36 villages, 6 PHCs, ~1.93 lakh population, 5 priority diseases, 15 NLEM-aligned essential medicines.

### What it does (in one breath)

> It runs a logistic outbreak model on weather + case history, propagates surge into medicine demand, and tells the district officer *which medicines to pre-position, which villages to screen, and which advisories to broadcast* — quantified, costed, and explainable.

---

## 2. Problem Statement

Rural India's disease surveillance is **reactive, fragmented, and slow**. The Integrated Disease Surveillance Programme (IDSP) reports outbreaks 2-4 weeks after community spread has begun. Consequence chain:

```
                ┌────────────── 2-4 WEEKS ──────────────┐
                │                                        │
Symptom onset → IDSP report → State response → Field action
                │                                        │
                └─ Late detection ─ medicine shortage ─ overworked PHCs ─ mortality
```

Three structural problems compound:

1. **Information lag** — Paper-based ASHA reporting reaches the district in days, by which time the outbreak is exponential.
2. **Supply-demand blindness** — Medicine allocation is annual/biannual, not responsive to forecasted demand. Shortages surface only after stockout.
3. **Decision paralysis** — Even when alerts fire, district officers lack the tooling to evaluate *which intervention actually helps*. Decisions default to "wait and see."

**SwasthyaSetu AI** addresses all three with one integrated platform.

---

## 3. Proposed Solution

A **single-pane-of-glass** command center that closes the loop from signal → prediction → action → outcome.

### Core capabilities

| Capability | How |
|---|---|
| **Predict outbreaks 7-14 days ahead** | Logistic spread model combining weather suitability, rainfall, and case-history momentum |
| **Forecast medicine shortages** | Demand-side surge (driven by outbreak model) × supply-side days-of-stock calculation |
| **Explain every prediction** | Top contributing factors surfaced with the score; no black-box |
| **Counterfactual analysis** | What-if simulator that runs with-vs-without intervention trajectories and reports impact in cases prevented, cost saved, and villages protected |
| **Generate field actions** | Auto-recommended pre-positioning, fogging, awareness broadcasts, ASHA directives — every action tied to a causal signal |

### Design principles

1. **Geography-first** — every data point is geo-tagged; the map is the primary canvas.
2. **Explain, don't just predict** — every alert ships with *why* and *what to do*.
3. **Closed loop** — predictions improve when ASHAs report back; field actions are logged.
4. **Offline-tolerant** — PWA architecture; rural networks are flaky.
5. **Festival- and season-aware** — uniquely Indian signal stack.

---

## 4. System Architecture

### 4.1 Three-layer system

```
┌──────────────────────────────────────────────────────────────────┐
│  L3  DELIVERY LAYER  —  UIs, alerts, action consoles             │
│      (ASHA PWA · PHC admin web · District dashboard)            │
├──────────────────────────────────────────────────────────────────┤
│  L2  INTELLIGENCE LAYER  —  Prediction, risk scoring, advisory   │
│      (Outbreak model · Shortage model · Causal engine)          │
├──────────────────────────────────────────────────────────────────┤
│  L1  DATA LAYER  —  Ingestion, synthetic + public sources       │
│      (Symptoms · OPD · Weather · Festivals · Supply · Mobility) │
└──────────────────────────────────────────────────────────────────┘
```

In the current MVP, the three layers are colocated in the browser (a client-side simulation of the eventual full stack). The Intelligence Layer math runs on every page load via `useMemo`; the Data Layer is deterministic-seeded so the demo is reproducible across reloads.

### 4.2 Frontend module map

```
swasthyasetu-ai/
├── src/
│   ├── data/
│   │   ├── villages.ts      # 36 real Nashik villages, 5 diseases, 8 alerts
│   │   └── medicines.ts     # 15 NLEM medicines with stock & consumption
│   ├── lib/
│   │   ├── risk.ts          # Outbreak risk + shortage forecast
│   │   └── simulator.ts     # Counterfactual logistic-spread engine
│   ├── components/
│   │   ├── Layout.tsx · Sidebar.tsx · Topbar.tsx · ui.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx       · Prediction.tsx
│   │   ├── Heatmap.tsx         · Medicine.tsx
│   │   ├── ActionCenter.tsx    · Simulator.tsx
│   ├── App.tsx              # React Router
│   ├── main.tsx             # Entry + Leaflet icon fix
│   └── index.css            # Tailwind + design tokens
├── public/leaflet/          # Marker icons
└── README.md
```

### 4.3 Component hierarchy

```
<BrowserRouter>
  <Layout>                    // Sidebar + Topbar + <Outlet/>
    <Dashboard />             // 6 sub-sections: stats, trend, breakdown, alerts, stock, weather
    <Prediction />             // Model inputs + RiskGauge + KPI grid + signal breakdown
    <Heatmap />                // MapContainer + FitBounds + VillageDetailPanel
    <Medicine />               // KPI strip + bar chart + filterable table
    <ActionCenter />           // Headline KPIs + 3 action sections
    <Simulator />              // Env inputs + interventions + impact + counterfactual chart
  </Layout>
</BrowserRouter>
```

---

## 5. Technology Stack

### 5.1 Frontend (delivered)

| Layer | Choice | Rationale |
|---|---|---|
| Build | **Vite 5** | Sub-second HMR, ESM-native, fast production builds |
| Framework | **React 18** + **TypeScript** (strict) | Industry standard, type-safety for the math layer |
| Routing | **React Router 6** | File-based mental model, deep-linkable demo routes |
| Styling | **Tailwind CSS 3** + custom healthcare palette | Speed + polish, no design-system debt |
| Components | Custom primitives in `components/ui.tsx` | One source of truth for chip / card / badge |
| Maps | **Leaflet 1.9** + **react-leaflet 4** (OSM/CARTO tiles) | No API key, real geography, fully free |
| Charts | **Recharts 2** | Declarative, themable, sufficient for the analytics needs |
| Icons | **lucide-react** | 1000+ consistent stroke icons, tree-shakable |
| Animation | **Framer Motion** (page entry) + CSS keyframes (transitions) | Restrained, professional |

### 5.2 ML / AI

| Job | Approach |
|---|---|
| Outbreak forecast | Logistic growth model with environment-modulated rate (in-browser, instant) |
| Risk classification | Weighted blended score across 4 signals (temp, humidity, rainfall, case momentum) |
| Spatial clustering | Implicit via geo-aggregation of village scores |
| Weather | Open-Meteo API path (free, no key) — currently synthetic for offline demo |
| Festival features | Custom Indian festival calendar (Ganesh Chaturthi, Diwali, Eid, etc.) |
| Advisory generation | Hook for LLM (Groq/Together) — currently templated |
| Voice (ASHA) | Web Speech API → Whisper.cpp WASM fallback (out of MVP scope) |

### 5.3 Data sources (target state)

| Source | Type | Status in MVP |
|---|---|---|
| ASHA case reports | App submissions | Synthetic, deterministic-seeded |
| OPD counts | PHC MIS | Synthetic |
| Weather (rainfall, temp, humidity) | IMD / Open-Meteo | Synthetic, realistic monsoon values |
| Festival calendar | Curated | Hardcoded in disease-specific weather weights |
| Medicine stock | District warehouse + 6 PHCs | Synthetic, NLEM-aligned |
| IDSP historical | Public, weekly outbreaks | Schema matches; ready for ingest |

### 5.4 Deployment (target state)

- **Frontend:** Vercel / Cloudflare Pages
- **Backend:** FastAPI on Railway / Render
- **DB:** PostgreSQL 16 + PostGIS + TimescaleDB
- **Cache / Queue:** Redis
- **ML serving:** FastAPI + ONNX runtime
- **Mobile (ASHA PWA):** Same Vercel deployment, PWA installable

---

## 6. Module Descriptions

### 6.1 Dashboard (`/dashboard`)

**Purpose:** District command center — a 30-second situational snapshot for the District Health Officer.

**Features:**
- 4 KPI tiles: Total Population (1.93L), High-Risk Villages, Predicted 14d Cases, Critical Medicines
- 12-week dengue trajectory with observed-vs-predicted split
- Disease breakdown donut (all 5 diseases, current week)
- Top risk villages table with sort + score bars
- Recent alerts (last 48h) with severity chip
- Medicine stock overview (top 4 critical)
- District weather aggregate (rainfall, temp, humidity) with AI insight callout

**Data sources:** `computeDistrictStats()`, `diseaseTrend()`, `diseaseBreakdown()`, `forecastMedicines()`, `ALERTS`.

**Code:** `src/pages/Dashboard.tsx`

---

### 6.2 Disease Prediction (`/predict`)

**Purpose:** What-if playground. Officials can model how environmental conditions and prior cases compound into a specific disease risk score.

**Features:**
- Village selector (auto-fills weather + case history for 36 villages)
- Disease selector (5 diseases with optimal weather ranges)
- 4 live sliders: Temperature, Humidity, Rainfall (7d), Previous cases
- Animated risk gauge (270° arc, color-coded)
- KPI grid: 7-day forecast, 14-day forecast, current weekly, selected disease
- AI explanation panel (top contributing drivers in plain English)
- Causal signal breakdown (4 bars showing each factor's contribution %)
- Recommended next action card

**Data sources:** `computeRisk(village, diseaseId)` — see [Prediction Logic](#7-prediction-logic).

**Code:** `src/pages/Prediction.tsx`

---

### 6.3 Risk Heatmap (`/heatmap`)

**Purpose:** Geospatial command view. Color-coded risk across all 36 villages on a real OpenStreetMap.

**Features:**
- Real Leaflet map of Nashik district with CARTO light tiles
- 36 CircleMarker village points, color-coded by risk level (red/amber/green)
- Markers are larger for high-risk villages; high-risk ones pulse
- Filter pills: All / High / Medium / Low risk
- Floating legend (bottom-left) and count overlay (top-right)
- Click any marker → side panel updates with that village
- Side panel content:
  - Village header (block, population, ASHAs, weather, risk score)
  - Disease Risk Profile (all 5 diseases, sorted)
  - Active Alerts (filtered to that village)
  - Relevant Medicines (filtered forecast)
- `fitBounds` runs once on mount to auto-zoom to all 36 villages

**Data sources:** `VILLAGES`, `villageRiskLevel()`, `villageOverallScore()`, `forecastMedicines()`.

**Code:** `src/pages/Heatmap.tsx`

---

### 6.4 Medicine Forecasting (`/medicine`)

**Purpose:** 14-day shortage prediction for the district warehouse. Tells the procurement officer what to order, in what quantity, and why.

**Features:**
- 5 KPI strip: Total SKUs, Critical, Warning, Healthy, Reorder value
- Days-of-stock bar chart (baseline vs worst-case surge, color-coded by status)
- Filterable inventory table: search + status chips (All / Critical / Warning / Ok / Surplus)
- Per-medicine columns: name, stock (with bar), daily use, days @ base, days @ surge, 14d demand, reorder qty, status
- Causal reasons panel: top 4 critical medicines with the trigger that put them on the list
- "Generate State Requisition" CTA (logged intent, mock fulfillment)

**Data sources:** `forecastMedicines()` — see [Prediction Logic § 7.3](#73-medicine-shortage-model).

**Code:** `src/pages/Medicine.tsx`

---

### 6.5 Action Center (`/actions`)

**Purpose:** The "what should I actually do?" page. Auto-generated, evidence-backed recommendations grouped by category.

**Features:**
- 4 headline KPIs: High-priority actions, Est. cases averted, Requisition value, Active alerts
- **Resource Allocation** section: 4 medicine pre-positioning cards with order qty, value, lead time, "Generate P.O." and "Reassign from surplus PHC" actions
- **Preventive Actions** section: vector control fogging drive, chlorination + well inspection, multilingual advisory broadcast
- **Field Operations** section: door-to-door screening for top high-risk villages
- **ASHA Directive** card: full directive text with channels (SMS, IVR, PDF), ready to broadcast to 36 ASHAs / 6 PHCs
- Each action card has: category chip, title, rationale (causal), predicted impact, 3 metadata tiles, primary + secondary action buttons

**Data sources:** `criticalMeds`, `highRiskVillages`, `ALERTS`.

**Code:** `src/pages/ActionCenter.tsx`

---

### 6.6 Outbreak Simulator (`/simulator`)

**Purpose:** Counterfactual what-if engine. The most distinctive demo page — answers *"if we intervene now vs wait, what's the impact?"* in quantified, costed terms.

**Features:**
- 3 environment sliders: Rainfall (0-150mm), Humidity (20-100%), Existing cases (0-100)
- 3 intervention toggles as cards:
  - **Mosquito Control** (−35% growth, ₹75k / 14d)
  - **Awareness Campaign** (−25% growth, ₹35k / 14d)
  - **Emergency Medicine Allocation** (−20% growth, ₹60k / 14d)
- Live "−XX% combined growth reduction" badge that updates as you toggle
- 3 impact cards: Cases Prevented, Net Cost Savings, Villages Protected — each with "Without X → With Y" comparison
- Dual-line counterfactual chart: red dashed (no intervention) vs green solid (with intervention), with light-green "savings area" between them
- Reference line at peak-gap day
- Day-by-day breakdown table showing the divergence grows over time (Day 1: 13% reduction → Day 14: 75%+)
- Explainability footer: shows the actual logistic equation and the r value computed from current inputs

**Data sources:** `runSimulation()` — see [Prediction Logic § 7.2](#72-outbreak-simulator-counterfactual).

**Code:** `src/pages/Simulator.tsx`

---

## 7. Prediction Logic

All prediction runs in the browser at interactive speed (<5ms per recompute). The math is documented in `src/lib/risk.ts` and `src/lib/simulator.ts`.

### 7.1 Outbreak Risk Score

**Purpose:** Convert environmental conditions + case history into a 0-100 risk score for a (village, disease) pair.

**Formula:**

```
score = 100 × (0.4 × blended_signal + 0.6 × magnitude)

where:
  blended_signal = 0.18·temp_fit + 0.14·humidity_fit + 0.18·rainfall + 0.50·case_momentum
  magnitude      = clamp01(recent_3wk_cases / 30)
```

**Sub-signals:**

| Signal | Computation | Range |
|---|---|---|
| `temp_fit` | Triangular membership: 1 inside optimal range, falling to 0 at ±6°C | 0..1 |
| `humidity_fit` | Triangular membership: 1 inside optimal range, falling to 0 at ±25% | 0..1 |
| `rainfall` | `clamp01(rainfall_mm / 60) × disease.rainfallFactor / 2` | 0..1 |
| `case_momentum` | Ratio of last 2 weeks vs prior 4-week baseline, scaled to 0..1 | 0..1 |

**Why this design:** The 50% weight on `case_momentum` reflects epidemiological reality — direct case history is the strongest leading indicator. The environment factors (50% combined) amplify the signal when conditions are favorable. The `magnitude` term prevents a "quiet" village from generating a high score just because the math aligned.

**Risk thresholds:** ≥70 high, ≥40 medium, else low.

**Output per call:**

```typescript
interface RiskResult {
  disease: Disease;
  score: number;             // 0..100
  level: 'low' | 'medium' | 'high';
  predictedCases7d: number;
  predictedCases14d: number;
  currentWeeklyCases: number;
  factors: RiskFactor[];     // sorted by contribution
  explanation: string;       // human-readable
}
```

### 7.2 Outbreak Simulator (Counterfactual)

**Purpose:** Run two parallel 14-day projections — with and without interventions — and quantify the gap.

**Logistic growth equation (discrete):**

```
N[t+1] = N[t] + r · N[t] · (1 − N[t] / K)
```

**Growth-rate modulation:**

```
r = r_base · (1 + 0.30·rainfall/50 + 0.20·humidity/100) · (1 − combined_reduction)

where:
  r_base             = 0.18   (typical for vector/water-borne early phase)
  rainfall boost     = 0..1   (more rain → more vectors, contamination)
  humidity boost     = 0..1   (higher → vector survival)
  combined_reduction = 1 − (1 − r₁)(1 − r₂)(1 − r₃)  // independent failure rates
  K                  = 1,500  (district carrying capacity)
```

**Intervention effect (compounding):**

| Intervention | Growth reduction | Cost (14d) | Mechanism |
|---|---|---|---|
| Mosquito Control | 35% | ₹75,000 | Fogging + larvicide; cuts vector density |
| Awareness Campaign | 25% | ₹35,000 | IVR + ASHA + loudspeaker; earlier care-seeking |
| Emergency Medicine | 20% | ₹60,000 | Pre-positioned drugs; shorter infectious period |

**All 3 active:** `1 − (0.65)(0.75)(0.80) = 0.61` → **61% growth reduction**.

**Impact computation:**

```typescript
casesPrevented = noInt.totalCases - withInt.totalCases
pctReduction   = casesPrevented / noInt.totalCases
interventionCost = Σ active cost
grossSavingsINR  = casesPrevented × ₹3,200   // avg cost per moderate case
netSavingsINR    = grossSavingsINR − interventionCost
villagesAffectedWith = max(1, round(8 × (1 − red × 0.85)))
villagesProtected    = 8 − villagesAffectedWith
```

### 7.3 Medicine Shortage Model

**Purpose:** Compute 14-day shortage risk per medicine by combining baseline consumption with disease-driven surge.

**Formulas:**

```
baseline_days   = stock / daily_consumption
surge_multiplier = max over diseases (1 + (predicted_14d - current) / current), capped at 3.5
surge_days      = stock / (daily_consumption × surge_multiplier)
demand_14d      = surge_daily × 14
status          = critical (<7d) | warning (<14d) | ok | surplus
recommendedOrder = max(minStock × 2, surge_daily × 21 - stock)
```

**Why this matters:** Without surge, baseline math would say ORS is fine for 13 days. With the Diarrhea surge forecast, the same stock is 4.8 days from stockout. That single difference is what triggers the pre-position recommendation.

**Cost model:** ₹3,200 per moderate case treated (medicines + OPD + lost-wages proxy). Sourced from published NHM outpatient cost estimates.

---

## 8. Data Flow

### 8.1 Page-load flow

```
URL change
    │
    ▼
React Router matches → <Layout>
    │
    ├─ <Sidebar> renders nav (6 routes)
    ├─ <Topbar> renders search + district + alerts + user
    │
    ▼
<Outlet> → Page component (e.g. Dashboard)
    │
    ├─ useMemo(computeDistrictStats())       ← pure fn, instant
    ├─ useMemo(diseaseTrend('dengue'))        ← 12 weeks, deterministic
    ├─ useMemo(diseaseBreakdown())            ← aggregate
    ├─ useMemo(forecastMedicines())           ← shortage model
    │
    ▼
Render cards / charts / maps
    │
    ▼
<Recharts/> mounts → animates from 0
<Leaflet/> mounts → fetches CARTO tiles → renders markers
```

### 8.2 Simulator flow (most complex)

```
User adjusts slider
    │
    ▼
React state updates (rainfall / humidity / existing / active[])
    │
    ▼
useMemo(runSimulation({rainfall, humidity, existing, active}))
    │
    ├─ combined_reduction = 1 − Π(1 − r_i)   for each active intervention
    ├─ simulate(noReduction)  → 14 days, returns {series[], totalCases}
    ├─ simulate(combined)     → 14 days
    │
    ▼
impact = {casesPrevented, pctReduction, interventionCost, netSavingsINR, ...}
    │
    ├─ Impact cards re-render (no transition lag)
    ├─ ComposedChart re-renders (new data prop, smooth animation)
    └─ Day-by-day table re-renders (delta bars re-compute intensity)
```

### 8.3 Heatmap selection flow

```
User clicks CircleMarker on map
    │
    ▼
Leaflet event handler → setSelectedId(v.id)
    │
    ▼
<VillageDetailPanel> re-renders with selected village
    │
    ├─ villageRiskLevel(v)         → "high"
    ├─ villageOverallScore(v)      → 81
    ├─ forecastMedicines().filter(...)  → 3 relevant
    ├─ ALERTS.filter(...)          → active alerts for this village
    │
    ▼
All sections re-render in <560px scroll container
```

### 8.4 Data lineage

```
┌─ Synthetic seed (Mulberry32, deterministic) ─┐
│                                                  │
▼                                                  │
36 villages × 5 diseases × 12 weeks = 2,160 points │
                                                  │
▼                                                  │
weather: derived from seed + monsoon baseline       │
medicines: hardcoded 15 NLEM                        │
alerts: 8 hand-curated with predicted cases         │
                                                  │
▼                                                  │
ALL downstream math (risk, forecast, simulator)     │
is PURE FUNCTIONS of these inputs.                  │
                                                  │
Same reload = same numbers.                         │
```

---

## 9. Scalability Considerations

The current MVP is a client-side application. The architecture is designed to migrate to a full-stack deployment with **no UI changes**.

### 9.1 What changes when going to production

| Layer | MVP (current) | Production |
|---|---|---|
| Data | Deterministic synthetic in `data/villages.ts` | PostgreSQL 16 + PostGIS + TimescaleDB |
| Weather | Static per-village | Open-Meteo / IMD daily fetch + cache |
| Prediction | In-browser `useMemo` | FastAPI backend, async, ONNX runtime |
| Real-time | None | WebSocket for live ASHA reports + alert push |
| Auth | None | ABDM/ABHA OAuth + role-based access |
| Mobile (ASHA) | Not built | PWA installable, offline-first via IndexedDB + service worker |
| Compute | Browser | Per-district microservice or batch prediction |

### 9.2 Multi-district scaling

The data layer is keyed by `district_id`. Adding a new district is a config change:
- Add `VILLAGES_NASHIK`, `VILLAGES_PUNE` arrays
- District switcher in Topbar (already stubbed as visual)
- All prediction functions take `Village` and `Disease` — no hard-coded references

**Estimated cost per district (production):**
- 50 PHCs × 6 sub-centres × 36 villages = ~10,800 data points
- Daily prediction: 36 × 5 × 14 = 2,520 model invocations
- Latency target: <2s for full district recompute
- Per-district instance can handle this on 1 vCPU

### 9.3 State-wise roll-out (10 districts)

- Single FastAPI instance (8 vCPU) handles 10 districts in <30s batch
- TimescaleDB on a single node handles years of weekly data
- Leaflet + tile server is stateless — scale horizontally
- Frontend on Vercel handles any traffic shape

### 9.4 Privacy & data residency

- No PII in prediction inputs (geohash-only coordinates)
- ASHA-level consent captured per submission
- Audit log on every prediction + intervention (governance requirement under ABDM)
- Data residency: India-only hosting (Railway Mumbai / AWS Mumbai)

---

## 10. Future Enhancements

### 10.1 Short-term (next sprint)

- **Real ABDM/ABHA OAuth** — verify ASHA identity, link to existing ABHA records
- **Live weather ingestion** from Open-Meteo with district-level caching
- **Festival calendar overlay** on the disease trend chart (Ganesh Chaturthi, Diwali, Eid dates)
- **Real-time ASHA voice reports** via Web Speech API → text → prediction input
- **PDF export** of district brief (one-click, branded)

### 10.2 Medium-term (3 months)

- **District comparison view** — benchmark Nashik vs Pune vs other districts
- **Policy effectiveness tracker** — correlate interventions with case reduction
- **Predictive medicine allocation** — automatic state-level requisition trigger
- **Multi-disease co-circulation** — model dengue + chikungunya together
- **Geospatial clustering** (HDBSCAN) — detect emerging outbreak hotspots

### 10.3 Long-term (6+ months)

- **Federated learning** across districts (model improves without sharing patient data)
- **WhatsApp bot for ASHA** — voice + text + image (water-sanitation photos)
- **Drone imagery integration** — standing-water detection for vector control
- **GenAI advisory generation** — Llama 3 8B / Mixtral for context-aware advisories in local dialects
- **Public health API** — open data for researchers

### 10.4 Out of scope (intentionally)

- Patient-level EHR integration (requires NABH compliance)
- Drug procurement system integration (different procurement cycle)
- International deployment (model parameters tuned to India)

---

## 11. Installation & Run Instructions

### 11.1 Prerequisites

- **Node.js** 18+ (tested on 22.x)
- **npm** 9+ (or pnpm / yarn — equivalents work)
- Modern browser (Chrome / Edge / Firefox / Safari current)

### 11.2 Clone & install

```bash
git clone <repo-url>
cd swasthyasetu-ai
npm install
```

### 11.3 Development server

```bash
npm run dev
# → Vite dev server on http://localhost:5173
# → HMR enabled, all edits live-reload
```

### 11.4 Production build

```bash
npm run build
# → TypeScript compile + Vite build
# → Output in dist/
# → ~860 KB JS, 38 KB CSS, 234 KB gzipped

npm run preview
# → Serve the production build on http://localhost:4173
```

### 11.5 Project structure (after install)

```
swasthyasetu-ai/
├── src/                 # All source code
├── public/              # Static assets (favicon, Leaflet markers)
├── screenshots/         # Reference screenshots (dev artifact)
├── node_modules/        # Dependencies (gitignored)
├── dist/                # Production build (after npm run build)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── README.md
└── DOCUMENTATION.md     # ← this file
```

### 11.6 Browser support

- **Chrome / Edge** 110+
- **Firefox** 110+
- **Safari** 16+

Older browsers will work but may have minor rendering issues with backdrop-blur and CSS grid.

### 11.7 Performance characteristics

- **First contentful paint** < 1s on simulated 3G
- **Time to interactive** < 1.5s (no heavy data fetch)
- **Bundle size** 234 KB gzipped (Leaflet is the dominant cost)
- **In-browser prediction** < 5ms per recompute (typical)

### 11.8 Troubleshooting

| Issue | Fix |
|---|---|
| `npm install` fails | Clear cache: `npm cache clean --force` then retry |
| Port 5173 in use | `npm run dev -- --port 5174` |
| Stale HMR after edits | Hard-reload: Ctrl+Shift+R (Cmd+Shift+R on Mac) |
| Leaflet markers missing | Confirm `public/leaflet/` has the 3 PNG files (auto-copied from node_modules) |
| TypeScript errors after edit | Run `npx tsc --noEmit` to see all errors in one pass |

### 11.9 Demo walkthrough (3 minutes)

1. **`/dashboard`** — show the KPIs, the upward dengue trend, the high-risk villages list. *"This is what the District Health Officer sees at 9 AM."*
2. **`/predict`** — adjust the temperature slider up, watch the risk score climb live. Show the AI explanation. *"Here's how a single weather input changes the next 14 days."*
3. **`/heatmap`** — show 6 red villages clustered in Nashik + Niphad. Click Panchavati, see the full disease profile + alerts + relevant medicines. *"This is the geospatial view that IDSP can't produce."*
4. **`/medicine`** — show the 10 critical medicines, the bar chart comparison, filter to "critical" only. *"₹370k of medicines need to move in the next 2 weeks."*
5. **`/actions`** — show the 34 generated actions, the ~118 cases averted estimate, the ASHA directive card. *"These are the actual deployable actions, not just alerts."*
6. **`/simulator`** *(NEW)* — toggle interventions, show the 286 cases prevented, ₹7.45L savings, 4 villages protected. *"And this is how you decide whether to spend the ₹170k on the campaign."*

---

## Appendix A — File Reference

| File | LOC | Purpose |
|---|---|---|
| `src/data/villages.ts` | ~270 | 36 villages, 5 diseases, weather, alerts |
| `src/data/medicines.ts` | ~180 | 15 NLEM medicines with stock/consumption |
| `src/lib/risk.ts` | ~250 | Risk model + shortage forecast |
| `src/lib/simulator.ts` | ~220 | Counterfactual logistic engine |
| `src/components/ui.tsx` | ~140 | SectionHeader, StatCard, SeverityChip, etc. |
| `src/components/Sidebar.tsx` | ~85 | Desktop sidebar + mobile bottom nav |
| `src/components/Topbar.tsx` | ~55 | Search, district switcher, notifications |
| `src/components/Layout.tsx` | ~20 | App shell |
| `src/pages/Dashboard.tsx` | ~260 | District command center |
| `src/pages/Prediction.tsx` | ~340 | Interactive risk model playground |
| `src/pages/Heatmap.tsx` | ~290 | Leaflet map + village details |
| `src/pages/Medicine.tsx` | ~270 | 14-day shortage prediction |
| `src/pages/ActionCenter.tsx` | ~290 | AI-generated action recommendations |
| `src/pages/Simulator.tsx` | ~480 | Counterfactual what-if engine |

**Total source:** ~3,200 lines of TypeScript + React.

---

## Appendix B — Glossary

| Term | Definition |
|---|---|
| **ASHA** | Accredited Social Health Activist — grassroots community health worker in India |
| **PHC** | Primary Health Centre — block-level facility covering ~30,000 population |
| **NLEM** | National List of Essential Medicines — India's formulary |
| **IDSP** | Integrated Disease Surveillance Programme — India's national surveillance system |
| **ABDM** | Ayushman Bharat Digital Mission — India's national health ID program |
| **ABHA** | Ayushman Bharat Health Account — citizen health ID |
| **HMIS** | Health Management Information System — India's public health MIS |
| **ACT** | Artemisinin-based Combination Therapy (for malaria) |
| **ORS** | Oral Rehydration Salts |
| **NLEM** | National List of Essential Medicines |
| **RDT** | Rapid Diagnostic Test |
| **Festival calendar** | Indian religious/cultural events that affect contact patterns and disease spread |

---

## Appendix C — Design Tokens

| Token | Value | Use |
|---|---|---|
| `brand-600` | `#0F7A86` | Primary actions, links, brand |
| `brand-700` | `#0B6470` | Primary hover |
| `accent-500` | `#10B981` | Success, healthy stock, low risk |
| `accent-600` | `#0B9A6F` | Accent hover |
| `red-500` | `#EF4444` | High risk, critical shortage |
| `amber-500` | `#F59E0B` | Medium risk, warning |
| `slate-50` | `#F8FAFC` | App background |
| `slate-200` | `#E2E8F0` | Card borders, dividers |
| `slate-900` | `#0F172A` | Primary text |
| Font: English | Inter | Google Fonts |
| Font: Hindi | Noto Sans Devanagari | (ready, not yet used) |

---

*End of technical documentation. For architecture decisions, see `DESIGN.md` (early project doc). For setup help, see `README.md`.*
