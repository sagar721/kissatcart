const items = [
  { ic: '⌘', title: 'Quality You Can Trust',   desc: 'Premium fabrics & perfect fits' },
  { ic: '✦', title: 'Trendy & Modern',         desc: "Styles you'll love" },
  { ic: '₹', title: 'Affordable Prices',       desc: 'Best value for money' },
  { ic: '☺', title: '10K+ Happy Customers',    desc: 'Loved by thousands' },
  { ic: '↺', title: 'Easy Returns',            desc: 'Hassle-free returns' }
];
export function TrustBar() {
  return (
    <section className="mt-20 bg-maroon text-white">
      <div className="max-w-container mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map(i => (
          <div key={i.title} className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white/15 grid place-items-center flex-none">{i.ic}</div>
            <div>
              <h4 className="font-serif font-semibold text-[15px]">{i.title}</h4>
              <p className="text-[12px] opacity-85 mt-0.5">{i.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
