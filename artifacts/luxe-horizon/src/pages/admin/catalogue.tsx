import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowDownToLine, Copy, ExternalLink, Globe2 } from 'lucide-react';
import {
  useGenerateCataloguePdf,
  useGetCatalogue,
  getGetCatalogueQueryKey,
} from '@workspace/api-client-react';
import { Badge, FilterSelect, PageIntro, buttonOutline } from '@/components/ui-kit';
import { ProductImage, primaryImage } from '@/components/product-image';
import { BRAND, CATEGORY_TAXONOMY, GENDER_LABELS, brandOptions, categoryLabel, type Gender } from '@/lib/brand';
import { fallbackProducts, type Product } from '@/lib/catalogue-data';
import { generateBrandedCataloguePdf } from '@/lib/pdf';

export default function CatalogueAdminPage() {
  const { data: catalogue } = useGetCatalogue(undefined, { query: { queryKey: getGetCatalogueQueryKey(), retry: false } });
  const generatePdf = useGenerateCataloguePdf();

  const [gender, setGender] = useState('all');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [copied, setCopied] = useState(false);

  const products: Product[] = catalogue?.products?.length ? (catalogue.products as Product[]) : fallbackProducts.filter((product) => product.isPublished);
  const houses = useMemo(() => brandOptions([...(catalogue?.availableBrands ?? []), ...products.map((product) => product.brand)]), [catalogue?.availableBrands, products]);

  const filtered = products.filter(
    (product) =>
      (gender === 'all' || product.gender === gender) &&
      (category === 'all' || product.category === category) &&
      (brand === 'all' || product.brand === brand),
  );

  const copyLink = async () => {
    const query = new URLSearchParams();
    if (gender !== 'all') query.set('gender', gender);
    if (category !== 'all') query.set('category', category);
    if (brand !== 'all') query.set('brand', brand);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}/catalogue${suffix}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadPdf = async () => {
    const title = `${catalogue?.collection?.name || 'Autumn / Winter 2026'} — Private Edit`;
    const published = filtered.filter((product) => product.isPublished);
    try {
      await generatePdf.mutateAsync({ data: { title, productIds: published.map((product) => product.id) } });
    } catch {
      /* local export remains available while the server-side PDF worker is configured */
    }
    await generateBrandedCataloguePdf(title, published);
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Catalogue / 03"
        title="Publish with composure."
        description="Decide what is ready for the outside world, then share one considered link."
        action={
          <button type="button" onClick={copyLink} className={buttonOutline} data-testid="button-copy-catalogue-link">
            <Copy size={15} /> {copied ? 'Link copied' : 'Copy public link'}
          </button>
        }
      />

      <section className="mb-5 overflow-hidden rounded-xl bg-[var(--brand-black)] text-[var(--brand-ivory)]">
        <div className="grid md:grid-cols-[1fr_.8fr]">
          <div className="p-6 sm:p-10">
            <Badge tone="gold">
              <Globe2 size={11} /> Customer-facing
            </Badge>
            <h2 className="mt-5 max-w-lg font-display text-3xl leading-tight sm:text-4xl">A catalogue that gives the edit room to breathe.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--brand-ivory)]/70">
              Your public link is live with {filtered.filter((product) => product.isPublished).length} published{' '}
              {filtered.filter((product) => product.isPublished).length === 1 ? 'piece' : 'pieces'} from{' '}
              {catalogue?.collection?.name || 'Autumn / Winter 2026'}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogue" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-5 py-3 text-xs font-semibold text-[var(--brand-navy)]">
                View public catalogue <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 px-5 py-3 text-xs font-semibold text-[var(--brand-ivory)]"
                data-testid="button-generate-pdf"
              >
                <ArrowDownToLine size={14} /> {generatePdf.isPending ? 'Preparing PDF' : 'Generate private PDF'}
              </button>
            </div>
          </div>
          <div className="relative min-h-[200px]">
            <img src={BRAND.heroImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain p-8 opacity-80" />
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <FilterSelect label="Edit" value={gender} onChange={setGender} testId="select-admin-catalogue-gender">
          <option value="all">All products</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="unknown">Unsorted</option>
        </FilterSelect>
        <FilterSelect label="Category" value={category} onChange={setCategory} testId="select-admin-catalogue-category">
          <option value="all">All categories</option>
          {CATEGORY_TAXONOMY.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.categories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {group.label} · {entry.label}
                </option>
              ))}
            </optgroup>
          ))}
        </FilterSelect>
        <FilterSelect label="House" value={brand} onChange={setBrand} testId="select-admin-catalogue-brand">
          <option value="all">All houses</option>
          {houses.map((house) => (
            <option key={house} value={house}>
              {house}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="overflow-hidden rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))]">
        <div className="hidden grid-cols-[1fr_130px_110px_80px] gap-4 border-b border-[hsl(var(--border))] px-5 py-3 font-mono-ui text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:grid">
          <span>Product</span>
          <span>Edit</span>
          <span>State</span>
          <span>Open</span>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[hsl(var(--muted-foreground))]">Nothing matches these filters.</p>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3 last:border-0 sm:grid sm:grid-cols-[1fr_130px_110px_80px] sm:gap-4 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <ProductImage src={primaryImage(product.images)} alt="" ratio="aspect-square" className="w-11 shrink-0 rounded-md" placeholderLabel="" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.brand || 'House selection'}</p>
                  <p className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{categoryLabel(product.category)}</p>
                </div>
              </div>
              <span className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:block">{GENDER_LABELS[product.gender as Gender]}</span>
              <span>
                <Badge tone={product.isPublished ? 'success' : 'neutral'}>{product.isPublished ? 'Live' : 'Draft'}</Badge>
              </span>
              <Link href={`/catalogue/product/${product.id}`} className="hidden text-xs font-semibold text-[var(--brand-gold)] sm:block">
                Open
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
