# KismatKart

Production-grade Next.js 14 e-commerce for a men's fashion brand. Built phase-by-phase.

## Status

| Phase | Status |
|-------|--------|
| 1 · UI source-of-truth (homepage reference) | ✅ Done |
| 2 · Database schema + RLS + functions       | ✅ Done — see `db/` |
| 3 · App scaffold + homepage + category + product-detail pages | ✅ Done (this commit) |
| 4 · Auth (signup/login/forgot/verify)      | ⏳ Next |
| 5–20 · cart, checkout, Razorpay, orders, tracking, reviews, admin, notifs, SEO, perf, sec, QA | ⏳ Queued |

## Local dev

```bash
cp .env.example .env.local     # fill Supabase URL + keys
npm install
npm run dev                    # http://localhost:3000
```

## Stack

- **Next.js 14** App Router, TypeScript strict, Tailwind 3
- **Supabase** (Postgres + Auth + Storage) via `@supabase/ssr`
- **Razorpay** for payments (Phase 11)
- **Resend** for transactional email (Phase 16)

## Folder layout

```
app/                 App Router pages
  page.tsx           Homepage — real data via loadHomeData()
  category/[slug]/   Category listing + client-side filters
  product/[slug]/    Product-detail page + variant selector (client)
components/          Shared UI (Navbar, Footer, ProductCard, ...)
lib/
  supabase/          Server & browser Supabase clients (RLS-safe)
  queries/           Typed data-access functions (server-only)
  types.ts           TS shapes matching db/migrations/0001_schema.sql
  format.ts          inr(), phFor() placeholder gradients, cx()
db/                  Supabase migrations + seed (Phase 2 output)
styles/              (reserved)
```

## Design tokens

Locked in `tailwind.config.ts` and `app/globals.css` — matches the video exactly:

- Maroon `#7A1E2B` (primary), deep `#5E1420` (promo bar, footer, trust bar)
- Warm ground `#F4EFEA`, ink `#1A1A1A`, promo green `#1E8449`, gold `#F5B301`
- Fonts: Playfair Display (display), Inter (body), Dancing Script (banner accent)

## Data flow (this phase)

- Server components use `supabaseServer()` — runs with the request's cookies, RLS applies. Public catalog reads (products, categories, images, variants, inventory) are open per Phase 2 policies, so unauthenticated homepage / category / PDP pages work out of the box.
- The variant selector on PDP is a client component and POSTs to `/api/cart/items` (added in Phase 8). Until then it returns 404 gracefully.
- All product images are placeholder CSS gradients (`ph-1..ph-10`, deterministic per slug via `phFor()`). Real photos flow in via admin Storage upload in Phase 15.
```

## What's NOT wired yet

- No `/api/cart/*` routes yet — the "Add to Cart" button will 404 until Phase 8.
- No auth — the header account / wishlist links go to `/login`, `/wishlist` (built in Phase 4 / 7).
- No search results page.
- No checkout, no Razorpay, no admin.

Each is on the roadmap and will land in its own phase.
