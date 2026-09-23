import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { BRAND } from '@/lib/brand';

const NAV = [
  { href: '/catalogue#collection', label: 'The collection' },
  { href: '/catalogue#house', label: 'The house' },
  { href: '/catalogue#enquiries', label: 'Enquiries' },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => setOpen(false), [location]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--brand-taupe)]/45 bg-[var(--brand-ivory)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8">
        <Link href="/" aria-label={BRAND.name} className="min-w-0">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[.16em] text-[var(--brand-navy)]/70 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-[var(--brand-gold)]">
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          data-testid="button-public-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-taupe)]/60 text-[var(--brand-navy)] md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--brand-taupe)]/40 bg-[var(--brand-ivory)] px-4 pb-6 pt-4 md:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm uppercase tracking-[.14em] text-[var(--brand-navy)]/80 hover:bg-[var(--brand-beige)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer id="enquiries" className="bg-[var(--brand-black)] text-[var(--brand-ivory)]">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-10 border-b border-[var(--brand-gold)]/20 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <BrandLogo variant="dark" size="lg" />
            <p className="mt-6 text-sm leading-7 text-[var(--brand-ivory)]/60">
              {BRAND.positioning}. Every piece is shown by appointment and answered personally.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-[10px] uppercase tracking-[.2em] text-[var(--brand-ivory)]/50">
            <a href="/catalogue#collection" className="hover:text-[var(--brand-gold)]">The collection</a>
            <a href="/catalogue#house" className="hover:text-[var(--brand-gold)]">The house</a>
            <a href="/catalogue#enquiries" className="hover:text-[var(--brand-gold)]">Enquiries</a>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-[10px] uppercase tracking-[.2em] text-[var(--brand-ivory)]/40 sm:flex-row sm:items-center sm:justify-between">
          <span>{BRAND.name}</span>
          <span className="text-[var(--brand-gold)]">{BRAND.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--brand-ivory)] text-[var(--brand-navy)] noise">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
