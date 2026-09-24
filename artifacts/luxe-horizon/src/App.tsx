import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownToLine, ArrowLeft, ArrowUpRight, BarChart3, Bell,
  Check, CheckCircle2, ChevronDown, ChevronRight, CloudUpload, Copy,
  ExternalLink, Eye, Filter, FolderOpen, Globe2, Heart,
  Image as ImageIcon, LayoutDashboard, ListFilter, Loader2, LockKeyhole,
  Menu, MessageCircle, MoreHorizontal, Moon, Package, Pencil, Plus, Save,
  Search, Send, Settings2, ShieldCheck, Sparkles, Sun, TrendingUp, Trash2, UploadCloud, X, Zap
} from 'lucide-react';
import {
  useHealthCheck,
  useListCollections,
  useCreateCollection,
  useGetCollection,
  useUpdateCollection,
  useDeleteCollection,
  useGetDashboard,
  useListProducts,
  useGetProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkUpdateProducts,
  useUploadProducts,
  useGetCatalogue,
  useGetPublicProduct,
  useGenerateCataloguePdf,
  useGetSettings,
  useUpdateSettings,
  getGetCollectionQueryKey,
  getGetProductQueryKey,
  getGetPublicProductQueryKey,
  getGetDashboardQueryKey,
  getListCollectionsQueryKey,
  getListProductsQueryKey,
  getGetCatalogueQueryKey,
  getGetSettingsQueryKey,
} from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generateBrandedCataloguePdf } from '@/lib/pdf';

const queryClient = new QueryClient();
const logo = '/assets/logo-gold.png';
const logoDark = '/assets/logo-light.png';
const heroImage = '/assets/brand-store-hero-approved.png';
const boardImage = '/assets/brand-board.png';
const placeholderImage = '/assets/product-placeholder.png';
const assetImageMap: Record<string, string> = {
  'brand-store-editorial-hero.png': placeholderImage,
  'brand-store-materials-board.png': placeholderImage,
  'product-placeholder.png': placeholderImage,
};

type Product = {
  id: string; collectionId: string; gender: 'men' | 'women' | 'unknown';
  category:
    | 'clothing' | 'dresses' | 'coats-jackets' | 'knitwear' | 'tops' | 'trousers' | 'skirts'
    | 'suits' | 'shirts'
    | 'bags' | 'handbags' | 'leather-goods' | 'shoes' | 'footwear'
    | 'accessories' | 'jewellery' | 'fine-jewellery' | 'watches' | 'travel' | 'gifts' | 'other';
  brand?: string | null; aiGender?: string | null; aiCategory?: string | null;
  aiBrand?: string | null; aiConfidence?: number | null; reviewed: boolean;
  isActive: boolean; isPublished: boolean; sortOrder: number; images: { id: string; imagePath: string; isPrimary: boolean; sortOrder: number }[];
};
type Collection = { id: string; name: string; slug: string; startDate?: string | null; endDate?: string | null; isPublished: boolean; publishedAt?: string | null; createdAt: string; updatedAt: string };

type ApiList<T> = T[] | { data?: T[] | { data?: T[]; items?: T[]; results?: T[] }; items?: T[]; results?: T[] } | null | undefined;
const normalizeList = <T,>(value: ApiList<T>): T[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const payload = value.data;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') return payload.data ?? payload.items ?? payload.results ?? [];
  return value.items ?? value.results ?? [];
};


const navGroups = [
  { label: 'Workspace', items: [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/upload', label: 'Upload batch', icon: CloudUpload },
    { href: '/admin/review', label: 'Review queue', icon: Eye },
  ] },
  { label: 'Catalogue', items: [
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/collections', label: 'Collections', icon: FolderOpen },
    { href: '/admin/catalogue', label: 'Publish & links', icon: Globe2 },
    { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  ] },
];
const CATEGORY_GROUPS: { label: string; options: [string, string][] }[] = [
  { label: 'Women', options: [['clothing', 'Clothing'], ['dresses', 'Dresses'], ['coats-jackets', 'Coats & Jackets'], ['knitwear', 'Knitwear'], ['tops', 'Tops'], ['trousers', 'Trousers'], ['skirts', 'Skirts']] },
  { label: 'Men', options: [['suits', 'Suits'], ['shirts', 'Shirts']] },
  { label: 'Luxury', options: [['handbags', 'Handbags'], ['fine-jewellery', 'Fine Jewellery'], ['leather-goods', 'Leather Goods'], ['travel', 'Travel'], ['gifts', 'Gifts']] },
  { label: 'Shared', options: [['bags', 'Bags'], ['shoes', 'Shoes'], ['footwear', 'Footwear'], ['accessories', 'Accessories'], ['jewellery', 'Jewellery'], ['watches', 'Watches'], ['other', 'Other']] },
];
const categoryLabels: Record<string, string> = Object.fromEntries(CATEGORY_GROUPS.flatMap((group) => group.options));
const apiCategoryFor = (category: Product['category']): 'clothing' | 'footwear' | 'watches' | 'bags' | 'accessories' | 'other' => {
  if (category === 'clothing' || category === 'footwear' || category === 'watches' || category === 'bags' || category === 'accessories') return category;
  if (category === 'shoes') return 'footwear';
  if (category === 'handbags' || category === 'leather-goods') return 'bags';
  return 'other';
};
const genderLabels: Record<string, string> = { men: 'Men', women: 'Women', unknown: 'Unsorted' };
const BRAND_OPTIONS = [
  'Alaïa', 'Alexander McQueen', 'Audemars Piguet', 'Balenciaga', 'Bottega Veneta', 'Brunello Cucinelli',
  'Bulgari', 'Burberry', 'Cartier', 'Celine', 'Chanel', 'Chloé', 'Dior', 'Dolce & Gabbana', 'Fendi',
  'Giorgio Armani', 'Givenchy', 'Gucci', 'Hermès', 'Jacquemus', 'Loewe', 'Loro Piana', 'Louis Vuitton',
  'Maison Margiela', 'Moncler', 'Omega', 'Patek Philippe', 'Prada', 'Rolex', 'Saint Laurent',
  'Tiffany & Co.', 'Tom Ford', 'The Row', 'Vacheron Constantin', 'Valentino', 'Van Cleef & Arpels', 'Versace',
].sort();
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Not set';
const resolveImage = (path?: string | null) => {
  if (!path) return placeholderImage;
  if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return assetImageMap[path] || placeholderImage;
};
const imageFor = (product: Product) => resolveImage(product.images?.find((image) => image.isPrimary)?.imagePath || product.images?.[0]?.imagePath);

function AppLogo({ dark = false }: { dark?: boolean }) {
  return <img src={dark ? logoDark : logo} alt="The Brand Store" className="h-10 w-auto object-contain" />;
}

function IconButton({ label, children, onClick, className = '' }: { label: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" aria-label={label} data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={onClick} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] ${className}`}>{children}</button>;
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setPending(true);
    setError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError('That email or password was not accepted.');
    setPending(false);
  };

  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--sidebar))] px-5 py-10 text-[hsl(var(--sidebar-foreground))] noise">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[.06] p-7 shadow-2xl sm:p-10">
      <AppLogo dark />
      <p className="mt-10 font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#c9a96a]">Private operations</p>
      <h1 className="mt-3 font-display text-4xl">Welcome back.</h1>
      <p className="mt-3 text-sm leading-6 text-white/60">Sign in to manage THE BRAND STORE catalogue.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-xs font-semibold">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-black/10 px-3 text-sm text-white outline-none focus:border-[#c9a96a]" autoComplete="email" /></label>
        <label className="block text-xs font-semibold">Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-black/10 px-3 text-sm text-white outline-none focus:border-[#c9a96a]" autoComplete="current-password" /></label>
        {error && <p role="alert" className="text-xs text-[#f0b4a2]">{error}</p>}
        <button type="submit" disabled={pending} className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c9a96a] px-5 text-xs font-semibold text-[#0b1f44] disabled:opacity-50">{pending ? <Loader2 size={15} className="animate-spin" /> : <LockKeyhole size={15} />} Enter private space</button>
      </form>
    </div>
  </div>;
}

function AuthenticatedAdmin({ children }: { children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session));
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setHasSession(Boolean(nextSession));
      setSessionReady(true);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) return <>{children}</>;
  if (!sessionReady) return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--sidebar))] text-[#c9a96a]"><Loader2 className="animate-spin" size={22} /></div>;
  return hasSession ? <>{children}</> : <AdminLogin />;
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'dark' | 'gold' | 'warning' | 'success' }) {
  const styles = { neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]', dark: 'bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]', gold: 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]', warning: 'bg-[#efe0c0] text-[#785a25]', success: 'bg-[#dbe9df] text-[#31583f]' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.13em] ${styles[tone]}`}>{children}</span>;
}

const ADMIN_THEME_KEY = 'brand-store-admin-theme';
function useAdminTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(ADMIN_THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(ADMIN_THEME_KEY, theme);
    return () => { document.documentElement.classList.remove('dark'); };
  }, [theme]);
  return [theme, setTheme] as const;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useAdminTheme();
  const { data: health } = useHealthCheck({ query: { queryKey: ['/api/healthz'] as const, staleTime: 30000 } });
  return <AuthenticatedAdmin><div className="min-h-[100dvh] bg-[hsl(var(--background))] noise">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] -translate-x-full flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : ''}`}>
      <div className="mb-10 flex items-center justify-between px-2"><AppLogo dark /><button onClick={() => setOpen(false)} className="rounded-full p-2 text-white/70 lg:hidden" aria-label="Close navigation"><X size={18} /></button></div>
      <div className="mb-8 rounded-xl border border-white/10 bg-white/[.05] p-3">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#c9a96a]">The Brand Store</p>
        <p className="mt-2 font-display text-[17px]">Catalogue operations</p>
      </div>
      <nav className="flex-1 space-y-7">
        {navGroups.map((group) => <div key={group.label}><p className="mb-2 px-3 font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/40">{group.label}</p><div className="space-y-1">{group.items.map(({ href, label, icon: NavIcon }) => <Link key={href} href={href} onClick={() => setOpen(false)} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition ${location === href ? 'bg-white/[.12] text-[#c9a96a]' : 'text-white/70 hover:bg-white/[.07] hover:text-white'}`}><NavIcon size={17} strokeWidth={1.6} /><span>{label}</span></Link>)}</div></div>)}
      </nav>
      <div className="border-t border-white/10 pt-5"><Link href="/admin/settings" className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] ${location === '/admin/settings' ? 'bg-white/[.12] text-[#c9a96a]' : 'text-white/70 hover:text-white'}`}><Settings2 size={17} strokeWidth={1.6} /> Settings</Link><div className="mt-5 flex items-center justify-between px-3 text-[10px] text-white/40"><span className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-emerald-400' : 'bg-[#c9a96a]'}`} /> {health ? 'System online' : 'System status unavailable'}</span><span>v1.0.4</span></div></div>
    </aside>
    <div className="lg:pl-[272px]">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 px-5 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-full p-2 lg:hidden" aria-label="Open navigation"><Menu size={21} /></button><div className="lg:hidden"><AppLogo /></div><div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] lg:flex"><ShieldCheck size={15} className="text-[hsl(var(--primary))]" /> Private operations space</div></div>
        <div className="flex items-center gap-2"><IconButton label="Notifications"><Bell size={17} /></IconButton><button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode" aria-pressed={theme === 'dark'} data-testid="button-toggle-theme" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}<span className="sr-only">Toggle dark mode</span></button><div className="ml-2 flex items-center gap-2 border-l border-[hsl(var(--border))] pl-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-display text-sm text-[hsl(var(--primary-foreground))]">TB</span><span className="hidden text-xs font-semibold sm:block">Operations</span><ChevronDown size={14} className="hidden text-[hsl(var(--muted-foreground))] sm:block" /></div></div>
      </header>
      <main>{children}</main>
    </div>
  </div></AuthenticatedAdmin>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[hsl(var(--primary))]">{eyebrow}</p><h1 className="mt-2 font-display text-4xl tracking-[-.03em] text-[hsl(var(--foreground))] sm:text-5xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p></div>{action}</div>;
}

function StatCard({ label, value, detail, accent = false }: { label: string; value: string | number; detail: string; accent?: boolean }) {
  return <div className={`rounded-xl border p-5 ${accent ? 'border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))]'}`}><p className={`font-mono-ui text-[9px] uppercase tracking-[.15em] ${accent ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>{label}</p><p className="mt-3 font-display text-4xl">{value}</p><p className={`mt-2 text-xs ${accent ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>{detail}</p></div>;
}

function DashboardPage() {
  const { data: summary, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), retry: false } });
  const current = summary?.collection;
  const { data: collectionDetail } = useGetCollection(current?.id || '', { query: { enabled: !!current?.id, queryKey: getGetCollectionQueryKey(current?.id || ''), retry: false } });
  const total = summary?.totalUploaded ?? 0;
  const needsReview = summary?.needsReview ?? 0;
  const published = summary?.published ?? 0;
  const categories = summary?.categories ?? {};
  return <AdminShell><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <PageIntro eyebrow="Operations" title="Catalogue overview" description="Review the current catalogue and publishing status." action={<Link href="/admin/upload" data-testid="link-upload-new-batch" className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg"><Plus size={16} /> Upload new batch</Link>} />
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{isLoading ? [1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />) : <><StatCard label="Uploaded this season" value={total} detail="From catalogue data" accent /><StatCard label="Needs your eye" value={needsReview} detail="From catalogue data" /><StatCard label="Published to catalogue" value={published} detail={`${Math.round((published / Math.max(total, 1)) * 100)}% of collection`} /><StatCard label="Unsorted" value={summary?.unknown ?? 3} detail="AI confidence below 70%" /></>}</div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
       <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-editorial sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><Badge tone="gold"><Sparkles size={11} /> Collection</Badge></div><h2 className="mt-4 font-display text-3xl">{collectionDetail?.name || current?.name || 'No active collection'}</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{current ? `${formatDate(current.startDate)} — ${formatDate(current.endDate)}` : 'Create a collection to begin'}</p></div><Link href="/admin/collections" className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">Manage collection <ArrowUpRight size={14} /></Link></div><div className="mt-9 grid gap-7 sm:grid-cols-2"><div><div className="mb-2 flex items-end justify-between text-xs"><span className="text-[hsl(var(--muted-foreground))]">Review progress</span><strong>{total - needsReview} / {total}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${((total - needsReview) / Math.max(total, 1)) * 100}%` }} /></div></div><div><div className="mb-2 flex items-end justify-between text-xs"><span className="text-[hsl(var(--muted-foreground))]">Catalogue ready</span><strong>{published} / {total}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[#c9a96a]" style={{ width: `${(published / Math.max(total, 1)) * 100}%` }} /></div></div></div><div className="mt-10 grid grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-5"><div><p className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">MEN</p><p className="mt-1 text-2xl font-semibold">{summary?.men ?? 21}</p></div><div><p className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">WOMEN</p><p className="mt-1 text-2xl font-semibold">{summary?.women ?? 24}</p></div><div><p className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">UNKNOWN</p><p className="mt-1 text-2xl font-semibold text-[hsl(var(--primary))]">{summary?.unknown ?? 3}</p></div></div></section>
      <section className="rounded-2xl bg-[#eadcc6] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#9a8f7f]">Quick actions</p><h2 className="mt-2 font-display text-2xl text-[#0b1f44]">Quick actions</h2></div><Zap size={22} className="text-[#c9a96a]" /></div><div className="mt-7 space-y-2"><Link href="/admin/review" className="group flex items-center justify-between rounded-xl bg-[#f8f5ed] p-4 transition hover:-translate-y-0.5"><span className="flex items-center gap-3 text-sm font-semibold text-[#0b1f44]"><Eye size={17} className="text-[#c9a96a]" /> Review unsure items </span><ChevronRight size={16} className="transition group-hover:translate-x-1" /></Link><Link href="/admin/catalogue" className="group flex items-center justify-between rounded-xl bg-[#f8f5ed] p-4 transition hover:-translate-y-0.5"><span className="flex items-center gap-3 text-sm font-semibold text-[#0b1f44]"><Send size={17} className="text-[#c9a96a]" /> Share catalogue link</span><ChevronRight size={16} className="transition group-hover:translate-x-1" /></Link><Link href="/admin/collections" className="group flex items-center justify-between rounded-xl bg-[#f8f5ed] p-4 transition hover:-translate-y-0.5"><span className="flex items-center gap-3 text-sm font-semibold text-[#0b1f44]"><FolderOpen size={17} className="text-[#c9a96a]" /> View collection history</span><ChevronRight size={16} className="transition group-hover:translate-x-1" /></Link></div></section>
    </div>
    <section className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Category mix</p><h2 className="mt-2 font-display text-2xl">This collection, by edit.</h2></div><BarChart3 size={19} className="text-[hsl(var(--primary))]" /></div><div className="mt-7 space-y-4">{Object.entries(categories).map(([name, count]) => <div key={name} className="flex items-center gap-3 text-sm"><span className="w-20 text-[hsl(var(--muted-foreground))]">{categoryLabels[name] ?? name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[#c9a96a]" style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} /></div><span className="w-6 text-right font-mono-ui text-xs">{count}</span></div>)}</div></div><div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-[hsl(var(--sidebar))]"><img src={heroImage} alt="The Brand Store editorial campaign" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen" /><div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sidebar))] via-[hsl(var(--sidebar))]/50 to-transparent" /><div className="relative flex h-full max-w-sm flex-col justify-end p-7 text-white sm:p-9"><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#c9a96a]">House note</p><p className="mt-3 font-display text-3xl leading-tight">“The catalogue should feel like a well-kept room.”</p><p className="mt-4 text-xs text-white/60">A point of view from THE BRAND STORE team.</p></div></div></section>
  </div></AdminShell>;
}

function UploadPage() {
  const { data: collections } = useListCollections({ query: { queryKey: getListCollectionsQueryKey(), retry: false } });
  const uploadProducts = useUploadProducts();
  const [files, setFiles] = useState<File[]>([]);
  const [hint, setHint] = useState<'mixed' | 'men' | 'women'>('mixed');
  const [collectionId, setCollectionId] = useState('');
  const [message, setMessage] = useState('');
  const collectionList = normalizeList<Collection>(collections);
  const activeCollections = collectionList;
  const addFiles = (incoming: FileList | null) => incoming && setFiles((current) => [...current, ...Array.from(incoming)]);
  const submit = () => {
    if (!files.length) { setMessage('Choose at least one image to start a batch.'); return; }
    uploadProducts.mutate({ data: { collectionId, batchHint: hint, images: files.map((file) => ({ imagePath: file.name, imageUrl: URL.createObjectURL(file) })) } }, { onSuccess: () => setMessage('Batch uploaded. AI sorting is now running.'), onError: () => setMessage('The batch could not be uploaded. Please try again.') });
  };
  return <AdminShell><div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><PageIntro eyebrow="Workspace / 02" title="Bring in the edit." description="Upload a clean batch, give the sorter a direction, then let it prepare the first pass." action={<Badge tone="success"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Storage ready</Badge>} />
    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Batch setup</p><h2 className="mt-2 font-display text-2xl">Start with context.</h2></div><span className="font-mono-ui text-xs text-[hsl(var(--muted-foreground))]">01 / 02</span></div><label className="mb-5 block text-xs font-semibold">Collection<select value={collectionId} onChange={(event) => setCollectionId(event.target.value)} data-testid="select-upload-collection" className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[hsl(var(--primary))]">{activeCollections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></label><div><p className="text-xs font-semibold">Batch hint</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A useful nudge for AI, not a hard rule.</p><div className="mt-3 grid grid-cols-3 gap-2">{(['mixed', 'men', 'women'] as const).map((option) => <button type="button" key={option} onClick={() => setHint(option)} data-testid={`button-batch-hint-${option}`} className={`rounded-lg border px-3 py-3 text-xs font-semibold capitalize transition ${hint === option ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/[.07] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'}`}>{option}</button>)}</div></div><label className="mt-7 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#9a8f7f] bg-[#f8f5ed] px-6 text-center transition hover:border-[hsl(var(--primary))]"><UploadCloud size={29} className="text-[hsl(var(--primary))]" /><span className="mt-4 font-display text-2xl text-[#0b1f44]">Drop the campaign images here</span><span className="mt-2 text-xs text-[#9a8f7f]">JPG, PNG or WEBP · Up to 50MB each</span><span className="mt-5 rounded-full border border-[#ad9787] px-4 py-2 text-xs font-semibold text-[#5d463e]">Browse files</span><input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} data-testid="input-upload-images" /></label>{files.length > 0 && <div className="mt-5 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-xs"><ImageIcon size={15} className="text-[hsl(var(--primary))]" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{(file.size / 1024 / 1024).toFixed(1)} MB</span><button type="button" onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`}><X size={14} /></button></div>)}</div>}<div className="mt-7 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[hsl(var(--muted-foreground))]">{message || (files.length ? `${files.length} image${files.length === 1 ? '' : 's'} ready for sorting.` : 'Nothing staged yet.')}</p><button type="button" disabled={uploadProducts.isPending} onClick={submit} data-testid="button-upload-and-sort" className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-[hsl(var(--primary-foreground))] disabled:opacity-50">{uploadProducts.isPending ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} Upload & sort</button></div></section>
      <aside className="space-y-5"><div className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white sm:p-8"><div className="flex items-center gap-2 text-[#c9a96a]"><Sparkles size={17} /><span className="font-mono-ui text-[10px] uppercase tracking-[.18em]">AI sorting</span></div><h2 className="mt-5 font-display text-3xl leading-tight">A first pass, not a final word.</h2><p className="mt-3 text-sm leading-6 text-white/65">THE BRAND STORE reads each image for gender, category and brand. Low-confidence items stay in your review queue, never hidden.</p><div className="mt-7 space-y-3 border-t border-white/10 pt-5"><div className="flex items-center gap-3 text-xs"><CheckCircle2 size={15} className="text-[#c9a96a]" /> Recognises visual categories</div><div className="flex items-center gap-3 text-xs"><CheckCircle2 size={15} className="text-[#c9a96a]" /> Flags unsure classifications</div><div className="flex items-center gap-3 text-xs"><CheckCircle2 size={15} className="text-[#c9a96a]" /> Keeps originals untouched</div></div></div><div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Before you upload</p><ul className="mt-4 space-y-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]"><li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--primary))]" />Keep one product per frame where possible.</li><li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--primary))]" />Use a batch hint when the edit is directional.</li><li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--primary))]" />You can always correct the sort in review.</li></ul></div></aside></div>
  </div></AdminShell>;
}

function ReviewPage() {
  const { data } = useListProducts({ reviewed: false }, { query: { queryKey: getListProductsQueryKey({ reviewed: false }), retry: false } });
  const updateProduct = useUpdateProduct();
  const bulkUpdate = useBulkUpdateProducts();
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unknown'>('all');
  const productList = normalizeList<Product>(data);
  const products = productList.filter((product) => filter === 'all' || product.gender === 'unknown');
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const review = (product: Product, reviewed = true) => updateProduct.mutate({ productId: product.id, data: { reviewed, gender: product.gender, category: apiCategoryFor(product.category), brand: product.brand || null } });
  return <AdminShell><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><PageIntro eyebrow="Workspace / 03" title="Trust, then tune." description="The unsure queue is deliberately small. Confirm what feels right and keep the house language consistent." action={<Link href="/admin/products" className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-3 text-xs font-semibold"><ListFilter size={15} /> All products</Link>} /><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] p-1">{(['all', 'unknown'] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${filter === item ? 'bg-[hsl(var(--card))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-review-filter-${item}`}>{item === 'all' ? `All unsure (${products.length})` : 'Unknown only'}</button>)}</div>{selected.length > 0 && <div className="flex items-center gap-2"><span className="text-xs text-[hsl(var(--muted-foreground))]">{selected.length} selected</span><button type="button" onClick={() => bulkUpdate.mutate({ data: { productIds: selected, reviewed: true } })} className="rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]" data-testid="button-bulk-approve">Approve selected</button></div>}</div>{products.length === 0 ? <EmptyState icon={<CheckCircle2 />} title="The queue is clear." description="Every item has been reviewed for this collection." action={<Link href="/admin/products" className="rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-white">Browse products</Link>} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product, index) => <article key={product.id} className="animate-rise overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-editorial" style={{ animationDelay: `${index * 55}ms` }}><div className="relative aspect-[1.15] overflow-hidden bg-[#eadcc6]"><img src={imageFor(product)} alt={`${product.brand || 'Unsorted'} ${categoryLabels[product.category]}`} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" /><button type="button" onClick={() => toggle(product.id)} aria-label={`Select product ${product.id}`} className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border ${selected.includes(product.id) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-white/70 bg-black/20 text-white'}`} data-testid={`button-select-product-${product.id}`}>{selected.includes(product.id) && <Check size={14} />}</button><Badge tone={product.gender === 'unknown' ? 'warning' : 'gold'}>{Math.round((product.aiConfidence || .5) * 100)}% confidence</Badge><div className="absolute right-3 top-3"><Badge tone={product.gender === 'unknown' ? 'warning' : 'dark'}>{genderLabels[product.gender]}</Badge></div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{product.id}</p><h2 className="mt-1 font-display text-2xl">{product.brand || 'Brand to confirm'}</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{categoryLabels[product.category]} · AI suggested {product.aiCategory || 'other'}</p></div><IconButton label={`Edit ${product.id}`}><Pencil size={15} /></IconButton></div><div className="mt-5 flex gap-2"><button type="button" onClick={() => review(product, true)} className="flex-1 rounded-full bg-[hsl(var(--primary))] px-3 py-2.5 text-xs font-semibold text-white" data-testid={`button-approve-${product.id}`}>Approve</button><button type="button" onClick={() => review(product, false)} className="rounded-full border border-[hsl(var(--border))] px-3 py-2.5 text-xs font-semibold" data-testid={`button-keep-unsure-${product.id}`}>Keep unsure</button></div></div></article>)}</div>}</div></AdminShell>;
}

function ProductCard({ product, onDelete }: { product: Product; onDelete?: (id: string) => void }) {
  return <article className="group overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))]"><Link href={`/catalogue/product/${product.id}`} className="relative block aspect-[.85] overflow-hidden bg-[#eadcc6]"><img src={imageFor(product)} alt={`${product.brand || 'The Brand Store'} ${categoryLabels[product.category]}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /><div className="absolute left-3 top-3"><Badge tone={product.isPublished ? 'success' : 'neutral'}>{product.isPublished ? 'Live' : 'Draft'}</Badge></div><button type="button" onClick={(event) => { event.preventDefault(); onDelete?.(product.id); }} aria-label={`Delete product ${product.id}`} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white opacity-0 transition group-hover:opacity-100" data-testid={`button-delete-product-${product.id}`}><Trash2 size={14} /></button></Link><div className="p-4"><div className="flex items-center justify-between gap-2"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{genderLabels[product.gender]} / {categoryLabels[product.category]}</p><h3 className="mt-1 font-display text-xl">{product.brand || 'The Brand Store'}</h3></div><button type="button" aria-label={`Edit product ${product.id}`} className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" data-testid={`button-edit-product-${product.id}`}><MoreHorizontal size={16} /></button></div></div></article>;
}

function ProductsPage() {
  const { data } = useListProducts(undefined, { query: { queryKey: getListProductsQueryKey(), retry: false } });
  const deleteProduct = useDeleteProduct();
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('all');
  const productList = normalizeList<Product>(data);
  const products = productList.filter((product) => `${product.brand || ''} ${product.category}`.toLowerCase().includes(search.toLowerCase()) && (gender === 'all' || product.gender === gender));
  return <AdminShell><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><PageIntro eyebrow="Catalogue / 01" title="The product room." description="Everything in the active collection, from first upload to public-facing finish." action={<Link href="/admin/upload" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-white"><Plus size={15} /> Add products</Link>} /><div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><label className="relative block max-w-md flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search brand or category" data-testid="input-search-products" className="h-11 w-full rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-10 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label><div className="flex items-center gap-2"><Filter size={15} className="text-[hsl(var(--muted-foreground))]" />{['all', 'women', 'men', 'unknown'].map((item) => <button type="button" key={item} onClick={() => setGender(item)} className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${gender === item ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))]'}`} data-testid={`button-filter-${item}`}>{item === 'all' ? 'All' : genderLabels[item]}</button>)}</div></div>{products.length === 0 ? <EmptyState icon={<Package />} title="No products match this edit." description="Try another brand, category or gender filter." /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} onDelete={(id) => { if (window.confirm('Remove this product from the collection?')) deleteProduct.mutate({ productId: id }); }} />)}</div>}</div></AdminShell>;
}

function CollectionsPage() {
  const { data } = useListCollections({ query: { queryKey: getListCollectionsQueryKey(), retry: false } });
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const collectionList = normalizeList<Collection>(data);
  const collections = collectionList;
  const submit = () => { const clean = name.trim(); if (!clean) return; createCollection.mutate({ data: { name: clean, slug: clean.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'), startDate: null, endDate: null } }, { onSuccess: () => { setName(''); setShowCreate(false); } }); };
  return <AdminShell><div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><PageIntro eyebrow="Catalogue / 02" title="Collection history." description="Seasons have a lifespan. Keep the archive orderly, and only let one edit lead the room." action={<button type="button" onClick={() => setShowCreate((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-white" data-testid="button-new-collection"><Plus size={15} /> New collection</button>} />{showCreate && <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--card))] p-4 sm:flex-row"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Resort 2027" data-testid="input-new-collection-name" className="h-11 flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" /><button type="button" onClick={submit} className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-xs font-semibold text-white" data-testid="button-save-collection">Create collection</button></div>}<div className="space-y-3">{collections.map((collection, index) => <div key={collection.id} className={`group flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${index === 0 ? 'border-[hsl(var(--primary))]/25 bg-[hsl(var(--card))] shadow-editorial' : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))]'}`}><div className="flex items-start gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${index === 0 ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><FolderOpen size={20} /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">{collection.name}</h2>{collection.isPublished ? <Badge tone="success">Published</Badge> : <Badge>Archive</Badge>}</div><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{formatDate(collection.startDate)} — {formatDate(collection.endDate)} <span className="mx-1">·</span> /{collection.slug}</p></div></div><div className="flex items-center gap-2 sm:justify-end"><span className="mr-2 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{index === 0 ? '48 products' : 'Closed'}</span>{!collection.isPublished && <button type="button" onClick={() => updateCollection.mutate({ collectionId: collection.id, data: { isPublished: true } })} className="rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-white" data-testid={`button-publish-collection-${collection.id}`}>Publish</button>}<IconButton label={`More actions for ${collection.name}`} onClick={() => { if (window.confirm('Delete this collection?')) deleteCollection.mutate({ collectionId: collection.id }); }}><MoreHorizontal size={16} /></IconButton></div></div>)}</div></div></AdminShell>;
}

function CatalogueAdminPage() {
  const { data: catalogue } = useGetCatalogue(undefined, { query: { queryKey: getGetCatalogueQueryKey(), retry: false } });
  const generatePdf = useGenerateCataloguePdf();
  const catalogueProducts = normalizeList<Product>(catalogue?.products as ApiList<Product>);
  const products = catalogueProducts;
  const [gender, setGender] = useState('all');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const filtered = products.filter((product) => (gender === 'all' || product.gender === gender) && (category === 'all' || product.category === category) && (brand === 'all' || product.brand === brand));
  const brands = [...new Set([...BRAND_OPTIONS, ...products.flatMap((product) => product.brand ? [product.brand] : [])])].sort();
  const copyLink = () => {
    const query = new URLSearchParams();
    if (gender !== 'all') query.set('gender', gender);
    if (category !== 'all') query.set('category', category);
    if (brand !== 'all') query.set('brand', brand);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    navigator.clipboard?.writeText(`${window.location.origin}/catalogue${suffix}`);
  };
  const downloadPdf = async () => {
    const title = catalogue?.collection?.name || 'The Brand Store catalogue';
    try {
      await generatePdf.mutateAsync({ data: { title, productIds: filtered.filter((product) => product.isPublished).map((product) => product.id) } });
    } catch {
      // Local export remains available while the server-side PDF worker is configured.
    }
    await generateBrandedCataloguePdf(title, filtered.filter((product) => product.isPublished), resolveImage);
  };
  return <AdminShell>
    <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro eyebrow="Catalogue / 03" title="Publish with composure." description="Decide what is ready for the outside world, then share one considered link." action={<button type="button" onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-3 text-xs font-semibold" data-testid="button-copy-catalogue-link"><Copy size={15} /> Copy public link</button>} />
      <section className="mb-5 overflow-hidden rounded-2xl bg-[hsl(var(--sidebar))] text-white">
        <div className="grid md:grid-cols-[1fr_.8fr]">
          <div className="p-7 sm:p-10">
            <Badge tone="gold"><Globe2 size={11} /> Customer-facing</Badge>
            <h2 className="mt-5 max-w-lg font-display text-4xl leading-tight">A catalogue that gives the edit room to breathe.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/60">Your public link is live with {filtered.filter((product) => product.isPublished).length} published products from {catalogue?.collection?.name || 'The Brand Store catalogue'}.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogue" className="inline-flex items-center gap-2 rounded-full bg-[#c9a96a] px-5 py-3 text-xs font-semibold text-[#0b1f44]">View public catalogue <ExternalLink size={14} /></Link>
              <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-semibold text-white" data-testid="button-generate-pdf"><ArrowDownToLine size={14} /> {generatePdf.isPending ? 'Preparing PDF' : 'Generate private PDF'}</button>
            </div>
          </div>
          <div className="relative min-h-[260px]"><img src={boardImage} alt="The Brand Store materials" className="absolute inset-0 h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sidebar))] via-transparent to-transparent" /></div>
        </div>
      </section>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-semibold">Link view</span>
        {['all', 'women', 'men', 'unknown'].map((item) => <button type="button" key={item} onClick={() => setGender(item)} className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${gender === item ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))]'}`} data-testid={`button-catalogue-filter-${item}`}>{item === 'all' ? 'All products' : genderLabels[item]}</button>)}
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-full border border-[hsl(var(--border))] bg-transparent px-3 text-xs" data-testid="select-admin-catalogue-category"><option value="all">All categories</option>{CATEGORY_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</optgroup>)}</select>
        <select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-9 max-w-[150px] rounded-full border border-[hsl(var(--border))] bg-transparent px-3 text-xs" data-testid="select-admin-catalogue-brand"><option value="all">All houses</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))]">
        <div className="hidden grid-cols-[1fr_120px_120px_100px] gap-4 border-b border-[hsl(var(--border))] px-5 py-3 font-mono-ui text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:grid"><span>Product</span><span>Gender</span><span>State</span><span>Action</span></div>
        {filtered.slice(0, 8).map((product) => <div key={product.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-4 last:border-0 sm:grid-cols-[1fr_120px_120px_100px] sm:gap-4 sm:px-5"><div className="flex items-center gap-3"><img src={imageFor(product)} alt="" className="h-11 w-11 rounded-lg object-cover" /><div><p className="text-sm font-semibold">{product.brand || 'The Brand Store'}</p><p className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{product.id}</p></div></div><span className="hidden text-xs capitalize text-[hsl(var(--muted-foreground))] sm:block">{genderLabels[product.gender]}</span><span className="justify-self-end sm:justify-self-start"><Badge tone={product.isPublished ? 'success' : 'neutral'}>{product.isPublished ? 'Live' : 'Draft'}</Badge></span><Link href={`/catalogue/product/${product.id}`} className="hidden text-xs font-semibold text-[hsl(var(--primary))] sm:block">Open</Link></div>)}
      </div>
    </div>
  </AdminShell>;
}

function SettingsPage() {
  const { data } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey(), retry: false } });
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState({ whatsappNumber: data?.whatsappNumber || import.meta.env.VITE_BRAND_STORE_WHATSAPP || '', businessName: data?.businessName || 'The Brand Store', tagline: data?.tagline || 'Luxury lives here' });
  const save = () => updateSettings.mutate({ data: form });
  return <AdminShell><div className="mx-auto max-w-[900px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><PageIntro eyebrow="House / Settings" title="Keep it considered." description="A small set of details that quietly shape every catalogue touchpoint." /><div className="grid gap-5 md:grid-cols-[1fr_.7fr]"><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><MessageCircle size={18} /></div><div><h2 className="font-display text-2xl">WhatsApp enquiries</h2><p className="text-xs text-[hsl(var(--muted-foreground))]">Shown when a customer asks about a piece.</p></div></div><div className="mt-7 space-y-5"><label className="block text-xs font-semibold">WhatsApp number<input value={form.whatsappNumber} onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })} data-testid="input-whatsapp-number" className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label><label className="block text-xs font-semibold">Business name<input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} data-testid="input-business-name" className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label><label className="block text-xs font-semibold">Catalogue tagline<input value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} data-testid="input-catalogue-tagline" className="mt-2 h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label></div><button type="button" onClick={save} disabled={updateSettings.isPending} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50" data-testid="button-save-settings">{updateSettings.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save settings</button></section><aside className="rounded-2xl bg-[#eadcc6] p-6 sm:p-8"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#9a8f7f]">Preview</p><img src={logo} alt="The Brand Store" className="mt-7 h-12 w-auto object-contain object-left" /><p className="mt-4 max-w-[220px] font-display text-2xl leading-tight text-[#0b1f44]">{form.tagline}</p><div className="mt-10 border-t border-[#bca999] pt-4 text-xs text-[#9a8f7f]"><p>{form.businessName}</p><p className="mt-1">{form.whatsappNumber}</p></div></aside></div></div></AdminShell>;
}

function BrandStoreCataloguePage() {
  const [location] = useLocation();
  const { data: catalogue } = useGetCatalogue(undefined, { query: { queryKey: getGetCatalogueQueryKey(), retry: false } });
  const params = new URLSearchParams(location.split('?')[1] || '');
  const [gender, setGender] = useState(params.get('gender') || 'all');
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [brand, setBrand] = useState(params.get('brand') || 'all');
  const catalogueProducts = normalizeList<Product>(catalogue?.products as ApiList<Product>);
  const products = catalogueProducts;
  const brands = Array.isArray(catalogue?.availableBrands) && catalogue.availableBrands.length ? catalogue.availableBrands : BRAND_OPTIONS;
  const visible = products.filter((product) => (gender === 'all' || product.gender === gender) && (category === 'all' || product.category === category) && (brand === 'all' || product.brand === brand));
  const updateFilter = (key: 'gender' | 'category' | 'brand', value: string) => {
    const next = new URLSearchParams(location.split('?')[1] || '');
    value === 'all' ? next.delete(key) : next.set(key, value);
    if (key === 'gender') setGender(value);
    if (key === 'category') setCategory(value);
    if (key === 'brand') setBrand(value);
    window.history.replaceState({}, '', `${window.location.pathname}${next.toString() ? `?${next}` : ''}`);
  };
  return <div className="min-h-[100dvh] bg-[#f8f5ed] text-[#0b1f44]">
    <header className="border-b border-[#d8c8ad] bg-[#f8f5ed]">
      <div className="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/catalogue" aria-label="The Brand Store home"><AppLogo dark /></Link>
        <nav className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[.18em] md:flex"><a href="#collection">Collection</a><a href="#new-arrivals">New arrivals</a><a href="#about">About</a></nav>
        <Link href="/catalogue" className="text-[11px] font-medium uppercase tracking-[.18em]">Catalogue</Link>
      </div>
    </header>
    <main>
      <section className="mx-auto max-w-[1320px] px-5 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-10">
        <div className="relative min-h-[430px] overflow-hidden bg-[#0b1f44] sm:min-h-[560px]">
          <img src={heroImage} alt="Ivory and champagne objects arranged on deep navy architectural plinths" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f44]/90 via-[#0b1f44]/35 to-transparent" />
          <div className="relative flex min-h-[430px] max-w-[560px] flex-col justify-end px-7 py-9 text-[#f8f5ed] sm:min-h-[560px] sm:px-14 sm:py-14">
            <p className="text-[11px] font-medium uppercase tracking-[.22em] text-[#c9a96a]">The Brand Store</p>
            <h1 className="mt-4 max-w-[440px] font-display text-5xl leading-[.98] tracking-[-.035em] sm:text-7xl">Luxury lives here.</h1>
            <p className="mt-5 max-w-[380px] text-sm leading-6 text-[#f8f5ed]/80">A curated collection of exceptional pieces from distinctive houses.</p>
            <a href="#new-arrivals" className="mt-7 inline-flex w-fit items-center gap-2 border-b border-[#c9a96a] pb-2 text-[11px] font-medium uppercase tracking-[.18em] text-[#f8f5ed]">Explore collection <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </section>
      <section id="collection" className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 border-y border-[#d8c8ad] py-3">
          {['all', 'women', 'men'].map((item) => <button key={item} type="button" onClick={() => updateFilter('gender', item)} className={`px-3 py-2 text-[11px] font-medium uppercase tracking-[.16em] ${gender === item ? 'bg-[#0b1f44] text-[#f8f5ed]' : 'text-[#0b1f44]/65 hover:text-[#0b1f44]'}`}>{item === 'all' ? 'All' : item}</button>)}
          <select aria-label="Filter by category" value={category} onChange={(event) => updateFilter('category', event.target.value)} className="ml-2 h-9 border-0 border-l border-[#d8c8ad] bg-transparent pl-4 text-[11px] uppercase tracking-[.12em] outline-none"><option value="all">All categories</option>{CATEGORY_GROUPS.flatMap((group) => group.options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="Filter by brand" value={brand} onChange={(event) => updateFilter('brand', event.target.value)} className="h-9 border-0 border-l border-[#d8c8ad] bg-transparent pl-4 text-[11px] uppercase tracking-[.12em] outline-none"><option value="all">All brands</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </section>
      <section id="new-arrivals" className="mx-auto max-w-[1320px] px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <div className="mb-8 flex items-end justify-between border-b border-[#d8c8ad] pb-5"><div><p className="text-[11px] font-medium uppercase tracking-[.2em] text-[#9a8f7f]">New arrivals</p><h2 className="mt-2 font-display text-4xl tracking-[-.03em] sm:text-5xl">Latest arrivals</h2></div><span className="text-xs text-[#9a8f7f]">{visible.length} pieces</span></div>
        {visible.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{visible.map((product) => <Link key={product.id} href={`/catalogue/product/${product.id}`} className="group"><div className="aspect-[.78] overflow-hidden bg-[#eadcc6]"><img src={imageFor(product)} alt={`${product.brand || 'The Brand Store'} ${categoryLabels[product.category] || 'piece'}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div><p className="mt-4 text-sm font-medium">{product.brand || 'The Brand Store edit'}</p><p className="mt-1 text-[11px] uppercase tracking-[.14em] text-[#9a8f7f]">{categoryLabels[product.category] || product.category}</p></Link>)}</div> : <p className="py-20 text-center text-sm text-[#9a8f7f]">No pieces match this edit.</p>}
      </section>
    </main>
    <footer id="about" className="border-t border-[#d8c8ad] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-[1320px] justify-between text-[11px] uppercase tracking-[.16em] text-[#9a8f7f]"><span>The Brand Store</span><span>Luxury lives here.</span></div></footer>
  </div>;
}

function CataloguePage() {
  const [location] = useLocation();
  const { data: catalogue } = useGetCatalogue(undefined, { query: { queryKey: getGetCatalogueQueryKey(), retry: false } });
  const sharedGender = new URLSearchParams(location.split('?')[1] || '').get('gender') || 'all';
  const sharedCategory = new URLSearchParams(location.split('?')[1] || '').get('category') || 'all';
  const sharedBrand = new URLSearchParams(location.split('?')[1] || '').get('brand') || 'all';
  const [gender, setGender] = useState(sharedGender);
  const [category, setCategory] = useState(sharedCategory);
  const [brand, setBrand] = useState(sharedBrand);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const products = normalizeList<Product>(catalogue?.products);
  const brands = catalogue?.availableBrands?.length ? catalogue.availableBrands : BRAND_OPTIONS;
  const visible = products.filter((product) => (gender === 'all' || product.gender === gender) && (category === 'all' || product.category === category) && (brand === 'all' || product.brand === brand));
  return <div className="min-h-[100dvh] bg-[#f8f5ed] text-[#0b1f44] noise"><header className="sticky top-0 z-30 border-b border-[#eadcc6] bg-[#f8f5ed]/95 backdrop-blur-md"><div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8"><Link href="/catalogue" data-testid="link-catalogue-home"><AppLogo /></Link><div className="hidden items-center gap-7 text-[11px] uppercase tracking-[.16em] md:flex"><a href="#collection" className="hover:text-[#0b1f44]">The collection</a><a href="#about" className="hover:text-[#0b1f44]">The house</a></div><IconButton label="Catalogue menu" onClick={() => setMobileMenuOpen((current) => !current)} className="md:hidden"><Menu size={18} /></IconButton></div>{mobileMenuOpen && <nav aria-label="Mobile catalogue navigation" className="border-t border-[#eadcc6] bg-[#f8f5ed] px-5 py-4 md:hidden"><div className="mx-auto flex max-w-[1380px] flex-col gap-3 text-[11px] uppercase tracking-[.16em]"><a href="#collection" onClick={() => setMobileMenuOpen(false)}>The collection</a><a href="#about" onClick={() => setMobileMenuOpen(false)}>The house</a></div></nav>}</header><main><section className="relative mx-auto grid max-w-[1380px] overflow-hidden px-5 pb-10 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-12 lg:pb-16 lg:pt-16"><div className="relative z-10 flex flex-col justify-center pb-9 lg:pb-0"><p className="font-mono-ui text-[10px] uppercase tracking-[.23em] text-[#9a8f7f]">THE BRAND STORE / {catalogue?.collection?.name || 'Autumn / Winter 2026'}</p><h1 className="mt-5 max-w-xl font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">A private view of <em className="text-[#0b1f44]">what’s next.</em></h1><p className="mt-6 max-w-md text-sm leading-7 text-[#9a8f7f]">A considered edit of exceptional pieces, selected for the way they live together.</p><a href="#collection" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#0b1f44] pb-2 text-xs font-semibold uppercase tracking-[.12em] text-[#0b1f44]">Enter the collection <ArrowDownToLine size={14} /></a></div><div className="relative min-h-[440px] overflow-hidden rounded-sm sm:min-h-[600px]"><img src={heroImage} alt="The Brand Store campaign" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" /><div className="absolute bottom-5 left-5 flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-white/80"><span className="h-px w-8 bg-white/70" /> London / 2026</div></div></section><section id="collection" className="mx-auto max-w-[1380px] px-5 pb-20 sm:px-8"><div className="flex flex-col justify-between gap-5 border-t border-[#eadcc6] py-7 sm:flex-row sm:items-center"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#9a8f7f]">The edit</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">Objects with a point of view.</h2></div><div className="flex flex-wrap gap-2"><select value={gender} onChange={(event) => setGender(event.target.value)} className="h-10 rounded-full border border-[#9a8f7f] bg-transparent px-3 text-xs outline-none" data-testid="select-catalogue-gender"><option value="all">Everyone</option><option value="women">Women</option><option value="men">Men</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-full border border-[#9a8f7f] bg-transparent px-3 text-xs outline-none" data-testid="select-catalogue-category"><option value="all">All categories</option>{CATEGORY_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</optgroup>)}</select><select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-10 max-w-[150px] rounded-full border border-[#9a8f7f] bg-transparent px-3 text-xs outline-none" data-testid="select-catalogue-brand"><option value="all">All houses</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>{visible.length === 0 ? <div className="py-24 text-center"><Heart className="mx-auto text-[#0b1f44]" /><p className="mt-4 font-display text-2xl">A quieter edit is coming.</p><p className="mt-2 text-sm text-[#9a8f7f]">Try another filter.</p></div> : <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">{visible.map((product) => <Link key={product.id} href={`/catalogue/product/${product.id}`} className="group block" data-testid={`link-public-product-${product.id}`}><div className="relative aspect-[.8] overflow-hidden bg-[#eadcc6]"><img src={imageFor(product)} alt={`${product.brand || 'The Brand Store'} ${categoryLabels[product.category]}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /><span className="absolute bottom-3 left-3 font-mono-ui text-[9px] uppercase tracking-[.14em] text-white drop-shadow">{genderLabels[product.gender]}</span></div><div className="mt-3 flex items-start justify-between gap-2"><div><p className="font-display text-xl">{product.brand || 'The Brand Store'}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-[#9a8f7f]">{categoryLabels[product.category]}</p></div><ArrowUpRight size={15} className="mt-1 text-[#9a8f7f] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></Link>)}</div>}</section><section id="about" className="border-t border-[#eadcc6] bg-[#eadcc6]"><div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:py-24"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#9a8f7f]">The house</p><h2 className="mt-4 max-w-sm font-display text-4xl leading-tight sm:text-5xl">Luxury is in the edit.</h2></div><div className="max-w-xl"><p className="font-display text-2xl leading-relaxed text-[#0b1f44]">THE BRAND STORE is a private shopping house for people who know that the best things are rarely shouting.</p><p className="mt-6 text-sm leading-7 text-[#9a8f7f]">We bring together the pieces worth making room for: quietly distinctive, beautifully made, and chosen for a life beyond the season.</p></div></div></section></main><footer className="border-t border-[#eadcc6] bg-[#f8f5ed]"><div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-5 py-7 text-[10px] uppercase tracking-[.14em] text-[#9a8f7f] sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© THE BRAND STORE</span><span>Luxury lives here</span></div></footer></div>;
}

function ProductDetailPage() {
  const { productId = '' } = useParams<{ productId: string }>();
  const { data: publicProduct, isLoading } = useGetPublicProduct(productId, { query: { enabled: !!productId, queryKey: getGetPublicProductQueryKey(productId), retry: false } });
  const { data: adminProduct } = useGetProduct(productId, { query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId), retry: false } });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey(), retry: false } });
  const productData = publicProduct || adminProduct;
  const [activeImage, setActiveImage] = useState(0);
  if (!productData) return isLoading ? <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8f5ed] text-[#0b1f44]"><Loader2 className="animate-spin" size={22} /></div> : <NotFound />;
  const product = productData;
  const images = product.images?.length ? product.images : [{ id: 'placeholder', imagePath: placeholderImage, isPrimary: true, sortOrder: 1 }];
  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_BRAND_STORE_WHATSAPP || '';
  const publicUrl = `${window.location.origin}/catalogue/product/${product.id}`;
  const whatsappMessage = `Hi The Brand Store, I'm interested in this item 👇\n\n${publicUrl}\n\nIs it available?`;
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
  return <div className="min-h-[100dvh] bg-[#f8f5ed] text-[#0b1f44] noise"><header className="border-b border-[#eadcc6]"><div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8"><Link href="/catalogue" className="flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[#9a8f7f]" data-testid="link-back-catalogue"><ArrowLeft size={15} /> Back to collection</Link><AppLogo /><span className="hidden text-[10px] uppercase tracking-[.17em] text-[#9a8f7f] sm:block">Private edit / 2026</span></div></header><main className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 sm:py-12">{isLoading ? <div className="grid animate-pulse gap-10 md:grid-cols-2"><div className="aspect-[.82] bg-[#eadcc6]" /><div className="space-y-4 pt-10"><div className="h-4 w-28 bg-[#eadcc6]" /><div className="h-14 w-3/4 bg-[#eadcc6]" /></div></div> : <div className="grid gap-10 md:grid-cols-[1.08fr_.92fr] lg:gap-20"><div className="grid gap-3 sm:grid-cols-[82px_1fr]"><div className="order-2 flex gap-2 overflow-auto sm:order-1 sm:flex-col">{images.map((image, index) => <button type="button" key={image.id} onClick={() => setActiveImage(index)} className={`h-20 w-16 shrink-0 overflow-hidden border-2 sm:h-24 sm:w-[74px] ${activeImage === index ? 'border-[#0b1f44]' : 'border-transparent'}`} data-testid={`button-product-image-${index}`}><img src={resolveImage(image.imagePath)} alt="" className="h-full w-full object-cover" /></button>)}</div><div className="order-1 aspect-[.82] overflow-hidden bg-[#eadcc6] sm:order-2"><img src={resolveImage(images[activeImage]?.imagePath)} alt={`${product.brand || 'The Brand Store'} ${categoryLabels[product.category]}`} className="h-full w-full object-cover" /></div></div><div className="flex flex-col justify-center"><div className="flex items-center gap-2"><span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#9a8f7f]">{genderLabels[product.gender]}</span><span className="h-1 w-1 rounded-full bg-[#c9a96a]" /><span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#9a8f7f]">{categoryLabels[product.category]}</span></div><h1 className="mt-5 max-w-lg font-display text-5xl leading-[1.02] tracking-[-.03em] sm:text-6xl">{product.brand || 'The Brand Store'}</h1><p className="mt-5 max-w-md text-sm leading-7 text-[#9a8f7f]">A considered piece from the {'The Brand Store catalogue'} edit. Enquire with the house for availability, provenance and private appointments.</p><div className="my-9 border-y border-[#eadcc6] py-5"><div className="flex items-center justify-between text-xs"><span className="text-[#9a8f7f]">Availability</span><span className="flex items-center gap-2 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> By enquiry</span></div></div><a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1f44] px-6 py-4 text-xs font-semibold uppercase tracking-[.12em] text-[#f8f5ed] transition hover:-translate-y-0.5 hover:shadow-lg" data-testid="link-whatsapp-enquiry"><MessageCircle size={17} /> Enquire via WhatsApp</a><p className="mt-4 text-center text-[10px] uppercase tracking-[.14em] text-[#9a8f7f]">A member of the house will respond personally.</p></div></div>}</main><section className="border-t border-[#eadcc6] bg-[#eadcc6]"><div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-8 sm:px-8"><p className="font-display text-xl">Continue through the edit.</p><Link href="/catalogue" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#0b1f44]">View catalogue <ArrowUpRight size={15} /></Link></div></section></div>;
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-20 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]">{icon}</div><h2 className="mt-4 font-display text-2xl">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function AnalyticsPage() {
  const { data: summary, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), retry: false } });
  const total = summary?.totalUploaded ?? 0;
  const published = summary?.published ?? 0;
  const needsReview = summary?.needsReview ?? 0;
  const categories = summary?.categories ?? {};
  const genderSplit = { women: summary?.women ?? 0, men: summary?.men ?? 0, unknown: summary?.unknown ?? 0 };
  return <AdminShell><div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <PageIntro eyebrow="Operations / 04" title="How the edit is landing." description="A quiet read on volume, review pace and where the collection leans." />
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{isLoading ? [1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />) : <><StatCard label="Uploaded this season" value={total} detail="Across all batches" accent /><StatCard label="Published" value={published} detail={`${Math.round((published / Math.max(total, 1)) * 100)}% of collection`} /><StatCard label="Awaiting review" value={needsReview} detail="Needs a human eye" /><StatCard label="Unsorted" value={genderSplit.unknown} detail="AI confidence below 70%" /></>}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Category mix</h2><BarChart3 size={19} className="text-[hsl(var(--primary))]" /></div><div className="mt-7 space-y-4">{Object.entries(categories).map(([name, count]) => <div key={name} className="flex items-center gap-3 text-sm"><span className="w-24 text-[hsl(var(--muted-foreground))]">{categoryLabels[name] ?? name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${(Number(count) / Math.max(total, 1)) * 100}%` }} /></div><span className="w-6 text-right font-mono-ui text-xs">{count as number}</span></div>)}</div></section>
      <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Gender split</h2><TrendingUp size={19} className="text-[hsl(var(--primary))]" /></div><div className="mt-7 space-y-4">{Object.entries(genderSplit).map(([name, count]) => <div key={name} className="flex items-center gap-3 text-sm"><span className="w-24 text-[hsl(var(--muted-foreground))]">{genderLabels[name] ?? name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} /></div><span className="w-6 text-right font-mono-ui text-xs">{count}</span></div>)}</div></section>
    </div>
  </div></AdminShell>;
}

function AdminGateway() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation('/admin/dashboard', { replace: true }); }, [setLocation]);
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--sidebar))] text-[#c9a96a]"><Loader2 className="animate-spin" size={22} /></div>;
}

function Router() {
  return <ErrorBoundary><Switch>
    <Route path="/admin" component={AdminGateway} />
    <Route path="/admin/dashboard" component={DashboardPage} />
    <Route path="/admin/upload" component={UploadPage} />
    <Route path="/admin/review" component={ReviewPage} />
    <Route path="/admin/products" component={ProductsPage} />
    <Route path="/admin/collections" component={CollectionsPage} />
    <Route path="/admin/catalogue" component={CatalogueAdminPage} />
    <Route path="/admin/analytics" component={AnalyticsPage} />
    <Route path="/admin/settings" component={SettingsPage} />
    <Route path="/catalogue/product/:productId" component={ProductDetailPage} />
    <Route path="/catalogue" component={BrandStoreCataloguePage} />
    <Route path="/" component={BrandStoreCataloguePage} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
