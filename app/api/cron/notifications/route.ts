import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import { templates, type TemplateKey } from '@/lib/email/templates';

/** Drain up to 20 queued notifications. Meant to be hit on a schedule
 *  (Vercel Cron, Supabase cron, GitHub Actions — anything that hits this
 *  URL every minute or two). Guarded by CRON_SECRET query param OR header. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret');
  if (!secret || provided !== secret) return NextResponse.json({ ok: false }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: batch } = await sb.from('notifications')
    .select('*').eq('status', 'queued').lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at').limit(20);

  const results: Array<{ id: string; ok: boolean; err?: string }> = [];
  for (const n of batch ?? []) {
    try {
      const template = templates[n.template as TemplateKey];
      if (!template) { results.push({ id: n.id, ok: false, err: `Unknown template ${n.template}` }); continue; }
      const { data: profile } = await sb.from('profiles').select('email').eq('id', n.user_id).maybeSingle();
      if (!profile?.email) { results.push({ id: n.id, ok: false, err: 'No recipient' }); continue; }
      const { data: order } = n.payload?.order_id
        ? await sb.from('orders').select('id,order_number,grand_total').eq('id', n.payload.order_id).maybeSingle()
        : { data: null as any };
      const msg = template(order ?? n.payload);
      await sendEmail({ to: profile.email, subject: msg.subject, html: msg.html });
      await sb.from('notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', n.id);
      results.push({ id: n.id, ok: true });
    } catch (e: any) {
      await sb.from('notifications').update({
        status: 'failed', attempts: (n.attempts ?? 0) + 1, last_error: e.message ?? String(e)
      }).eq('id', n.id);
      results.push({ id: n.id, ok: false, err: e.message });
    }
  }
  return NextResponse.json({ ok: true, drained: results.length, results });
}
