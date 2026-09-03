import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="max-w-container mx-auto px-6 py-24 text-center">
      <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">404</div>
      <h1 className="font-serif text-5xl mt-3">Page not found</h1>
      <p className="text-muted mt-3">The page you are looking for doesn&rsquo;t exist or has been moved.</p>
      <Link href="/" className="inline-block mt-6 bg-maroon text-white rounded-lg px-5 py-3 font-semibold">Back to Home</Link>
    </section>
  );
}
