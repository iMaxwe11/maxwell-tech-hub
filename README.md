# maxwell-tech-hub

> Personal portfolio + developer toolkit at **[maxwellnixon.com](https://maxwellnixon.com)** — branded "Obsidian Luxe": dark aesthetic with electric cyan/purple accents, glass-morphism cards, aurora backgrounds, and animated typography.

[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://maxwellnixon.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)


## What's inside

- **Home** — animated hero, project cards with live demo previews, experience timeline, three-column real-time intelligence dashboard (weather + crypto + stocks)
- **/projects** — full project hub with metrics
- **/tools** — 22+ in-browser developer utilities (JWT decoder, regex tester, JSON formatter, color picker, password strength, Pomodoro timer, base converter, gradient generator, SQL formatter, and more)
- **/play** — neon arcade with Snake, Pong, Memory, Reaction, Typing
- **/terminal** — interactive shell with a tab-completing command set
- **/space** — live ISS tracker, NASA APOD, upcoming launches, space news
- **/weather** — radar + forecast + air quality, powered by Open-Meteo + RainViewer + Windy
- **/news** — multi-source tech/dev news feed
- **/blog** — long-form posts on AI, dev, security, space, science
- **/status** — service health monitor
- **/now** — what I'm focused on right now
- **/analytics** — site/visitor analytics overview
- **/uses** — daily-driver hardware/software
- **/contact** — multi-channel contact surface

## Stack

- **Framework**: Next.js 15 (App Router, Turbopack-ready)
- **UI**: React 18, TypeScript (strict), Tailwind CSS 3.4
- **Animation**: Framer Motion
- **Icons**: lucide-react
- **Hosting**: Vercel (deploys from `main`)
- **Telemetry**: Vercel Analytics + Speed Insights
- **Data sources**: Open-Meteo (weather), RainViewer (radar), CoinGecko (crypto), Yahoo Finance v8 chart endpoint (stocks), NASA APIs (space), GitHub REST (activity)

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm tsc --noEmit # type-check only
```

This repo uses **pnpm** (`packageManager` is pinned in `package.json`). `package-lock.json` is gitignored.

## Project layout

```
app/                Next.js App Router
  api/              Edge + Node API routes (data fetchers, OG image)
  (routes)/         Page routes — page.tsx per directory
  layout.tsx        Root layout: starfield, palette, command-K, etc.
  error.tsx         Per-route error boundary
  global-error.tsx  Root layout error boundary
  manifest.ts       PWA manifest
  sitemap.ts        SEO sitemap
  robots.ts         Crawler rules
components/         Shared UI primitives + global widgets
  widgets/          Real-time data widgets (weather, stocks, ISS, etc.)
lib/                Site config, metadata factory, types, utilities
public/             Static assets (icons, resume)
```

## Deployment

Push to `main` → Vercel builds and deploys automatically. Vercel project settings:

- **Framework preset**: Next.js
- **Build command**: `next build`
- **Output**: `.next/`
- **Node version**: 20+

### Environment variables

| Name | Required | Purpose |
| ---- | -------- | ------- |
| `FINNHUB_API_KEY` | optional | Backup stock data source if Yahoo Finance v8 chart endpoint is unavailable |
| `RESEND_API_KEY` | optional | Server-side contact form delivery (currently unused; form is `mailto:`-based) |

## Conventions

- **TypeScript-clean commits**: validate with `pnpm tsc --noEmit` before push.
- **Targeted edits over rewrites** — small, surgical diffs minimize risk.
- **Server-side caching with stale fallback** is the default pattern for real-time data API routes.
- Prefer no-API-key data sources to avoid env var management overhead.

## License

Personal project, source-available for inspection. No license granted for redistribution or derivative works without permission.

— Maxwell Nixon · [iMaxwe11](https://github.com/iMaxwe11) · [linkedin](https://linkedin.com/in/maxwell-nixon-90351627a)
