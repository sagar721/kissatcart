import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export type CartLine = {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string;
  available_qty: number;
  product_id: string;
  product_slug: string;
  product_name: string;
  brand: string;
  thumbnail_url: string | null;
};

export type CartCoupon = { code: string; discount: number } | null;

export async function getOrCreateCartId(userId: string): Promise<string> {
  const sb = supabaseAdmin();
  // carts.user_id is UNIQUE — a user has at most one cart row, ever. Once a
  // checkout converts it, reuse + reactivate that same row rather than
  // inserting a second one (which would violate the unique constraint).
  const { data } = await sb.from('carts').select('id, status').eq('user_id', userId).maybeSingle();
  if (data) {
    if (data.status !== 'active') {
      await sb.from('carts').update({ status: 'active' }).eq('id', data.id);
    }
    return data.id;
  }
  const { data: created, error } = await sb.from('carts').insert({ user_id: userId, status: 'active' }).select('id').single();
  if (error || !created) throw new Error(`Failed to create cart: ${error?.message ?? 'unknown error'}`);
  return created.id;
}

export async function loadCartForUser(userId: string): Promise<{ items: CartLine[]; cartId: string }> {
  const sb = supabaseAdmin();
  const cartId = await getOrCreateCartId(userId);
  const { data: rows } = await sb
    .from('cart_items')
    .select(`id, variant_id, quantity, unit_price,
             product_variants!inner(sku,size,color,color_hex,product_id,
               products!inner(name,slug,brand,
                 product_images(url,is_thumbnail)),
               inventory(stock_qty,reserved_qty))`)
    .eq('cart_id', cartId)
    .order('added_at', { ascending: true });

  const items: CartLine[] = (rows ?? []).map((r: any) => {
    const v = r.product_variants; const p = v.products;
    const thumb = (p.product_images ?? []).find((i: any) => i.is_thumbnail) ?? p.product_images?.[0];
    const inv = v.inventory ?? { stock_qty: 0, reserved_qty: 0 };
    return {
      id: r.id, variant_id: r.variant_id, quantity: r.quantity, unit_price: Number(r.unit_price),
      size: v.size, color: v.color, color_hex: v.color_hex, sku: v.sku,
      available_qty: Math.max(0, (inv.stock_qty ?? 0) - (inv.reserved_qty ?? 0)),
      product_id: v.product_id, product_slug: p.slug, product_name: p.name, brand: p.brand,
      thumbnail_url: thumb?.url ?? null
    };
  });
  return { items, cartId };
}

export async function getCartCoupon(userId: string): Promise<CartCoupon> {
  // Coupon is only bound at order-creation time (Phase 10). We just re-validate
  // whatever the client asked for via /api/cart/coupon at page-load.
  return null;
}

export async function cartCount(userId: string): Promise<number> {
  const sb = supabaseAdmin();
  const cartId = await getOrCreateCartId(userId);
  const { data } = await sb.from('cart_items').select('quantity').eq('cart_id', cartId);
  return (data ?? []).reduce((s: number, r: any) => s + (r.quantity ?? 0), 0);
}

export async function loadWishlistForUser(userId: string) {
  const sb = supabaseAdmin();
  // Ensure a wishlist row exists
  const { data: wl } = await sb.from('wishlists').select('id').eq('user_id', userId).maybeSingle();
  const wishlistId = wl?.id ?? (await sb.from('wishlists').insert({ user_id: userId }).select('id').single()).data!.id;

  const { data } = await sb
    .from('wishlist_items')
    .select('added_at, products!inner(id,slug,name,brand,price,mrp,discount_percent,rating_avg,rating_count,tags,category_id,is_active)')
    .eq('wishlist_id', wishlistId)
    .order('added_at', { ascending: false });

  const items = (data ?? []).map((r: any) => ({ ...r.products, added_at: r.added_at, category_slug: '' }));
  return { items, wishlistId };
}
