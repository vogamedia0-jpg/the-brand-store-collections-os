import { Link } from 'wouter';
import { BrandLogo } from '@/components/brand-logo';
import { BRAND } from '@/lib/brand';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-[var(--brand-black)] px-6 text-center text-[var(--brand-ivory)]">
      <BrandLogo variant="dark" size="lg" />
      <p className="font-mono-ui text-[10px] uppercase tracking-[.24em] text-[var(--brand-gold)]">Page not found</p>
      <h1 className="max-w-md font-display text-3xl leading-tight sm:text-4xl">This room is not part of the collection.</h1>
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--brand-navy)]"
      >
        Return to the catalogue
      </Link>
      <p className="text-[10px] uppercase tracking-[.2em] text-[var(--brand-ivory)]/40">{BRAND.tagline}</p>
    </div>
  );
}
