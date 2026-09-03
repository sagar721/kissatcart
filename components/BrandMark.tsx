import Link from 'next/link';
import { cx } from '@/lib/format';

export function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={cx(
        'inline-flex items-center gap-2 px-2.5 py-1.5 border-[1.5px] rounded-[4px]',
        onDark ? 'border-white' : 'border-maroon'
      )}
    >
      <div>
        <div className={cx('font-serif font-bold text-[19px] leading-none tracking-wide', onDark ? 'text-white' : 'text-maroon')}>
          KISMAT<span className={cx(onDark ? 'text-white' : 'text-ink')}>KART</span>
        </div>
        <div className={cx('text-[8.5px] tracking-[0.28em] uppercase mt-0.5', onDark ? 'text-white/70' : 'text-muted')}>
          Wear Your Confidence
        </div>
      </div>
    </Link>
  );
}
