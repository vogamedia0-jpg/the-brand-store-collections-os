import { useState } from 'react';
import { Link } from 'wouter';
import { Check, CheckCircle2, ListFilter, Pencil } from 'lucide-react';
import {
  useBulkUpdateProducts,
  useListProducts,
  useUpdateProduct,
  getListProductsQueryKey,
} from '@workspace/api-client-react';
import { Badge, EmptyState, IconButton, PageIntro, buttonOutline } from '@/components/ui-kit';
import { ProductImage, primaryImage } from '@/components/product-image';
import { categoryLabel, GENDER_LABELS, type Gender } from '@/lib/brand';
import { fallbackProducts, type Product } from '@/lib/catalogue-data';

export default function ReviewPage() {
  const { data } = useListProducts({ reviewed: false }, { query: { queryKey: getListProductsQueryKey({ reviewed: false }), retry: false } });
  const updateProduct = useUpdateProduct();
  const bulkUpdate = useBulkUpdateProducts();
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unknown'>('all');

  const products: Product[] = (data?.length ? (data as Product[]) : fallbackProducts.filter((product) => !product.reviewed)).filter(
    (product) => filter === 'all' || product.gender === 'unknown',
  );

  const toggle = (id: string) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const review = (product: Product, reviewed = true) =>
    updateProduct.mutate({ productId: product.id, data: { reviewed, gender: product.gender, category: product.category, brand: product.brand || null } });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Workspace / 03"
        title="Trust, then tune."
        description="The unsure queue is deliberately small. Confirm what feels right and keep the house language consistent."
        action={
          <Link href="/admin/products" className={buttonOutline} data-testid="link-all-products">
            <ListFilter size={15} /> All products
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] p-1">
          {(['all', 'unknown'] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              data-testid={`button-review-filter-${item}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                filter === item ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              {item === 'all' ? `All unsure (${products.length})` : 'Unknown only'}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{selected.length} selected</span>
            <button
              type="button"
              onClick={() => bulkUpdate.mutate({ data: { productIds: selected, reviewed: true } })}
              className="rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
              data-testid="button-bulk-approve"
            >
              Approve selected
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 />}
          title="The queue is clear."
          description="Every item has been reviewed for this collection."
          action={
            <Link href="/admin/products" className="rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="animate-rise overflow-hidden rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-editorial"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <div className="relative">
                <ProductImage src={primaryImage(product.images)} alt={`${product.brand || 'Unsorted'} ${categoryLabel(product.category)}`} ratio="aspect-[4/5]" />
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  aria-label={`Select product ${product.id}`}
                  data-testid={`button-select-product-${product.id}`}
                  className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border ${
                    selected.includes(product.id) ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--brand-navy)]' : 'border-white/70 bg-black/25 text-white'
                  }`}
                >
                  {selected.includes(product.id) && <Check size={14} />}
                </button>
                <div className="absolute right-3 top-3">
                  <Badge tone={product.gender === 'unknown' ? 'warning' : 'dark'}>{GENDER_LABELS[product.gender as Gender]}</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">
                      {Math.round((product.aiConfidence ?? 0.5) * 100)}% confidence
                    </p>
                    <h2 className="mt-1 truncate font-display text-2xl">{product.brand || 'House to confirm'}</h2>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {categoryLabel(product.category)} · suggested {categoryLabel(product.aiCategory)}
                    </p>
                  </div>
                  <IconButton label={`Edit ${product.id}`}>
                    <Pencil size={15} />
                  </IconButton>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => review(product, true)}
                    className="flex-1 rounded-full bg-[hsl(var(--primary))] px-3 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
                    data-testid={`button-approve-${product.id}`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => review(product, false)}
                    className="rounded-full border border-[hsl(var(--border))] px-3 py-2.5 text-xs font-semibold"
                    data-testid={`button-keep-unsure-${product.id}`}
                  >
                    Keep unsure
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
