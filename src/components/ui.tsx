import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { RiskLevel } from '@/data/villages';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const styles: Record<RiskLevel, string> = {
    low:    'bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200',
    medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    high:   'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  };
  const labels: Record<RiskLevel, string> = { low: 'Low', medium: 'Medium', high: 'High' };
  return <span className={clsx('chip', styles[level], className)}>{labels[level]} risk</span>;
}

export function StatusDot({ level }: { level: RiskLevel }) {
  const color = level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
  return <span className={clsx('inline-block w-2.5 h-2.5 rounded-full', color, level === 'high' && 'animate-pulse-slow')} />;
}

export function PageHeader({
  eyebrow, title, description, action,
}: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {eyebrow && <div className="text-xs font-semibold tracking-wider uppercase text-brand-600 mb-1">{eyebrow}</div>}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-slate-500 max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Section header used inside a page: small icon tile + title + optional subtitle.
 * Use for grouping cards on Dashboard / Action Center / Simulator / Medicine.
 */
export function SectionHeader({
  title, subtitle, icon: Icon, action, accent = 'brand',
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action?: ReactNode;
  accent?: 'brand' | 'accent' | 'warn' | 'danger';
}) {
  const accentCls = {
    brand:  { bg: 'bg-brand-50',  text: 'text-brand-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warn:   { bg: 'bg-amber-50',  text: 'text-amber-600' },
    danger: { bg: 'bg-red-50',    text: 'text-red-600' },
  }[accent];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', accentCls.bg)}>
        <Icon className={clsx('w-4 h-4', accentCls.text)} strokeWidth={2.4} />
      </div>
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label, value, hint, accent = 'brand', icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'brand' | 'accent' | 'warn' | 'danger';
  icon?: React.ElementType;
}) {
  const styles = {
    brand:  { bg: 'bg-brand-50',  text: 'text-brand-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warn:   { bg: 'bg-amber-50',  text: 'text-amber-600' },
    danger: { bg: 'bg-red-50',    text: 'text-red-600' },
  }[accent];

  return (
    <div className="stat-tile">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 order-2 sm:order-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">{label}</div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-slate-900 num">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        {Icon && (
          <div className={clsx('w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 order-1 sm:order-2 self-start', styles.bg)}>
            <Icon className={clsx('w-4 h-4 sm:w-5 sm:h-5', styles.text)} strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SeverityChip({ severity }: { severity: 'critical' | 'warning' | 'info' }) {
  const map = {
    critical: { class: 'bg-red-50 text-red-700 ring-red-200', Icon: ShieldAlert },
    warning:  { class: 'bg-amber-50 text-amber-700 ring-amber-200', Icon: AlertTriangle },
    info:     { class: 'bg-brand-50 text-brand-700 ring-brand-200', Icon: CheckCircle2 },
  };
  const { class: cls, Icon } = map[severity];
  return (
    <span className={clsx('chip ring-1 ring-inset', cls)}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      {severity}
    </span>
  );
}
