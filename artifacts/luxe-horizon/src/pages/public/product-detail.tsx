import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import {
  useGetProduct,
  useGetPublicProduct,
  useGetSettings,
  getGetProductQueryKey,
  getGetPublicProductQueryKey,
  getGetSettingsQueryKey,
} from '@workspace/api-client-react';
import { PublicShell } from '@/components/public/public-shell';
import { ProductImage, imageSrc, primaryImage } from '@/components/product-image';
import { BRAND, categoryLabel, GENDER_LABELS, type Gender } from '@/lib/brand';
import { fallbackProducts, type Product } from '@/lib/catalogue-data';

const WHATSAPP_FALLBACK = import.meta.env.VITE_THE_BRAND_STORE_WHATSAPP || '';

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-10 md:grid-cols-2">
      <div className="aspect-[4/5] bg-[var(--brand-beige)]" />
      <div className="space-y-4 pt-6">
        <div className="h-3 w-24 bg-[var(--brand-beige)]" />
        <div className="h-12 w-3/4 bg-[var(--brand-beige)]" />
        <div className="h-3 w-full bg-[var(--brand-beige)]" />
        <div className="h-3 w-5/6 bg-[var(--brand-beige)]" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId = '' } = useParams<{ productId: string }>();
  const { data: publicProduct, isLoading } = useGetPublicProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetPublicProductQueryKey(productId), retry: false },
  });
  const { data: adminProduct } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId), retry: false },
  });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey(), retry: false } });

  const product: Product | undefined =
    (publicProduct as Product | undefined) ||
    (adminProduct as Product | undefined) ||
    fallbackProducts.find((item) => item.id === productId);

  const [active, setActive] = useState(0);
  const images = product?.images ?? [];
  const activeImage = images[active];
  const whatsappNumber = settings?.whatsappNumber || WHATSAPP_FALLBACK;

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/catalogue/product/${productId}` : '';
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello ${BRAND.name}, I am interested in this piece:\n\n${publicUrl}\n\nIs it available?`,
  )}`;

  return (
    <PublicShell>
      <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <Link
          href="/catalogue"
          data-testid="link-back-catalogue"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[var(--brand-taupe-600)] transition hover:text-[var(--brand-gold)]"
        >
          <ArrowLeft size={14} /> Back to the collection
        </Link>

        <div className="mt-8">
          {isLoading && !product ? (
            <DetailSkeleton />
          ) : !product ? (
            <div className="py-24 text-center">
              <h1 className="font-display text-3xl text-[var(--brand-navy)]">This piece is no longer shown.</h1>
              <p className="mt-3 text-sm text-[var(--brand-taupe-600)]">Return to the collection to continue.</p>
              <Link href="/catalogue" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-navy)] px-5 py-3 text-xs font-semibold text-[var(--brand-ivory)]">
                View the collection <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] lg:gap-16">
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:w-[84px] sm:flex-col sm:overflow-visible sm:pb-0">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActive(index)}
                        aria-label={`View image ${index + 1}`}
                        data-testid={`button-product-image-${index}`}
                        className={`h-20 w-16 shrink-0 border-2 transition sm:h-[100px] sm:w-full ${
                          active === index ? 'border-[var(--brand-gold)]' : 'border-transparent hover:border-[var(--brand-taupe)]'
                        }`}
                      >
                        <ProductImage src={imageSrc(image.imagePath)} alt="" ratio="aspect-[4/5]" placeholderLabel="" className="h-full" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  <ProductImage
                    src={primaryImage(activeImage ? [activeImage] : images)}
                    alt={`${product.brand || BRAND.name} — ${categoryLabel(product.category)}`}
                    ratio="aspect-[4/5]"
                    priority
                    className="bg-[var(--brand-beige)]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.2em] text-[var(--brand-taupe-600)]">
                  <span>{GENDER_LABELS[product.gender as Gender] ?? 'Unsorted'}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]" />
                  <span>{categoryLabel(product.category)}</span>
                </div>
                <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-[-.03em] text-[var(--brand-navy)] sm:text-5xl">
                  {product.brand || 'House selection'}
                </h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-[var(--brand-taupe-600)]">
                  A considered piece from the {settings?.businessName || BRAND.name} catalogue. Enquire with the house for availability,
                  provenance and private appointments.
                </p>

                <div className="my-8 border-y border-[var(--brand-taupe)]/50 py-5">
                  <div className="flex items-center justify-between text-xs text-[var(--brand-navy)]">
                    <span className="text-[var(--brand-taupe-600)]">Availability</span>
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]" /> By enquiry
                    </span>
                  </div>
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="link-whatsapp-enquiry"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--brand-ivory)] transition hover:-translate-y-0.5 hover:shadow-lg sm:w-fit"
                >
                  <MessageCircle size={16} /> Enquire via WhatsApp
                </a>
                <p className="mt-4 text-[10px] uppercase tracking-[.16em] text-[var(--brand-taupe-600)]">
                  A member of the house will respond personally.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
