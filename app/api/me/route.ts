import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { cartCount } from '@/lib/queries/cart';

export const dynamic = 'force-dynamic';

/** Tiny personalization endpoint for the navbar (login state, cart badge).
 *  Kept out of page-level server rendering so public pages can stay
 *  statically/ISR-cacheable instead of being forced dynamic by every
 *  request's cookie check — see components/NavAccount.tsx. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ loggedIn: false, initial: null, cartCount: 0 });
  const count = await cartCount(user.id);
  return NextResponse.json({ loggedIn: true, initial: user.full_name?.[0] ?? null, cartCount: count });
}
