export function AuthCard({ title, subtitle, children, footer }:
  { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="max-w-container mx-auto px-6 py-14">
      <div className="max-w-md mx-auto bg-white rounded-xl2 shadow-card border border-line p-8">
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase text-center">KismatKart</div>
        <h1 className="font-serif text-3xl text-center mt-2">{title}</h1>
        {subtitle && <p className="text-sm text-muted text-center mt-2">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="text-center text-sm text-muted mt-6">{footer}</div>}
      </div>
    </section>
  );
}
