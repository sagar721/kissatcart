'use client';
import { useEffect, useState } from 'react';

export function ScrollTopFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed left-5 bottom-5 w-11 h-11 rounded-full bg-maroon text-white grid place-items-center shadow-fab z-50 transition-opacity hover:bg-maroon-deep"
      style={{ opacity: show ? 1 : 0.35 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
      </svg>
    </button>
  );
}
