# Development notes

- Start with `docker compose -f docker-compose.base44.yml up -d --build`; the one-shot `deps` service installs workspace packages before the API and Vite start. The client proxies `/api` to the API service, so port 3000 is the only public entry point.
- The API's Luxe Horizon routes currently keep demo collections, products, and settings in process memory; they reset on API restart. PostgreSQL is provisioned locally for the database package, but these demo routes do not yet persist there. Do not run schema push expecting it to seed the demo catalogue.
- Supabase URL and publishable key are optional for preview: without both, admin routes deliberately use demo mode. When both are provided, real Supabase sign-in gates the admin UI. Configure both together via platform secrets for actual authentication; do not put them in Compose `environment`.
- Verify with `curl http://localhost:3000/api/healthz` and `curl http://localhost:3000/api/catalogue`; web HTML should include `/@vite/client` and `/src/main.tsx` should serve live source.
