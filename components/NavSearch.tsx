'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NavSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
      className="hidden md:flex items-center bg-white border border-line rounded-full pl-4 pr-1.5 py-1.5 w-[280px]"
    >
      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products..."
        aria-label="Search"
        className="border-0 outline-none bg-transparent w-full text-[14px] placeholder:italic placeholder:text-muted placeholder:text-[13.5px]"
      />
      <button type="submit" className="bg-maroon text-white w-[30px] h-[30px] rounded-full grid place-items-center" aria-label="Search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
