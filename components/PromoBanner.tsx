import Link from 'next/link';

export function PromoBanner() {
  return (
    <section className="max-w-container mx-auto px-6 mt-20">
      <div className="relative overflow-hidden bg-maroon text-white rounded-2xl px-8 md:px-14 py-10 grid gap-8 md:grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <div className="font-serif italic text-[13px] tracking-widest uppercase opacity-85">KismatKart.com</div>
          <h3 className="font-script text-[64px] leading-[0.95] mt-2">New Stylish<br />Outfits</h3>
          <div className="text-sm tracking-wide opacity-90 mt-2">— Special Price Today —</div>
        </div>
        <div className="w-56 aspect-[3/4] rounded-2xl bg-[linear-gradient(160deg,#a37a5c,#4d3a2d)] mx-auto shadow-[0_24px_40px_rgba(0,0,0,0.35)]" />
        <div className="text-center">
          <div className="inline-block bg-promo text-white px-6 py-3.5 rounded-lg font-extrabold text-2xl leading-tight shadow-[0_8px_24px_rgba(30,132,73,0.35)]">
            <small className="block text-[11px] font-semibold tracking-widest opacity-90">Discount Up To</small>
            25% OFF
          </div>
          <div className="mt-3.5">
            <Link href="/shop" className="inline-flex items-center gap-2 px-4.5 py-2.5 border-[1.5px] border-white rounded-full font-semibold text-[13px] tracking-widest uppercase hover:bg-white hover:text-maroon">
              Shop Now →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
