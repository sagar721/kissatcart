/** Pure cart-total math. Amounts are ₹, tax is inclusive so we surface it but
 *  do NOT add it a second time. Shipping is free above the threshold. */
export const SHIPPING_FLAT   = 79;
export const FREE_SHIPPING_AT = 599;

export type LineForTotals = { unit_price: number; quantity: number };

export function computeTotals(items: LineForTotals[], discount: number = 0) {
  const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const discountApplied = Math.max(0, Math.min(discount, subtotal));
  const grand = Math.max(0, subtotal - discountApplied + shipping);
  return {
    subtotal: round2(subtotal),
    discount: round2(discountApplied),
    shipping: round2(shipping),
    tax:      0,
    grand:    round2(grand)
  };
}
const round2 = (n: number) => Math.round(n * 100) / 100;
