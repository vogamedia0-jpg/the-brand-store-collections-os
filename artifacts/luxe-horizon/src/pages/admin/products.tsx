import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Loader2, MoreHorizontal, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { useDeleteProduct, useListProducts, useUpdateProduct, getListProductsQueryKey } from '@workspace/api-client-react';
import { Badge, EmptyState, FilterSelect, PageIntro, buttonPrimary, buttonOutline } from '@/components/ui-kit';
import { ProductImage, primaryImage } from '@/components/product-image';
import { BRAND, CATEGORY_TAXONOMY, GENDER_LABELS, brandOptions, categoryLabel, type Gender } from '@/lib/brand';
import { fallbackProducts, type Product } from '@/lib/catalogue-data';

type Draft = { id: string; brand: string; category: string; gender: Gender; isPublished: boolean; reviewed: boolean };

function EditProductDialog({ draft, onClose, onSave, pending }: { draft: Draft; onClose: () => void; onSave: (draft: Draft) => void; pending: boolean }) {
  const [form, setForm] = useState(draft);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Edit product">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Product</p>
            <h2 className="mt-1 font-display text-2xl">{form.brand || 'House selection'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-xs font-semibold">
            House
            <select
              value={form.brand}
              onChange={(event) => setForm({ ...form, brand: event.target.value })}
              data-testid="select-edit-brand"
              className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
            >
              <option value="">Unassigned</option>
              {brandOptions([form.brand]).map((house) => (
                <option key={house} value={house}>
                  {house}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold">
            Category
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              data-testid="select-edit-category"
              className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
            >
              {CATEGORY_TAXONOMY.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {group.categories.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {group.label} · {entry.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold">
            Edit
            <select
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
              data-testid="select-edit-gender"
              className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unknown">Unsorted</option>
            </select>
          </label>

          <label className="flex items-center gap-3 text-xs font-semibold">
            <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} data-testid="checkbox-edit-published" className="h-4 w-4 accent-[var(--brand-navy)]" />
            Published to the public catalogue
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={buttonOutline}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)} disabled={pending} className={buttonPrimary} data-testid="button-save-product">
            {pending ? <Loader2 size={15} className="animate-spin" /> : null} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { data } = useListProducts(undefined, { query: { queryKey: getListProductsQueryKey(), retry: false } });
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('all');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [draft, setDraft] = useState<Draft | null>(null);

  const all: Product[] = data?.length ? (data as Product[]) : fallbackProducts;
  const houses = useMemo(() => brandOptions(all.map((product) => product.brand)), [all]);

  const products = all.filter((product) => {
    if (gender !== 'all' && product.gender !== gender) return false;
    if (category !== 'all' && product.category !== category) return false;
    if (brand !== 'all' && product.brand !== brand) return false;
    if (search.trim()) {
      const haystack = `${product.brand ?? ''} ${categoryLabel(product.category)} ${product.id}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  const save = (next: Draft) => {
    updateProduct.mutate(
      {
        productId: next.id,
        data: { brand: next.brand || null, category: next.category, gender: next.gender, isPublished: next.isPublished, reviewed: next.reviewed },
      },
      { onSuccess: () => setDraft(null), onError: () => setDraft(null) },
    );
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Catalogue / 01"
        title="The product room."
        description="Everything in the active collection, from first upload to public-facing finish."
        action={
          <Link href="/admin/upload" className={buttonPrimary} data-testid="link-add-products">
            <Plus size={15} /> Add products
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search house, category or reference"
            data-testid="input-search-products"
            className="h-11 w-full rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-11 pr-4 text-sm outline-none focus:border-[var(--brand-gold)]"
          />
        </label>
        <FilterSelect label="Edit" value={gender} onChange={setGender} testId="select-products-gender">
          <option value="all">All edits</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="unknown">Unsorted</option>
        </FilterSelect>
        <FilterSelect label="Category" value={category} onChange={setCategory} testId="select-products-category">
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
        <FilterSelect label="House" value={brand} onChange={setBrand} testId="select-products-brand">
          <option value="all">All houses</option>
          {houses.map((house) => (
            <option key={house} value={house}>
              {house}
            </option>
          ))}
        </FilterSelect>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={<Package />} title="No products match this edit." description="Try another house, category or edit filter." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))]">
              <div className="relative">
                <ProductImage src={primaryImage(product.images)} alt={`${product.brand || BRAND.name} ${categoryLabel(product.category)}`} ratio="aspect-[4/5]" />
                <div className="absolute left-3 top-3">
                  <Badge tone={product.isPublished ? 'success' : 'neutral'}>{product.isPublished ? 'Live' : 'Draft'}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove this product from the collection?')) deleteProduct.mutate({ productId: product.id });
                  }}
                  aria-label={`Delete product ${product.id}`}
                  data-testid={`button-delete-product-${product.id}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4">
                <p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
                  {GENDER_LABELS[product.gender as Gender]} / {categoryLabel(product.category)}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <h3 className="min-w-0 truncate font-display text-xl">{product.brand || 'House selection'}</h3>
                  <button
                    type="button"
                    aria-label={`Edit product ${product.id}`}
                    data-testid={`button-edit-product-${product.id}`}
                    onClick={() => setDraft({ id: product.id, brand: product.brand ?? '', category: product.category, gender: product.gender as Gender, isPublished: product.isPublished, reviewed: product.reviewed })}
                    className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {draft && <EditProductDialog draft={draft} pending={updateProduct.isPending} onClose={() => setDraft(null)} onSave={save} />}
    </div>
  );
}
