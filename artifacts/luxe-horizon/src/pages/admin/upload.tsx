import { useState } from 'react';
import { Badge } from '@/components/ui-kit';
import { CheckCircle2, Image as ImageIcon, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';
import {
  useCreateProduct,
  useListCollections,
  useUploadProducts,
  getListCollectionsQueryKey,
} from '@workspace/api-client-react';
import { PageIntro } from '@/components/ui-kit';
import { CATEGORY_TAXONOMY } from '@/lib/brand';
import { collectionOptions, fallbackCollection } from '@/lib/catalogue-data';

export default function UploadPage() {
  const { data: collections } = useListCollections({ query: { queryKey: getListCollectionsQueryKey(), retry: false } });
  const createProduct = useCreateProduct();
  const uploadProducts = useUploadProducts();

  const [files, setFiles] = useState<File[]>([]);
  const [hint, setHint] = useState<'mixed' | 'men' | 'women'>('mixed');
  const [category, setCategory] = useState('women-clothing');
  const [collectionId, setCollectionId] = useState(fallbackCollection.id);
  const [message, setMessage] = useState('');

  const activeCollections = collectionOptions(collections);

  const addFiles = (incoming: FileList | null) => incoming && setFiles((current) => [...current, ...Array.from(incoming)]);

  const submit = () => {
    if (!files.length) {
      setMessage('Choose at least one image to start a batch.');
      return;
    }
    uploadProducts.mutate(
      {
        data: {
          collectionId,
          batchHint: hint,
          images: files.map((file) => ({ imagePath: file.name, imageUrl: URL.createObjectURL(file) })),
        },
      },
      {
        onSuccess: () => setMessage('Batch uploaded. The sorter is preparing a first pass.'),
        onError: () => {
          createProduct.mutate({
            data: {
              collectionId,
              gender: hint === 'mixed' ? 'unknown' : hint,
              category,
              imagePath: files[0].name,
              imageUrl: URL.createObjectURL(files[0]),
            },
          });
          setMessage('Batch staged locally. Connect the API to persist these images.');
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Workspace / 02"
        title="Bring in the edit."
        description="Upload a clean batch, give the sorter a direction, then let it prepare the first pass."
        action={
          <Badge tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]" /> Storage ready
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Batch setup</p>
              <h2 className="mt-2 font-display text-2xl">Start with context.</h2>
            </div>
            <span className="font-mono-ui text-xs text-[hsl(var(--muted-foreground))]">01 / 02</span>
          </div>

          <label className="mb-5 block text-xs font-semibold">
            Collection
            <select
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              data-testid="select-upload-collection"
              className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
            >
              {activeCollections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-5 block text-xs font-semibold">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              data-testid="select-upload-category"
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

          <div>
            <p className="text-xs font-semibold">Batch hint</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A useful nudge for the sorter, not a hard rule.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['mixed', 'men', 'women'] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setHint(option)}
                  data-testid={`button-batch-hint-${option}`}
                  className={`rounded-lg border px-3 py-3 text-xs font-semibold capitalize transition ${
                    hint === option ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[hsl(var(--foreground))]' : 'border-[hsl(var(--border))] hover:border-[var(--brand-gold)]/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-6 flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--brand-taupe)] bg-[hsl(var(--muted))] px-6 text-center transition hover:border-[var(--brand-gold)]">
            <UploadCloud size={28} className="text-[var(--brand-gold)]" />
            <span className="mt-4 font-display text-2xl text-[hsl(var(--foreground))]">Drop the campaign images here</span>
            <span className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">JPG, PNG or WEBP · Up to 50MB each</span>
            <span className="mt-5 rounded-full border border-[var(--brand-taupe)] px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground))]">Browse files</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} data-testid="input-upload-images" />
          </label>

          {files.length > 0 && (
            <div className="mt-5 space-y-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-xs">
                  <ImageIcon size={15} className="text-[var(--brand-gold)]" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {message || (files.length ? `${files.length} image${files.length === 1 ? '' : 's'} ready for sorting.` : 'Nothing staged yet.')}
            </p>
            <button
              type="button"
              disabled={uploadProducts.isPending}
              onClick={submit}
              data-testid="button-upload-and-sort"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {uploadProducts.isPending ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} Upload & sort
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl bg-[var(--brand-navy)] p-6 text-[var(--brand-ivory)] sm:p-8">
            <div className="flex items-center gap-2 text-[var(--brand-gold)]">
              <Sparkles size={17} />
              <span className="font-mono-ui text-[10px] uppercase tracking-[.18em]">Catalogue sorter</span>
            </div>
            <h2 className="mt-5 font-display text-3xl leading-tight">A first pass, not a final word.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--brand-ivory)]/70">
              Each image is read for gender, category and house. Low-confidence items stay in your review queue, never hidden.
            </p>
            <div className="mt-6 space-y-3 border-t border-[var(--brand-gold)]/25 pt-5">
              {['Recognises visual categories', 'Flags unsure classifications', 'Keeps originals untouched'].map((line) => (
                <div key={line} className="flex items-center gap-3 text-xs">
                  <CheckCircle2 size={15} className="text-[var(--brand-gold)]" /> {line}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Before you upload</p>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              {['Keep one product per frame where possible.', 'Use a batch hint when the edit is directional.', 'You can always correct the sort in review.'].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--brand-gold)]" /> {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
