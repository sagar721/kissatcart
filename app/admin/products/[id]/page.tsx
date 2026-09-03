import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ProductEditor } from '../ProductEditor';
import { VariantsPanel } from '../VariantsPanel';
import { ImageUploader } from './ImageUploader';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const sb = supabaseAdmin();
  const [{ data: product }, { data: cats }, { data: variants }, { data: inv }, { data: images }] = await Promise.all([
    sb.from('products').select('*').eq('id', params.id).maybeSingle(),
    sb.from('categories').select('id,slug,name').order('sort_order'),
    sb.from('product_variants').select('*').eq('product_id', params.id).order('size'),
    sb.from('inventory').select('variant_id,stock_qty,reserved_qty,low_stock_at'),
    sb.from('product_images').select('*').eq('product_id', params.id).order('sort_order')
  ]);
  if (!product) notFound();
  const invMap = new Map((inv ?? []).map((i: any) => [i.variant_id, i]));

  return (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="font-serif text-3xl">Edit product</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/product/${product.slug}`} className="text-maroon underline">View public page →</Link>
          <Link href="/admin/products" className="text-muted underline">Back to list</Link>
        </div>
      </div>
      <ProductEditor categories={cats ?? []} initial={product as any} />
      <ImageUploader productId={product.id} initial={(images ?? []) as any} />
      <div className="mt-8">
        <h2 className="font-serif text-2xl mb-3">Variants &amp; inventory</h2>
        <VariantsPanel productId={product.id} variants={(variants ?? []) as any} inventory={invMap as any} />
      </div>
    </>
  );
}
