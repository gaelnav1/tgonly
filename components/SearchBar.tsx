'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  function handleSearch() { if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query.trim())}`) }
  return (
    <div className="w-full max-w-[640px] relative mb-10">
      <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888aa]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input className="w-full bg-[#1c1c27] border border-white/[0.12] rounded-xl py-[18px] pl-12 pr-32 text-base text-[#f0eff8] placeholder-[#8888aa] outline-none focus:border-[#2AABEE]"
        value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}
        placeholder="Busca grupos de cripto, gaming, noticias..." />
      <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2AABEE] text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">Buscar</button>
    </div>
  )
}
