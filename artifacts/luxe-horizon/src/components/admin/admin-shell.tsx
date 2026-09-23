import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3,
  Bell,
  ChevronDown,
  CloudUpload,
  Eye,
  FolderOpen,
  Globe2,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings2,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useAdminSession, type AdminSessionState } from '@/lib/use-admin-session';
import { useAdminTheme } from '@/lib/admin-theme';
import { useHealthCheck } from '@workspace/api-client-react';

const AdminSessionContext = createContext<AdminSessionState | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminSessionContext);
  if (!context) throw new Error('useAdmin must be used inside AdminSessionProvider');
  return context;
}

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/upload', label: 'Upload batch', icon: CloudUpload },
      { href: '/admin/review', label: 'Review queue', icon: Eye },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/collections', label: 'Collections', icon: FolderOpen },
      { href: '/admin/catalogue', label: 'Publish & links', icon: Globe2 },
    ],
  },
  {
    label: 'Insights',
    items: [{ href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }],
  },
];

function AdminLoading({ message = 'Preparing your workspace' }: { message?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[hsl(var(--background))] text-[var(--brand-gold)]">
      <Loader2 className="animate-spin" size={22} />
      <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">{message}</p>
    </div>
  );
}

function AdminLogin() {
  const { signIn, error, ready } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    const ok = await signIn(email.trim(), password);
    if (!ok) setFormError('That email or password was not accepted.');
    setPending(false);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--brand-black)] px-5 py-10 noise">
      <div className="w-full max-w-md rounded-xl border border-[var(--brand-gold)]/25 bg-white/[.04] p-7 shadow-2xl sm:p-10">
        <BrandLogo variant="dark" size="lg" />
        <p className="mt-10 font-mono-ui text-[10px] uppercase tracking-[.22em] text-[var(--brand-gold)]">Private operations</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--brand-ivory)]">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--brand-ivory)]/60">Sign in to manage THE BRAND STORE catalogue.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-xs font-semibold text-[var(--brand-ivory)]/80">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              data-testid="input-admin-email"
              className="mt-2 h-12 w-full rounded-lg border border-[var(--brand-ivory)]/15 bg-black/30 px-3 text-sm text-[var(--brand-ivory)] outline-none focus:border-[var(--brand-gold)]"
            />
          </label>
          <label className="block text-xs font-semibold text-[var(--brand-ivory)]/80">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              data-testid="input-admin-password"
              className="mt-2 h-12 w-full rounded-lg border border-[var(--brand-ivory)]/15 bg-black/30 px-3 text-sm text-[var(--brand-ivory)] outline-none focus:border-[var(--brand-gold)]"
            />
          </label>
          {(formError || error) && (
            <p role="alert" className="text-xs text-[#f0b4a2]">
              {formError || error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !ready}
            data-testid="button-admin-signin"
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-gold)] px-5 text-xs font-semibold text-[var(--brand-navy)] transition hover:brightness-105 disabled:opacity-50"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <LockKeyhole size={15} />} Enter private space
          </button>
        </form>
        <Link href="/catalogue" className="mt-6 block text-center text-[10px] uppercase tracking-[.18em] text-[var(--brand-ivory)]/40 hover:text-[var(--brand-gold)]">
          Return to the catalogue
        </Link>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolved, toggle } = useAdminTheme();
  const isDark = resolved === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="button-admin-theme-toggle"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] transition hover:border-[var(--brand-gold)]"
    >
      {isDark ? <Moon size={15} /> : <Sun size={15} />}
      <span className="hidden text-[10px] font-semibold uppercase tracking-[.14em] sm:block">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

function AccountMenu() {
  const { signOut, email, demo } = useAdmin();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="button-admin-account"
        className="ml-1 flex items-center gap-2 border-l border-[hsl(var(--border))] pl-3 text-[hsl(var(--foreground))]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-navy)] font-display text-sm text-[var(--brand-ivory)]">TB</span>
        <span className="hidden max-w-[120px] truncate text-xs font-semibold sm:block">{demo ? 'House owner' : email || 'House owner'}</span>
        <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 shadow-xl">
            <p className="px-3 py-2 font-mono-ui text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
              {demo ? 'Demo session' : email || 'Signed in'}
            </p>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              data-testid="button-admin-logout"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Admin shell. Renders the login gateway when there is no session, redirects
 * `/admin` to the dashboard, and provides the responsive sidebar/drawer.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const session = useAdmin();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: health } = useHealthCheck({ query: { queryKey: ['/api/healthz'], staleTime: 30000 } });

  useEffect(() => {
    if (session.ready && session.authenticated && location === '/admin') setLocation('/admin/dashboard', { replace: true });
  }, [session.ready, session.authenticated, location, setLocation]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  if (!session.ready) return <AdminLoading message="Restoring your session" />;
  if (!session.authenticated) return <AdminLogin />;
  if (location === '/admin') return <AdminLoading message="Opening the dashboard" />;

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] noise">
      {open && <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col overflow-y-auto bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-9 flex items-start justify-between gap-3 px-1">
          <BrandLogo variant="dark" />
          <button onClick={() => setOpen(false)} className="rounded-full p-2 text-[hsl(var(--sidebar-foreground))]/70 lg:hidden" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 font-mono-ui text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground))]/40">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: NavIcon }) => (
                  <Link
                    key={href}
                    href={href}
                    data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition ${
                      location === href
                        ? 'bg-[hsl(var(--sidebar-accent))] text-[var(--brand-gold)]'
                        : 'text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))]/60 hover:text-[hsl(var(--sidebar-foreground))]'
                    }`}
                  >
                    <NavIcon size={17} strokeWidth={1.6} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-8 border-t border-[hsl(var(--sidebar-border))] pt-5">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] ${
              location === '/admin/settings' ? 'bg-[hsl(var(--sidebar-accent))] text-[var(--brand-gold)]' : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))]'
            }`}
          >
            <Settings2 size={17} strokeWidth={1.6} /> Settings
          </Link>
          <div className="mt-4 flex items-center justify-between px-3 text-[10px] text-[hsl(var(--sidebar-foreground))]/40">
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-emerald-400' : 'bg-[var(--brand-gold)]'}`} /> {health ? 'System online' : 'Demo mode'}
            </span>
            <span>v1.0.5</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-full p-2 lg:hidden" aria-label="Open navigation" data-testid="button-admin-menu">
              <Menu size={21} />
            </button>
            <div className="lg:hidden">
              <BrandLogo size="sm" />
            </div>
            <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] lg:flex">
              <ShieldCheck size={15} className="text-[var(--brand-gold)]" /> Private operations space
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" aria-label="Notifications" className="hidden h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--foreground))] sm:inline-flex">
              <Bell size={16} />
            </button>
            <AccountMenu />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
