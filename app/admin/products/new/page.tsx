import { supabaseAdmin } from '@/lib/supabase/server';
import { ProductEditor } from '../ProductEditor';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  const sb = supabaseAdmin();
  const { data: cats } = await sb.from('categories').select('id,slug,name').order('sort_order');
  return (
    <>
      <h1 className="font-serif text-3xl mb-6">New product</h1>
      <ProductEditor categories={cats ?? []} />
    </>
  );
}
