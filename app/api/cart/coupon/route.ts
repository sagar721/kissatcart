import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { loadCartForUser } from '@/lib/queries/cart';
import { computeTotals } from '@/lib/cart/totals';

const Body = z.object({ code: z.string().min(2).max(40) });

const ERR_MAP: Record<string, string> = {
  COUPON_NOT_FOUND:     'That coupon code is not valid.',
  COUPON_NOT_STARTED:   'This coupon is not active yet.',
  COUPON_EXPIRED:       'This coupon has expired.',
  COUPON_MIN_ORDER:     'Your cart does not meet the minimum order value for this coupon.',
  COUPON_EXHAUSTED:     'This coupon has been used up.',
  COUPON_PER_USER_LIMIT:'You have already used this coupon the maximum number of times.'
};

/** Validate a coupon against the current cart. Returns the totals as if applied,
 *  without persisting anything — persistence happens at order creation time. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const { items } = await loadCartForUser(user.id);
  if (items.length === 0) return NextResponse.json({ ok: false, message: 'Your cart is empty.' }, { status: 400 });

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const sb = supabaseAdmin();
  const { data: disc, error } = await sb.rpc('apply_coupon', {
    p_code: parsed.data.code.toUpperCase(), p_user_id: user.id, p_subtotal: subtotal
  });

  if (error) {
    const code = (error.message.match(/^([A-Z_]+)/)?.[1]) ?? '';
    return NextResponse.json({ ok: false, message: ERR_MAP[code] ?? error.message }, { status: 400 });
  }
  const discount = Number(disc);
  const totals = computeTotals(items, discount);
  return NextResponse.json({ ok: true, code: parsed.data.code.toUpperCase(), discount, totals });
}
