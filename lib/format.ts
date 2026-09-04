export const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/** Deterministic 1..10 placeholder gradient class from a slug. */
export function phFor(slug: string | undefined | null): string {
  if (!slug) return 'ph-1';
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `ph-${(h % 10) + 1}`;
}

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

/** Resolves the app's base URL for absolute links (metadata, sitemap, emails).
 *  `?? fallback` alone doesn't catch an empty-string env var (e.g. a key added
 *  in Vercel with a blank value) — that would reach `new URL('')` and crash
 *  the build. Falls back to localhost on missing, blank, or malformed values. */
export function appUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return 'http://localhost:3000';
  try {
    return new URL(raw).origin;
  } catch {
    return 'http://localhost:3000';
  }
}
