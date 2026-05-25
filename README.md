# Harivant

Harivant is a mobile-first home-services app built with React, Vite, TypeScript, Tailwind CSS, and Lovable Cloud.

## Code structure

- `src/` — frontend app code, pages, components, hooks, and API calls
- `src/integrations/supabase/` — generated client used by the app to call the backend
- `supabase/migrations/` — backend database schema, policies, and data migrations
- `public/` — app icons, PWA assets, static files, and Netlify redirects
- `netlify.toml` — Netlify build, publish, headers, and SPA routing config
- `vercel.json` — Vercel SPA routing and cache headers

## Local setup

Use Node.js 20.

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

Build output folder: `dist`

## Netlify hosting

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

## Vercel hosting

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20`

## Required environment variables

Add these variables in the hosting platform if they are not already present:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Do not upload `node_modules`; hosting platforms install dependencies from `package.json` and `package-lock.json`.
