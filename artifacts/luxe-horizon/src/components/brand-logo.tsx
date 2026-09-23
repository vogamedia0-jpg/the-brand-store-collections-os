import { BRAND } from '@/lib/brand';

/**
 * THE BRAND STORE identity lockup.
 * The approved gold monogram sits in a black tile; the wordmark is set in the
 * house serif. Never renders any legacy brand asset.
 */
export function BrandLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tile = size === 'lg' ? 'h-14 w-14 rounded-xl' : size === 'sm' ? 'h-9 w-9 rounded-lg' : 'h-11 w-11 rounded-[10px]';
  const word = size === 'lg' ? 'text-[22px]' : size === 'sm' ? 'text-[13px]' : 'text-[16px]';
  const sub = size === 'lg' ? 'text-[8px]' : 'text-[6.5px]';
  const ink = variant === 'dark' ? 'text-[var(--brand-ivory)]' : 'text-[var(--brand-navy)]';

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className={`${tile} flex shrink-0 items-center justify-center overflow-hidden bg-[var(--brand-black)] ring-1 ring-[var(--brand-gold)]/30`}>
        <img src={BRAND.heroImage} alt="" aria-hidden className="h-full w-full scale-[1.06] object-cover" />
      </span>
      <span className={`flex min-w-0 flex-col justify-center leading-none ${ink}`}>
        <span className={`font-mono-ui ${sub} tracking-[.34em] opacity-80`}>THE</span>
        <span className={`font-display ${word} mt-1 whitespace-nowrap font-semibold tracking-[.01em]`}>BRAND STORE</span>
        <span className={`font-mono-ui ${sub} mt-1 tracking-[.24em] text-[var(--brand-gold)]`}>{BRAND.tagline}</span>
      </span>
    </span>
  );
}

/** Standalone monogram, for dark editorial surfaces. */
export function BrandMonogram({ className = 'h-12 w-12' }: { className?: string }) {
  return <img src={BRAND.heroImage} alt={BRAND.name} className={`${className} object-contain`} />;
}
