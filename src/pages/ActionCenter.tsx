import { useMemo } from 'react';
import {
  Pill, Megaphone, Truck, Users, Droplets, Bug, ShieldCheck, CheckCircle2,
  Zap, ArrowRight, Sparkles,
} from 'lucide-react';
import { PageHeader, RiskBadge, SeverityChip } from '@/components/ui';
import { computeRisk, forecastMedicines, villageRiskLevel } from '@/lib/risk';
import { VILLAGES, ALERTS, DISEASES, villageById, type DiseaseId } from '@/data/villages';

export default function ActionCenter() {
  const forecasts = useMemo(() => forecastMedicines(), []);
  const criticalMeds = forecasts.filter(f => f.status === 'critical' || f.status === 'warning');
  const highRiskVillages = useMemo(() =>
    VILLAGES.filter(v => villageRiskLevel(v) === 'high').map(v => ({
      v,
      topDisease: (Object.keys(DISEASES) as DiseaseId[])
        .map(id => ({ id, score: computeRisk(v, id).score }))
        .sort((a, b) => b.score - a.score)[0],
    })),
    []);

  const totalDemandINR = criticalMeds.reduce((s, f) => s + f.recommendedOrder * f.medicine.unitCostINR, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="AI Operations Console"
        title="Action Center"
        description="Auto-generated, evidence-backed actions. Each recommendation links to the signal that triggered it and the predicted impact."
        action={
          <div className="flex gap-2">
            <button className="btn-ghost border border-slate-200">Export brief</button>
            <button className="btn-primary">
              <Sparkles className="w-4 h-4" /> Approve all critical
            </button>
          </div>
        }
      />

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Headline label="High-priority actions" value={criticalMeds.length + highRiskVillages.length + 4} hint="generated today" accent="danger" icon={Zap} />
        <Headline label="Est. cases averted" value="~118" hint="if actions approved by EOD" accent="accent" icon={ShieldCheck} />
        <Headline label="Requisition value" value={`₹${(totalDemandINR / 1000).toFixed(1)}k`} hint="medicines + logistics" accent="brand" icon={Pill} />
        <Headline label="Active alerts" value={ALERTS.length} hint={`${ALERTS.filter(a => a.severity === 'critical').length} critical`} accent="warn" icon={Megaphone} />
      </div>

      {/* Section: Resource allocation */}
      <Section
        title="Resource Allocation"
        subtitle="Pre-position medicines, balance stocks between PHCs, and pre-stage diagnostic kits."
        icon={Truck}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {criticalMeds.slice(0, 4).map(f => (
            <ActionCard
              key={f.medicine.id}
              category="Medicine"
              categoryColor="bg-brand-100 text-brand-700"
              title={`Pre-position ${f.medicine.name}`}
              rationale={f.reason}
              impact={`Prevents stockout in ${Math.round(f.surgeDays)} days · serves ${f.medicine.treats.length} disease pathways`}
              actions={[
                { label: 'Generate P.O.', primary: true },
                { label: 'Reassign from surplus PHC', primary: false },
              ]}
              metadata={[
                { label: 'Order qty', value: f.recommendedOrder.toLocaleString() },
                { label: 'Value', value: `₹${((f.recommendedOrder * f.medicine.unitCostINR) / 1000).toFixed(1)}k` },
                { label: 'Lead time', value: `${f.medicine.leadTimeDays}d` },
              ]}
            />
          ))}
        </div>
      </Section>

      {/* Section: Preventive actions */}
      <Section
        title="Preventive Actions"
        subtitle="Community-level measures triggered by the forecast — broadcast advisories, sanitation drives, vector control."
        icon={ShieldCheck}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActionCard
            category="Vector Control"
            categoryColor="bg-red-100 text-red-700"
            title="Fogging drive · Nashik + Sinnar blocks"
            rationale="Humidity >80% across 6 villages + 27 dengue cases forecast in 14 days. Stagnant water likely post-monsoon."
            impact="Reduces mosquito index by ~40% · covers 18,400 residents"
            actions={[
              { label: 'Schedule today', primary: true },
              { label: 'Assign team', primary: false },
            ]}
            metadata={[
              { label: 'Villages', value: '6' },
              { label: 'Teams', value: '3' },
              { label: 'Cost', value: '₹12.4k' },
            ]}
          />
          <ActionCard
            category="Water Safety"
            categoryColor="bg-cyan-100 text-cyan-700"
            title="Chlorination + well inspection"
            rationale="Niphad and Yeola show diarrheal clusters consistent with contaminated open wells. 22 + 6 cases this week."
            impact="Targets 14 wells · serves 23,000 residents"
            actions={[
              { label: 'Dispatch team', primary: true },
              { label: 'Notify sarpanch', primary: false },
            ]}
            metadata={[
              { label: 'Wells', value: '14' },
              { label: 'Tablets', value: '2,400' },
              { label: 'ETA', value: '36h' },
            ]}
          />
          <ActionCard
            category="Community Messaging"
            categoryColor="bg-accent-100 text-accent-700"
            title="Broadcast multilingual advisory"
            rationale="High dengue + respiratory risk across Dindori and Igatpuri. Pre-approved messages ready in Hindi + Marathi."
            impact="Reaches ~32k households via IVR + ASHA + loudspeaker"
            actions={[
              { label: 'Broadcast now', primary: true },
              { label: 'Preview script', primary: false },
            ]}
            metadata={[
              { label: 'Channels', value: 'IVR · ASHA' },
              { label: 'Languages', value: 'Hi · Mr' },
              { label: 'Recipients', value: '32k HH' },
            ]}
          />
        </div>
      </Section>

      {/* Section: Field actions */}
      <Section
        title="Field Operations"
        subtitle="Surge ASHA screening and PHC surge capacity in villages above risk threshold."
        icon={Users}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {highRiskVillages.slice(0, 4).map(({ v, topDisease }) => (
            <ActionCard
              key={v.id}
              category="Field Surveillance"
              categoryColor="bg-violet-100 text-violet-700"
              title={`Door-to-door screening — ${v.name}`}
              rationale={`Highest district risk score for ${DISEASES[topDisease.id].name} (${topDisease.score}/100). Population ${v.population.toLocaleString()} across ${v.ashaCount} ASHA workers.`}
              impact="Catches pre-symptomatic cases 5–7 days earlier vs passive reporting"
              actions={[
                { label: 'Notify ASHA team', primary: true },
                { label: 'View village', primary: false },
              ]}
              metadata={[
                { label: 'Block', value: v.block },
                { label: 'Households', value: Math.round(v.population / 4.5).toLocaleString() },
                { label: 'Top disease', value: DISEASES[topDisease.id].name },
              ]}
              badge={<RiskBadge level="high" />}
            />
          ))}
        </div>
      </Section>

      {/* Section: ASHA directives */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-700 via-brand-700 to-brand-800 border-0 text-white shadow-xl shadow-brand-900/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-brand-100 font-semibold mb-1">Today's ASHA directive</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">36 ASHA workers · 6 PHCs · Nashik district</h3>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed mb-4 max-w-3xl">
              "Active surveillance for <b className="text-white">dengue and diarrheal disease</b> in Panchavati, Niphad Town, Dindori and Trimbak. Report symptomatic cases via weekly sync. Distribute ORS proactively to households with children under 5."
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/20">📱 SMS ready</span>
              <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/20">📞 IVR Hindi + Marathi</span>
              <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/20">📋 Print-ready PDF</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-accent"><Megaphone className="w-4 h-4" /> Send to all ASHAs</button>
              <button className="btn-ghost text-white hover:bg-white/10">Preview message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Pieces ----------

function Headline({ label, value, hint, accent, icon: Icon }: {
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
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.bg}`}>
          <Icon className={`w-5 h-5 ${styles.text}`} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon className="w-4 h-4" strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

interface ActionCardProps {
  category: string;
  categoryColor: string;
  title: string;
  rationale: string;
  impact: string;
  actions: Array<{ label: string; primary: boolean }>;
  metadata: Array<{ label: string; value: React.ReactNode }>;
  badge?: React.ReactNode;
}

function ActionCard({ category, categoryColor, title, rationale, impact, actions, metadata, badge }: ActionCardProps) {
  return (
    <div className="card p-5 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`chip ${categoryColor}`}>{category}</span>
        {badge}
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{title}</h3>

      <div className="space-y-2.5 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">Rationale</div>
          <p className="text-sm text-slate-600 leading-relaxed">{rationale}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-accent-700 mb-0.5">Predicted impact</div>
          <p className="text-sm text-slate-700 leading-relaxed">{impact}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-slate-100">
        {metadata.map(m => (
          <div key={m.label}>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{m.label}</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {actions.map(a => (
          <button key={a.label} className={a.primary ? 'btn-primary flex-1' : 'btn-ghost border border-slate-200 flex-1'}>
            {a.primary && <CheckCircle2 className="w-4 h-4" />}
            {a.label}
            {a.primary && <ArrowRight className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
