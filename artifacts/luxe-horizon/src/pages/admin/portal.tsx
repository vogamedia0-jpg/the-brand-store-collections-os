import { Route, Switch } from 'wouter';
import { AdminSessionProvider, AdminShell } from '@/components/admin/admin-shell';
import { AdminThemeProvider } from '@/lib/admin-theme';
import DashboardPage from '@/pages/admin/dashboard';
import UploadPage from '@/pages/admin/upload';
import ReviewPage from '@/pages/admin/review';
import ProductsPage from '@/pages/admin/products';
import CollectionsPage from '@/pages/admin/collections';
import CatalogueAdminPage from '@/pages/admin/catalogue';
import AnalyticsPage from '@/pages/admin/analytics';
import SettingsPage from '@/pages/admin/settings';

/**
 * The single mount point for everything under /admin.
 *
 * Keeping one provider at this level means the session and the colour scheme are
 * resolved once and survive navigation between admin pages — no reload flash.
 * `/admin` itself is the authentication gateway: it renders the sign-in screen
 * when there is no session and redirects to the dashboard when there is.
 */
export default function AdminPortal() {
  return (
    <AdminThemeProvider>
      <AdminSessionProvider>
        <Switch>
          <Route path="/admin/dashboard">
            <AdminShell>
              <DashboardPage />
            </AdminShell>
          </Route>
          <Route path="/admin/upload">
            <AdminShell>
              <UploadPage />
            </AdminShell>
          </Route>
          <Route path="/admin/review">
            <AdminShell>
              <ReviewPage />
            </AdminShell>
          </Route>
          <Route path="/admin/products">
            <AdminShell>
              <ProductsPage />
            </AdminShell>
          </Route>
          <Route path="/admin/collections">
            <AdminShell>
              <CollectionsPage />
            </AdminShell>
          </Route>
          <Route path="/admin/catalogue">
            <AdminShell>
              <CatalogueAdminPage />
            </AdminShell>
          </Route>
          <Route path="/admin/analytics">
            <AdminShell>
              <AnalyticsPage />
            </AdminShell>
          </Route>
          <Route path="/admin/settings">
            <AdminShell>
              <SettingsPage />
            </AdminShell>
          </Route>
          <Route path="/admin">
            <AdminShell>
              <div />
            </AdminShell>
          </Route>
        </Switch>
      </AdminSessionProvider>
    </AdminThemeProvider>
  );
}
