import { supabaseAdmin } from '@/lib/supabase/server';
import { ReviewsModeration } from './ReviewsModeration';

export const metadata = { title: 'Reviews' };

export default async function AdminReviewsPage() {
  const sb = supabaseAdmin();
  const { data } = await sb.from('reviews')
    .select('id,rating,title,body,is_approved,created_at, products(name,slug), profiles(email,full_name)')
    .order('created_at', { ascending: false }).limit(200);
  return (
    <>
      <h1 className="font-serif text-3xl mb-5">Reviews</h1>
      <ReviewsModeration initial={(data ?? []) as any} />
    </>
  );
}
