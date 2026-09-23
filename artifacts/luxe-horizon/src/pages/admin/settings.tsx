import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, Save } from 'lucide-react';
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from '@workspace/api-client-react';
import { BrandLogo } from '@/components/brand-logo';
import { PageIntro, buttonPrimary } from '@/components/ui-kit';
import { BRAND } from '@/lib/brand';

const WHATSAPP_FALLBACK = import.meta.env.VITE_THE_BRAND_STORE_WHATSAPP || '';

export default function SettingsPage() {
  const { data } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey(), retry: false } });
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    whatsappNumber: WHATSAPP_FALLBACK,
    businessName: BRAND.name,
    tagline: BRAND.tagline,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      whatsappNumber: data.whatsappNumber || WHATSAPP_FALLBACK,
      businessName: data.businessName || BRAND.name,
      tagline: data.tagline || BRAND.tagline,
    });
  }, [data]);

  const save = () =>
    updateSettings.mutate(
      { data: form },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        },
      },
    );

  return (
    <div className="mx-auto max-w-[900px] px-4 py-7 sm:px-8 lg:px-10 lg:py-11">
      <PageIntro eyebrow="House / Settings" title="Keep it considered." description="A small set of details that quietly shape every catalogue touchpoint." />

      <div className="grid gap-5 md:grid-cols-[1fr_.7fr]">
        <section className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[var(--brand-gold)]">
              <MessageCircle size={18} />
            </div>
            <div>
              <h2 className="font-display text-2xl">WhatsApp enquiries</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Shown when a customer asks about a piece.</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {(
              [
                { key: 'whatsappNumber', label: 'WhatsApp number', testId: 'input-whatsapp-number' },
                { key: 'businessName', label: 'Business name', testId: 'input-business-name' },
                { key: 'tagline', label: 'Catalogue tagline', testId: 'input-catalogue-tagline' },
              ] as const
            ).map((field) => (
              <label key={field.key} className="block text-xs font-semibold">
                {field.label}
                <input
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  data-testid={field.testId}
                  className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[var(--brand-gold)]"
                />
              </label>
            ))}
          </div>

          <button type="button" onClick={save} disabled={updateSettings.isPending} className={`mt-8 ${buttonPrimary}`} data-testid="button-save-settings">
            {updateSettings.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {saved ? 'Saved' : 'Save settings'}
          </button>
        </section>

        <aside className="rounded-xl bg-[var(--brand-beige)] p-6 sm:p-8">
          <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[var(--brand-navy)]/60">Preview</p>
          <div className="mt-6">
            <BrandLogo />
          </div>
          <p className="mt-5 max-w-[220px] font-display text-2xl leading-tight text-[var(--brand-navy)]">{form.tagline}</p>
          <div className="mt-10 border-t border-[var(--brand-taupe)]/50 pt-4 text-xs text-[var(--brand-taupe-600)]">
            <p>{form.businessName}</p>
            <p className="mt-1">{form.whatsappNumber || 'No number set'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
