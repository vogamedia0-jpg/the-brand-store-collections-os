import { useState } from 'react';

/**
 * The catalogue image system.
 *
 * Nothing about a product's photography is hardcoded here: the component takes
 * whatever path the upload system stored and renders it responsively. Until new
 * catalogue photography exists it shows an intentional neutral placeholder, so
 * the catalogue reads as finished rather than broken.
 */

type ProductImageProps = {
  src?: string | null;
  alt: string;
  /** Aspect ratio class, e.g. "aspect-[4/5]". Defaults to the catalogue portrait ratio. */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  /** Above-the-fold images should skip lazy loading. */
  priority?: boolean;
  /** Small caption shown inside the empty state. */
  placeholderLabel?: string;
};

export function ProductImage({
  src,
  alt,
  ratio = 'aspect-[4/5]',
  className = '',
  imgClassName = '',
  priority = false,
  placeholderLabel = 'Photography forthcoming',
}: ProductImageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');

  const showPlaceholder = !src || state === 'error';

  return (
    <div className={`relative isolate overflow-hidden bg-[hsl(var(--muted))] ${ratio} ${className}`}>
      {showPlaceholder ? (
        <ProductImagePlaceholder label={placeholderLabel} />
      ) : (
        <>
          {state === 'loading' && <div className="absolute inset-0 animate-pulse bg-[hsl(var(--muted))]" aria-hidden />}
          <img
            src={src ?? undefined}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
            className={`h-full w-full object-cover object-center transition-opacity duration-500 ${state === 'ready' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          />
        </>
      )}
    </div>
  );
}

/** Neutral, on-brand placeholder: beige ground, gold hairline, no invented imagery. */
export function ProductImagePlaceholder({ label = 'Photography forthcoming' }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--brand-beige)] px-4 text-center"
      role="img"
      aria-label={label}
    >
      <span className="absolute inset-3 border border-[var(--brand-gold)]/40" aria-hidden />
      <span className="font-display text-3xl leading-none tracking-[.18em] text-[var(--brand-navy)]/35 sm:text-4xl">TB</span>
      <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[var(--brand-taupe-600)]">{label}</span>
    </div>
  );
}

/** Resolve a stored image path to something the browser can load. */
export const imageSrc = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('/') || path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `/uploads/${path}`;
};

export const primaryImage = (images?: { imagePath: string; isPrimary: boolean }[] | null): string | null =>
  imageSrc(images?.find((image) => image.isPrimary)?.imagePath || images?.[0]?.imagePath);
