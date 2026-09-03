import { inr } from '@/lib/format';

const wrap = (title: string, body: string) => `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F4EFEA;padding:32px;color:#1A1A1A">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #E7E1DA">
    <div style="border:1.5px solid #7A1E2B;border-radius:4px;display:inline-block;padding:8px 12px">
      <div style="color:#7A1E2B;font-weight:700;letter-spacing:0.04em">KISMATKART</div>
      <div style="font-size:9px;letter-spacing:0.24em;color:#6B6560;text-transform:uppercase">Wear Your Confidence</div>
    </div>
    <h1 style="font-family:Georgia,serif;font-size:24px;margin:24px 0 12px">${title}</h1>
    ${body}
    <p style="color:#6B6560;font-size:12px;margin-top:24px">— The KismatKart team · Made with ♥ in India</p>
  </div>
</body></html>`;

export const templates = {
  order_confirmed: (order: any) => ({
    subject: `Order confirmed · ${order.order_number}`,
    html: wrap('Thanks for your order!', `
      <p>We've received order <strong>${order.order_number}</strong> and it's being prepared.</p>
      <p><strong>Total charged:</strong> ${inr(Number(order.grand_total))}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="background:#7A1E2B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View order</a></p>`)
  }),
  order_shipped: (order: any, tracking?: string) => ({
    subject: `Your order is on its way · ${order.order_number}`,
    html: wrap('Your order has shipped!', `
      <p>Order <strong>${order.order_number}</strong> has left our warehouse.</p>
      ${tracking ? `<p><strong>Tracking:</strong> ${tracking}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="background:#7A1E2B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Track it</a></p>`)
  }),
  order_delivered: (order: any) => ({
    subject: `Order delivered · ${order.order_number}`,
    html: wrap('Delivered!', `
      <p>Order <strong>${order.order_number}</strong> has been delivered. Wear it well.</p>
      <p>Loved it? <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">Leave a review →</a></p>`)
  }),
  order_cancelled: (order: any) => ({
    subject: `Order cancelled · ${order.order_number}`,
    html: wrap('Order cancelled', `
      <p>Order <strong>${order.order_number}</strong> has been cancelled. Any charged amount will be refunded within 5–7 business days.</p>`)
  })
} as const;

export type TemplateKey = keyof typeof templates;
