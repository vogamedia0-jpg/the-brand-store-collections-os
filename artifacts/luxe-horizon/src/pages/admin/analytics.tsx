import { BarChart3, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { useGetDashboard, useGetSettings, getGetDashboardQueryKey, getGetSettingsQueryKey } from '@workspace/api-client-react';
import { PageIntro, StatCard } from '@/components/ui-kit';
import { BRAND, categoryLabel } from '@/lib/brand';
import { fallbackProducts } from '@/lib/catalogue-data';

export default function AnalyticsPage() {
  const { data: summary } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), retry: false } });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey(), retry: false } });

  const total = summary?.totalUploaded ?? fallbackProducts.length;
  const published = summary?.published ?? fallbackProducts.filter((product) => product.isPublished).length;
  const needsReview = summary?.needsReview ?? fallbackProducts.filter((product) => !product.reviewed).length;
  const categories = Object.entries(summary?.categories ?? {}).sort((a, b) => b[1] - a[1]);

  const split = [
    { label: 'Women', value: summary?.women ?? 0 },
    { label: 'Men', value: summary?.men ?? 0 },
    { label: 'Unsorted', value: summary?.unknown ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro
        eyebrow="Insights / 01"
        title="The season, measured."
        description="A calm read on how the current collection is progressing from upload to publication."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="In collection" value={total} detail="Active pieces" accent />
        <StatCard label="Published" value={published} detail={`${Math.round((published / Math.max(total, 1)) * 100)}% ready`} />
        <StatCard label="Awaiting review" value={needsReview} detail="Needs your eye" />
        <StatCard label="Completion" value={`${Math.round(((total - needsReview) / Math.max(total, 1)) * 100)}%`} detail="Review progress" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Category mix</h2>
            <BarChart3 size={19} className="text-[var(--brand-gold)]" />
          </div>
          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">No categorised pieces yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {categories.map(([slug, count]) => (
                <div key={slug}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[hsl(var(--muted-foreground))]">{categoryLabel(slug)}</span>
                    <span className="font-mono-ui">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full bg-[var(--brand-navy)] dark:bg-[var(--brand-gold)]" style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Collection split</h2>
              <Package size={19} className="text-[var(--brand-gold)]" />
            </div>
            <div className="mt-6 space-y-4">
              {split.map((entry) => (
                <div key={entry.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[hsl(var(--muted-foreground))]">{entry.label}</span>
                    <span className="font-mono-ui">{entry.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full bg-[var(--brand-gold)]" style={{ width: `${(entry.value / Math.max(total, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--brand-navy)] p-5 text-[var(--brand-ivory)] sm:p-7">
            <div className="flex items-center gap-2 text-[var(--brand-gold)]">
              <ShieldCheck size={16} />
              <span className="font-mono-ui text-[10px] uppercase tracking-[.18em]">Catalogue health</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--brand-ivory)]/70">
              {settings?.businessName || BRAND.name} — {settings?.tagline || BRAND.tagline}
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-[var(--brand-ivory)]/60">
              <Sparkles size={14} className="text-[var(--brand-gold)]" /> Photography is uploaded per product and appears publicly once published.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
