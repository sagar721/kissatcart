import { supabasePublic } from '@/lib/supabase/server';
import type { Category, Product, ProductImage, ProductVariant, Inventory, SortKey } from '@/lib/types';

/** Homepage: featured, new arrivals, most-loved (top rated with reviews). */
export async function loadHomeData() {
  const sb = supabasePublic();
  const [cats, arrivals, loved] = await Promise.all([
    sb.from('categories').select('*').eq('is_active', true).order('sort_order').returns<Category[]>(),
    sb.from('v_products_public').select('*').eq('is_new_arrival', true).limit(10).returns<Product[]>(),
    sb.from('v_products_public').select('*').order('rating_avg', { ascending: false })
      .order('rating_count', { ascending: false }).limit(10).returns<Product[]>()
  ]);
  return {
    categories: cats.data ?? [],
    arrivals:   arrivals.data ?? [],
    loved:      loved.data ?? []
  };
}

export async function loadCategoryBySlug(slug: string) {
  const sb = supabasePublic();
  const { data } = await sb.from('categories').select('*').eq('slug', slug).maybeSingle();
  return data as Category | null;
}

export type CategoryFilter = {
  minPrice?: number; maxPrice?: number;
  sizes?: string[]; colors?: string[];
  minRating?: number; minDiscount?: number;
  inStockOnly?: boolean;
  q?: string;
  sort?: SortKey;
  page?: number;      // 1-indexed
  pageSize?: number;
};

/** Category listing with filters, sort, and pagination.
 *  Returns { rows, total } so the UI can render a page count. */
export async function loadCategoryProducts(categoryId: string, f: CategoryFilter = {}) {
  const sb = supabasePublic();
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(48, f.pageSize ?? 12);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = sb.from('v_products_public').select('*', { count: 'exact' }).eq('category_id', categoryId);

  if (f.minPrice != null)    q = q.gte('price', f.minPrice);
  if (f.maxPrice != null)    q = q.lte('price', f.maxPrice);
  if (f.minRating != null)   q = q.gte('rating_avg', f.minRating);
  if (f.minDiscount != null) q = q.gte('discount_percent', f.minDiscount);
  if (f.q && f.q.trim())     q = q.ilike('name', `%${f.q.trim()}%`);

  switch (f.sort) {
    case 'price_asc':  q = q.order('price', { ascending: true });  break;
    case 'price_desc': q = q.order('price', { ascending: false }); break;
    case 'rating':     q = q.order('rating_avg', { ascending: false }); break;
    case 'discount':   q = q.order('discount_percent', { ascending: false }); break;
    case 'newest':     q = q.order('created_at', { ascending: false }); break;
    default:           q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const { data, count } = await q.range(from, to).returns<Product[]>();
  let rows = data ?? [];

  // Size / color / stock filters need a variant join; do a targeted second query.
  if ((f.sizes?.length || f.colors?.length || f.inStockOnly) && rows.length) {
    const ids = rows.map(r => r.id);
    const { data: vs } = await sb.from('product_variants').select('id, product_id, size, color, is_active')
      .in('product_id', ids).eq('is_active', true);
    const variantIds = (vs ?? []).map(v => v.id);
    // Scope to this page's variants only — this view can hold thousands of rows
    // sitewide, and only a couple dozen are ever relevant to one listing page.
    const { data: inv } = variantIds.length
      ? await sb.from('v_inventory_available').select('variant_id, available_qty').in('variant_id', variantIds)
      : { data: [] as { variant_id: string; available_qty: number }[] };
    const invMap = new Map((inv ?? []).map(i => [i.variant_id, i.available_qty]));
    const keep = new Set<string>();
    for (const v of vs ?? []) {
      const sizeOk  = !f.sizes?.length  || (v.size  && f.sizes.includes(v.size));
      const colorOk = !f.colors?.length || (v.color && f.colors.includes(v.color));
      const stockOk = !f.inStockOnly    || (invMap.get(v.id) ?? 0) > 0;
      if (sizeOk && colorOk && stockOk) keep.add(v.product_id);
    }
    rows = rows.filter(r => keep.has(r.id));
  }

  return { rows, total: count ?? rows.length, page, pageSize };
}

export async function loadProductBySlug(slug: string) {
  const sb = supabasePublic();
  const { data: productData } = await sb.from('v_products_public').select('*').eq('slug', slug).maybeSingle();
  const product = productData as Product | null;
  if (!product) return null;

  const [{ data: images }, { data: variants }] = await Promise.all([
    sb.from('product_images').select('*').eq('product_id', product.id).order('sort_order').returns<ProductImage[]>(),
    sb.from('product_variants').select('*').eq('product_id', product.id).eq('is_active', true).returns<ProductVariant[]>()
  ]);
  const variantIds = (variants ?? []).map(v => v.id);
  // Scope to this product's own variants — the unfiltered view holds every
  // variant sitewide, which was being fetched in full on every product view.
  const { data: inv } = variantIds.length
    ? await sb.from('v_inventory_available').select('*').in('variant_id', variantIds).returns<Inventory[]>()
    : { data: [] as Inventory[] };
  const invMap = new Map((inv ?? []).map(i => [i.variant_id, i]));

  // Related products (same category, exclude self, top 4)
  const { data: related } = await sb.from('v_products_public').select('*')
    .eq('category_id', product.category_id).neq('id', product.id).limit(4).returns<Product[]>();

  return {
    product,
    images: images ?? [],
    variants: variants ?? [],
    inventory: invMap,
    related: related ?? []
  };
}
