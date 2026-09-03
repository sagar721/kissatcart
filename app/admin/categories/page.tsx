import { supabaseAdmin } from '@/lib/supabase/server';
import { CategoriesEditor } from './CategoriesEditor';

export const metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const sb = supabaseAdmin();
  const { data } = await sb.from('categories').select('*').order('sort_order');
  return (
    <>
      <h1 className="font-serif text-3xl mb-5">Categories</h1>
      <CategoriesEditor initial={data ?? []} />
    </>
  );
}
