import { CouponForm } from '../CouponForm';
export const metadata = { title: 'New coupon' };
export default function NewCouponPage() {
  return (<><h1 className="font-serif text-3xl mb-5">New coupon</h1><CouponForm /></>);
}
