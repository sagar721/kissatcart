export const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/** Deterministic 1..10 placeholder gradient class from a slug. */
export function phFor(slug: string | undefined | null): string {
  if (!slug) return 'ph-1';
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `ph-${(h % 10) + 1}`;
}

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
