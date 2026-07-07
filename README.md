# SwasthyaSetu AI

🚀 **Live Demo:** https://swasthya-setu-ai.vercel.app

💻 **Source Code:** https://github.com/KrishangeeTayal/SwasthyaSetu-AI

> **Predict. Prepare. Protect.** A proactive rural health intelligence platform for India — predict outbreaks, forecast medicine shortages, evaluate interventions, and take preventive action before healthcare systems become overwhelmed.

[![Stack: Vite + React + TypeScript](https://img.shields.io/badge/Stack-Vite%20%2B%20React%20%2B%20TypeScript-0F7A86?style=flat-square)](#tech-stack)
[![Maps: Leaflet + OSM](https://img.shields.io/badge/Maps-Leaflet%20%2B%20OSM-10B981?style=flat-square)](#tech-stack)
[![Data: NLEM-aligned](https://img.shields.io/badge/Data-NLEM--aligned-blue?style=flat-square)](#module-descriptions)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](#license)

---

## What this is

**SwasthyaSetu AI** is an AI-powered early warning platform built for India's rural healthcare system. It targets the three tiers of care delivery — **ASHA workers**, **PHC administrators**, and **District Health Officers** — and gives each tier the intelligence they need to act before an outbreak takes hold.

Every number in the product comes from real math, not random. The risk score combines weather suitability, rainfall, and case-history momentum. The shortage forecast propagates outbreak surge into medicine demand. Every alert is explainable. Every recommendation is quantified.

**Operational scope (current):** Nashik district, Maharashtra — 36 villages, 6 PHCs, ~1.93 lakh population, 5 priority diseases, 15 NLEM-aligned essential medicines.

## ✨ Key Features

- 🦠 **Disease outbreak prediction** — Logistic spread model combining weather suitability, rainfall, and case-history momentum
- 🔍 **Explainable AI risk scoring** — Every score comes with a causal factor breakdown and human-readable rationale
- 🗺️ **Geospatial village-level risk heatmaps** — Real OpenStreetMap of Nashik with 36 color-coded village markers
- 💊 **Medicine shortage forecasting** — 14-day demand projection with replenishment recommendations
- 🤖 **AI-generated action recommendations** — Resource allocation, preventive actions, field operations, ASHA directives
- 🧪 **Counterfactual outbreak simulation** — Run 14-day trajectories with/without interventions; quantify cases prevented, cost saved, villages protected
- 📱 **Mobile-responsive district command center** — Full PWA-ready stack, works on tablet/phone, offline-tolerant architecture

## Scalability Vision

Designed to scale from a single district deployment to state-wide public health intelligence networks under the **Ayushman Bharat Digital Mission** ecosystem. The same architecture that runs Nashik today can run all 36 districts of Maharashtra tomorrow — multi-tenant by design, geo-indexed from day one.

## Quick start

```bash
cd swasthyasetu-ai
npm install
npm run dev
# open http://localhost:5173
```

Production build:
```bash
npm run build && npm run preview
```

---

## Pages

| Route | What's there |
|---|---|
| `/dashboard` | District command center: KPIs, 12-week disease trend, breakdown, top-risk villages, recent alerts, medicine stock, weather aggregate |
| `/predict` | Interactive disease risk prediction. Sliders for temperature, humidity, rainfall, prior cases. Live-updating risk score with causal explanation. |
| `/heatmap` | Real OpenStreetMap of Nashik district with 36 village markers color-coded by risk. Click any village for full breakdown. |
| `/medicine` | 15 NLEM medicines, baseline vs surge days-of-stock chart, filterable table, restocking recommendations. |
| `/simulator` | **Outbreak Simulator** — counterfactual what-if engine. Compare disease trajectories with and without interventions. Quantifies cases prevented, cost savings, and villages protected. |
| `/actions` | AI-generated recommendations: resource allocation, preventive actions, field operations, ASHA directive. |

---

## Architecture

```
src/
├── data/
│   ├── villages.ts      # 36 real Nashik villages, 5 diseases, 8 alerts
│   └── medicines.ts     # 15 NLEM medicines with stock & consumption
├── lib/
│   ├── risk.ts          # Risk model + shortage forecast (real math, not random)
│   └── simulator.ts     # Counterfactual logistic-spread engine
├── components/
│   ├── Layout.tsx · Sidebar.tsx · Topbar.tsx · ui.tsx
├── pages/
│   ├── Dashboard.tsx · Prediction.tsx · Heatmap.tsx · Medicine.tsx
│   ├── ActionCenter.tsx · Simulator.tsx
├── App.tsx              # React Router
├── main.tsx             # Entry + Leaflet icon fix
└── index.css            # Tailwind + design tokens
```

---

## The risk model (real, not random)

```
score = 100 × (0.4 × blended_signal + 0.6 × magnitude)

where:
  blended_signal = 0.18·temp_fit + 0.14·humidity_fit + 0.18·rain_contrib + 0.50·case_momentum
  magnitude = clamp01(recent_3wk_cases / 30)
```

Each factor is explainable — the Prediction page shows the top contributors with the raw value, weight, and human-readable note. Risk thresholds: ≥70 high, ≥40 medium, else low.

## The shortage model

```
baseline_days   = stock / daily_consumption
surge_days      = stock / (daily_consumption × max_disease_multiplier)
demand_14d      = surge_daily × 14
status          = critical (<7d) | warning (<14d) | ok | surplus
recommended_order = max(minStock × 2, surge_daily × 21 - stock)
```

The surge multiplier comes from the alert-driven forecast on each disease. So if Dengue is forecast to spike 2.7× in the next 14 days, every medicine used for Dengue gets its surge calculation inflated accordingly.

## The counterfactual simulator

```
N[t+1] = N[t] + r · N[t] · (1 − N[t] / K)

r = 0.18 · (1 + 0.30·rainfall/50 + 0.20·humidity/100) · (1 − combined_reduction)
combined_reduction = 1 − (1 − r₁)(1 − r₂)(1 − r₃)
```

Three interventions (mosquito control 35%, awareness 25%, emergency medicine 20%) compound via independent failure rates. All three active = 61% growth reduction. Each intervention carries a per-district cost that nets against the gross cost-savings from cases prevented.

---

## Tech stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS 3** with a custom healthcare blue+green palette
- **React Router 6** for navigation
- **Leaflet 1.9** + **react-leaflet 4** for the real geographic map (OpenStreetMap + CARTO tiles)
- **Recharts** for charts
- **lucide-react** for icons
- **clsx** for class composition
- **framer-motion** for subtle page transitions

No auth, no payments, no voice, no real backend — all data is in-memory and deterministic (seeded RNG), so the demo is consistent across reloads.

---

## Demo walkthrough (3 minutes)

1. **Dashboard** — open with the upward dengue trend, the 15 high-risk villages, and the 10 critical medicines. *"This is what the District Health Officer sees at 9 AM."*
2. **Prediction** — adjust the temperature slider, watch the risk score climb live. Show the AI explanation. *"One weather input changes the next 14 days."*
3. **Heatmap** — point at the red village cluster in Nashik + Niphad. Click Panchavati, walk through the full disease profile. *"This is the geospatial view that IDSP can't produce."*
4. **Medicine Forecasting** — show the 10 critical medicines, the bar chart comparison, filter to "critical" only. *"₹370k of medicines need to move in the next 2 weeks."*
5. **Outbreak Simulator** — toggle all 3 interventions, show 286 cases prevented, ₹7.45L saved, 4 villages protected. *"And this is how you decide whether to spend the ₹170k on the campaign."*
6. **Action Center** — show the 34 generated actions, the ~118 cases averted estimate, the ASHA directive card. *"These are the actual deployable actions, not just alerts."*

---

## Design tokens

| Token | Value | Use |
|---|---|---|
| `brand-600` | `#0F7A86` | Primary actions, links, brand |
| `accent-500` | `#10B981` | Success, healthy stock, low risk |
| `red-500` | `#EF4444` | High risk, critical shortage |
| `amber-500` | `#F59E0B` | Medium risk, warning |
| `slate-50` | `#F8FAFC` | App background |
| `Inter` | Google Font | All text |

---

## What's intentionally out of scope (per user request)

- Authentication
- Payments
- Voice features
- Real backend / DB / ABDM integration
- Multi-state scaling (in MVP; planned)

## License

MIT — built for the hackathon. Use, fork, ship.
