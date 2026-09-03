/** Minimal Resend REST client. No SDK dependency. */
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? 'KismatKart <no-reply@kismatkart.local>';

export async function sendEmail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!KEY) throw new Error('RESEND_API_KEY not configured');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: FROM, ...input })
  });
  if (!r.ok) throw new Error(`Resend send failed: ${r.status} ${await r.text()}`);
  return r.json();
}
