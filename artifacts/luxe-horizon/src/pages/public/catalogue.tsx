import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowDown, Heart, Search } from 'lucide-react';
import { useGetCatalogue, getGetCatalogueQueryKey } from '@workspace/api-client-react';
import { PublicShell } from '@/components/public/public-shell';
import { ProductImage, primaryImage } from '@/components/product-image';
import { FilterSelect } from '@/components/ui-kit';
import { BRAND, CATEGORY_TAXONOMY, brandOptions, categoryLabel } from '@/lib/brand';
import { fallbackProducts, type Product } from '@/lib/catalogue-data';

function Hero({ collectionName }: { collectionName: string }) {
  return (
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 pb-12 pt-10 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-16 lg:pb-20 lg:pt-16">
      <div className="order-2 flex flex-col justify-center lg:order-1">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.24em] text-[var(--brand-taupe-600)]">
          {BRAND.name} — {collectionName}
        </p>
        <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.02] tracking-[-.035em] text-[var(--brand-navy)] sm:text-6xl lg:text-[68px]">
          Luxury lives <em className="text-[var(--brand-gold)] not-italic">here.</em>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-[var(--brand-taupe-600)]">
          {BRAND.positioning}. A considered edit of exceptional pieces, chosen for the way they live together.
        </p>
        <a
          href="#collection"
          className="mt-9 inline-flex w-fit items-center gap-3 border-b border-[var(--brand-navy)] pb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
        >
          Enter the collection <ArrowDown size={14} />
        </a>
      </div>

      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden bg-[var(--brand-black)]">
          <span aria-hidden className="pointer-events-none absolute inset-4 z-10 border border-[var(--brand-gold)]/25 sm:inset-6" />
          <img
            src={BRAND.heroImage}
            alt={`${BRAND.name} monogram`}
            width={1200}
            height={1200}
            fetchPriority="high"
            decoding="async"
            className="aspect-square w-full object-contain p-6 sm:p-10 lg:aspect-[4/3] lg:p-14"
          />
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/catalogue/product/${product.id}`} data-testid={`link-public-product-${product.id}`} className="group block">
      <ProductImage
        src={primaryImage(product.images)}
        alt={`${product.brand || BRAND.name} — ${categoryLabel(product.category)}`}
        ratio="aspect-[4/5]"
        imgClassName="group-hover:scale-[1.03]"
        className="bg-[var(--brand-beige)]"
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg leading-snug text-[var(--brand-navy)]">{product.brand || 'House selection'}</h3>
          <p className="mt-1 font-mono-ui text-[9px] uppercase tracking-[.16em] text-[var(--brand-taupe-600)]">{categoryLabel(product.category)}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CataloguePage() {
  const params = new URLSearchParams(window.location.search);
  const { data: catalogue } = useGetCatalogue(undefined, { query: { queryKey: getGetCatalogueQueryKey(), retry: false } });

  const [gender, setGender] = useState(params.get('gender') || 'all');
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [brand, setBrand] = useState(params.get('brand') || 'all');
  const [search, setSearch] = useState('');

  const collectionName = catalogue?.collection?.name || 'Autumn / Winter 2026';
  const products: Product[] = catalogue?.products?.length ? (catalogue.products as Product[]) : fallbackProducts.filter((product) => product.isPublished);
  const houses = useMemo(() => brandOptions([...(catalogue?.availableBrands ?? []), ...products.map((product) => product.brand)]), [catalogue?.availableBrands, products]);

  const visible = products.filter((product) => {
    if (gender !== 'all' && product.gender !== gender) return false;
    if (category !== 'all' && product.category !== category) return false;
    if (brand !== 'all' && product.brand !== brand) return false;
    if (search.trim()) {
      const haystack = `${product.brand ?? ''} ${categoryLabel(product.category)}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <PublicShell>
      <Hero collectionName={collectionName} />

      <section id="collection" className="border-t border-[var(--brand-taupe)]/40 bg-[var(--brand-ivory)]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[var(--brand-gold)]">The edit</p>
              <h2 className="mt-3 font-display text-3xl text-[var(--brand-navy)] sm:text-4xl">Objects with a point of view.</h2>
            </div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[var(--brand-taupe-600)]">
              {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <label className="relative block">
              <span className="sr-only">Search the catalogue</span>
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-taupe)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search houses or categories"
                data-testid="input-public-search"
                className="h-11 w-full rounded-full border border-[var(--brand-taupe)]/60 bg-white/60 pl-11 pr-4 text-sm text-[var(--brand-navy)] outline-none placeholder:text-[var(--brand-taupe)] focus:border-[var(--brand-gold)]"
              />
            </label>
            <FilterSelect label="Gender" value={gender} onChange={setGender} testId="select-catalogue-gender">
              <option value="all">Everyone</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </FilterSelect>
            <FilterSelect label="Category" value={category} onChange={setCategory} testId="select-catalogue-category">
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
            <FilterSelect label="House" value={brand} onChange={setBrand} testId="select-catalogue-brand">
              <option value="all">All houses</option>
              {houses.map((house) => (
                <option key={house} value={house}>
                  {house}
                </option>
              ))}
            </FilterSelect>
          </div>

          {visible.length === 0 ? (
            <div className="py-24 text-center">
              <Heart className="mx-auto text-[var(--brand-gold)]" size={22} />
              <p className="mt-4 font-display text-2xl text-[var(--brand-navy)]">A quieter edit is coming.</p>
              <p className="mt-2 text-sm text-[var(--brand-taupe-600)]">Try another house, category or search term.</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="house" className="border-t border-[var(--brand-taupe)]/40 bg-[var(--brand-beige)]">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[var(--brand-navy)]/60">The house</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--brand-navy)] sm:text-4xl">A curated world of luxury.</h2>
          </div>
          <div className="max-w-xl text-sm leading-7 text-[var(--brand-navy)]/75">
            <p>
              THE BRAND STORE brings together houses of enduring craft — leather goods, tailoring, watches and fine jewellery — in one
              considered catalogue.
            </p>
            <p className="mt-4">
              Pieces are shown by enquiry. Ask about availability, provenance or a private appointment and a member of the house will
              respond personally.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
