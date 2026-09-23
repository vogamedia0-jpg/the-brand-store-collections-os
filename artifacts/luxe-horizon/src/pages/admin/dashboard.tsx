import { Link } from 'wouter';
import { ArrowUpRight, BarChart3, ChevronRight, Eye, FolderOpen, Plus, Send, Sparkles, Zap } from 'lucide-react';
import {
  useGetCollection,
  useGetDashboard,
  getGetCollectionQueryKey,
  getGetDashboardQueryKey,
} from '@workspace/api-client-react';
import { Badge, PageIntro, StatCard } from '@/components/ui-kit';
import { BRAND, categoryLabel, formatDate } from '@/lib/brand';
import { fallbackCollection } from '@/lib/catalogue-data';

const quickActions = [
  { href: '/admin/review', label: 'Review unsure items', icon: Eye },
  { href: '/admin/catalogue', label: 'Share the catalogue link', icon: Send },
  { href: '/admin/collections', label: 'View collection history', icon: FolderOpen },
];

export default function DashboardPage() {
  const { data: summary, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), retry: false } });
  const current = summary?.collection ?? fallbackCollection;
  const { data: collectionDetail } = useGetCollection(current.id, {
    query: { enabled: !!current.id, queryKey: getGetCollectionQueryKey(current.id), retry: false },
  });

  const total = summary?.totalUploaded ?? 0;
  const needsReview = summary?.needsReview ?? 0;
  const published = summary?.published ?? 0;
  const categories = Object.entries(summary?.categories ?? {});

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Operations / 01"
        title="Good morning, house."
        description="A quiet view of what needs your eye today."
        action={
          <Link href="/admin/upload" data-testid="link-upload-new-batch" className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg">
            <Plus size={16} /> Upload new batch
          </Link>
        }
      />

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)
        ) : (
          <>
            <StatCard label="In this collection" value={total} detail="Active pieces" accent />
            <StatCard label="Needs your eye" value={needsReview} detail="Awaiting review" />
            <StatCard label="Published" value={published} detail={`${Math.round((published / Math.max(total, 1)) * 100)}% of collection`} />
            <StatCard label="Unsorted" value={summary?.unknown ?? 0} detail="Confidence below 70%" />
          </>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-editorial sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <Badge tone="gold">
                <Sparkles size={11} /> Current season
              </Badge>
              <h2 className="mt-4 font-display text-3xl text-[hsl(var(--foreground))]">{collectionDetail?.name || current.name}</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {formatDate(current.startDate)} — {formatDate(current.endDate)}
              </p>
            </div>
            <Link href="/admin/collections" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-gold)]">
              Manage collection <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-end justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Review progress</span>
                <strong className="text-[hsl(var(--foreground))]">{total - needsReview} / {total}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full rounded-full bg-[var(--brand-navy)] dark:bg-[var(--brand-gold)]" style={{ width: `${((total - needsReview) / Math.max(total, 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-end justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Catalogue ready</span>
                <strong className="text-[hsl(var(--foreground))]">{published} / {total}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full rounded-full bg-[var(--brand-gold)]" style={{ width: `${(published / Math.max(total, 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-5">
            {[
              { label: 'MEN', value: summary?.men ?? 0 },
              { label: 'WOMEN', value: summary?.women ?? 0 },
              { label: 'UNSORTED', value: summary?.unknown ?? 0 },
            ].map((entry) => (
              <div key={entry.label}>
                <p className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{entry.label}</p>
                <p className="mt-1 font-display text-2xl">{entry.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[var(--brand-beige)] p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[var(--brand-navy)]/60">Quick actions</p>
              <h2 className="mt-2 font-display text-2xl text-[var(--brand-navy)]">Keep the rhythm.</h2>
            </div>
            <Zap size={22} className="text-[var(--brand-gold-700)]" />
          </div>
          <div className="mt-6 space-y-2">
            {quickActions.map(({ href, label, icon: ActionIcon }) => (
              <Link key={href} href={href} className="group flex items-center justify-between rounded-lg bg-[var(--brand-ivory)] p-4 transition hover:-translate-y-0.5">
                <span className="flex items-center gap-3 text-sm font-semibold text-[var(--brand-navy)]">
                  <ActionIcon size={17} className="text-[var(--brand-gold-700)]" /> {label}
                </span>
                <ChevronRight size={16} className="text-[var(--brand-navy)] transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Category mix</p>
              <h2 className="mt-2 font-display text-2xl">This collection, by edit.</h2>
            </div>
            <BarChart3 size={19} className="text-[var(--brand-gold)]" />
          </div>
          {categories.length === 0 ? (
            <p className="mt-7 text-sm text-[hsl(var(--muted-foreground))]">No categorised pieces yet. Upload a batch to begin.</p>
          ) : (
            <div className="mt-7 space-y-4">
              {categories.map(([slug, count]) => (
                <div key={slug} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 truncate text-[hsl(var(--muted-foreground))]">{categoryLabel(slug)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full bg-[var(--brand-gold)]" style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono-ui text-xs">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-xl bg-[var(--brand-black)]">
          <img src={BRAND.heroImage} alt="" aria-hidden className="absolute right-0 top-1/2 h-[85%] -translate-y-1/2 object-contain opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-black)] via-[var(--brand-black)]/85 to-transparent" />
          <div className="relative flex h-full max-w-sm flex-col justify-end p-7 text-[var(--brand-ivory)] sm:p-9">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[var(--brand-gold)]">House note</p>
            <p className="mt-3 font-display text-3xl leading-tight">“The catalogue should feel like a well-kept room.”</p>
            <p className="mt-4 text-xs text-[var(--brand-ivory)]/60">{BRAND.name} · {BRAND.tagline}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
