'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch() {
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative w-full max-w-xl mb-10">
      <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888aa] pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Busca grupos de cripto, gaming, noticias..."
        className="w-full bg-[#1c1c27] border border-white/[0.12] rounded-xl pl-12 pr-36 py-[18px] text-base text-[#f0eff8] placeholder-[#8888aa] outline-none focus:border-[#2AABEE] focus:shadow-[0_0_0_3px_rgba(42,171,238,0.18)] transition-all"
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2AABEE] text-black font-semibold text-sm px-5 py-2.5 rounded-[10px] hover:bg-[#1a8fd1] transition-colors"
      >
        Buscar
      </button>
    </div>
  )
}
