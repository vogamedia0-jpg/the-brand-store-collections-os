import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BRAND } from '@/lib/brand';

/* Route-level code splitting keeps the admin portal out of the public bundle. */
const CataloguePage = lazy(() => import('@/pages/public/catalogue'));
const ProductDetailPage = lazy(() => import('@/pages/public/product-detail'));
const AdminPortal = lazy(() => import('@/pages/admin/portal'));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[var(--brand-ivory)]">
      <img src={BRAND.heroImage} alt="" aria-hidden className="h-16 w-16 object-contain opacity-80" />
      <p className="font-mono-ui text-[10px] uppercase tracking-[.24em] text-[var(--brand-taupe-600)]">{BRAND.name}</p>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/admin/:rest*" component={AdminPortal} />
          <Route path="/catalogue/product/:productId" component={ProductDetailPage} />
          <Route path="/catalogue" component={CataloguePage} />
          <Route path="/" component={CataloguePage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
