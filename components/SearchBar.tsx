'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  function handleSearch() {
    if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="w-full max-w-[700px] relative">
      <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#63708d]" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        aria-label="Buscar en TelegramOnly"
        className="w-full bg-white border border-[#dfe5ef] shadow-[0_8px_24px_rgba(39,56,95,.05)] rounded-2xl py-[17px] pl-12 pr-28 sm:pr-32 text-[15px] sm:text-base text-[#11182d] placeholder-[#8a94ac] outline-none focus:border-[#1769ff] focus:ring-4 focus:ring-[#1769ff]/10 transition-all"
        value={query}
        onChange={e=>setQuery(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&handleSearch()}
        placeholder="Busca una persona, tema o comunidad..."
      />
      <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 tg-primary font-bold text-sm px-5 py-2.5">Buscar →</button>
    </div>
  )
}
