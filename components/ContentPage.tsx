export function ContentPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">{eyebrow}</div>
      <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 text-balance">{title}</h1>
      <div className="bg-white border border-line rounded-xl2 p-7 md:p-10 prose prose-sm max-w-none
                      prose-headings:font-serif prose-headings:text-ink prose-a:text-maroon prose-strong:text-ink
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-p:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
