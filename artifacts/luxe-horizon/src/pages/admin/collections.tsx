import { useState } from 'react';
import { FolderOpen, MoreHorizontal, Plus } from 'lucide-react';
import {
  useCreateCollection,
  useDeleteCollection,
  useListCollections,
  useUpdateCollection,
  getListCollectionsQueryKey,
} from '@workspace/api-client-react';
import { Badge, IconButton, PageIntro, buttonPrimary } from '@/components/ui-kit';
import { formatDate } from '@/lib/brand';
import { fallbackCollection, type Collection } from '@/lib/catalogue-data';

export default function CollectionsPage() {
  const { data } = useListCollections({ query: { queryKey: getListCollectionsQueryKey(), retry: false } });
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const collections: Collection[] = data?.length
    ? (data as Collection[])
    : [
        fallbackCollection,
        { ...fallbackCollection, id: 'ss26', slug: 'spring-summer-2026', name: 'Spring / Summer 2026', isPublished: false, publishedAt: null, startDate: '2026-01-10', endDate: '2026-07-30' },
      ];

  const submit = () => {
    const clean = name.trim();
    if (!clean) return;
    createCollection.mutate(
      { data: { name: clean, slug: clean.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'), startDate: null, endDate: null } },
      {
        onSuccess: () => {
          setName('');
          setShowCreate(false);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Catalogue / 02"
        title="Collection history."
        description="Seasons have a lifespan. Keep the archive orderly, and only let one edit lead the room."
        action={
          <button type="button" onClick={() => setShowCreate((value) => !value)} className={buttonPrimary} data-testid="button-new-collection">
            <Plus size={15} /> New collection
          </button>
        }
      />

      {showCreate && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[var(--brand-gold)]/30 bg-[hsl(var(--card))] p-4 sm:flex-row">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Resort 2027"
            data-testid="input-new-collection-name"
            className="h-11 flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
          />
          <button type="button" onClick={submit} className={buttonPrimary} data-testid="button-save-collection">
            Create collection
          </button>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className={`flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
              index === 0 ? 'border-[var(--brand-gold)]/40 bg-[hsl(var(--card))] shadow-editorial' : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${index === 0 ? 'bg-[var(--brand-navy)] text-[var(--brand-ivory)]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                <FolderOpen size={19} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl">{collection.name}</h2>
                  {collection.isPublished ? <Badge tone="success">Published</Badge> : <Badge>Archive</Badge>}
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {formatDate(collection.startDate)} — {formatDate(collection.endDate)} <span className="mx-1">·</span> /{collection.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              {!collection.isPublished && (
                <button
                  type="button"
                  onClick={() => updateCollection.mutate({ collectionId: collection.id, data: { isPublished: true } })}
                  className={buttonPrimary}
                  data-testid={`button-publish-collection-${collection.id}`}
                >
                  Publish
                </button>
              )}
              <IconButton
                label={`More actions for ${collection.name}`}
                onClick={() => {
                  if (window.confirm('Delete this collection?')) deleteCollection.mutate({ collectionId: collection.id });
                }}
              >
                <MoreHorizontal size={16} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
