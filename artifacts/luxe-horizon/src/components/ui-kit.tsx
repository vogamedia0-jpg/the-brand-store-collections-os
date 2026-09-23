import type { ReactNode } from 'react';

/** Shared presentational primitives for the admin and public surfaces. */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'dark' | 'gold' | 'warning' | 'success';
}) {
  const styles: Record<string, string> = {
    neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
    dark: 'bg-[var(--brand-navy)] text-[var(--brand-ivory)]',
    gold: 'bg-[var(--brand-gold)]/22 text-[var(--brand-navy)] dark:text-[var(--brand-gold)]',
    warning: 'bg-[var(--brand-beige)] text-[var(--brand-navy)]',
    success: 'bg-[var(--brand-navy)]/10 text-[var(--brand-navy)] dark:bg-[var(--brand-gold)]/15 dark:text-[var(--brand-gold)]',
  };
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.13em] ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function IconButton({
  label,
  children,
  onClick,
  className = '',
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition hover:-translate-y-0.5 hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[var(--brand-gold)]">{icon}</div>
      <h2 className="mt-4 font-display text-2xl text-[hsl(var(--foreground))]">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[var(--brand-gold)]">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl tracking-[-.03em] text-[hsl(var(--foreground))] sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string | number;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${
        accent
          ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-[var(--brand-ivory)]'
          : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))]'
      }`}
    >
      <p className={`font-mono-ui text-[9px] uppercase tracking-[.15em] ${accent ? 'text-[var(--brand-gold)]' : 'text-[hsl(var(--muted-foreground))]'}`}>{label}</p>
      <p className="mt-3 font-display text-3xl sm:text-4xl">{value}</p>
      <p className={`mt-2 text-xs ${accent ? 'text-[var(--brand-ivory)]/70' : 'text-[hsl(var(--muted-foreground))]'}`}>{detail}</p>
    </div>
  );
}

/** Touch-friendly select used by catalogue and admin filters. */
export function FilterSelect({
  value,
  onChange,
  children,
  label,
  testId,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  label: string;
  testId?: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        data-testid={testId}
        className="h-11 w-full appearance-none rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-0 pl-4 pr-9 text-xs text-[hsl(var(--foreground))] outline-none focus:border-[var(--brand-gold)]"
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-3.5 top-1/2 h-[6px] w-[10px] -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
      >
        <path d="M0 0l5 6 5-6z" fill="currentColor" />
      </svg>
    </label>
  );
}

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50';

export const buttonOutline =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-3 text-xs font-semibold text-[hsl(var(--foreground))] transition hover:border-[var(--brand-gold)] disabled:opacity-50';
