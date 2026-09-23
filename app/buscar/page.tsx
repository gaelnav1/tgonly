'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GroupCard from '@/components/GroupCard'

type Group = { emoji:string;color:string;name:string;members:string;verified:boolean;desc:string;tags:string[];trending:boolean;category:string;link:string;score?:number;photo_url?:string|null;username?:string|null }

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState(query)

  useEffect(() => {
    if (!query.trim()) { setLoading(false); return }
    setLoading(true)
    fetch('/api/buscar?q=' + encodeURIComponent(query))
      .then(r=>r.json()).then(data=>{ setResults(Array.isArray(data)?data:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [query])

  function handleSearch() { if (input.trim()) window.location.href=`/buscar?q=${encodeURIComponent(input.trim())}` }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-20">
        <div className="mb-8 tg-surface p-5 sm:p-7">
          <div className="relative max-w-3xl">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6f7894]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Busca grupos..." className="w-full bg-white border border-[#dfe5ef] rounded-2xl py-4 shadow-[0_8px_24px_rgba(39,56,95,.05)] pl-12 pr-32 text-base text-[#11182d] placeholder-[#8888aa] outline-none focus:border-[#2AABEE]" />
            <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1769ff] text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#0d5cef] transition-colors">Buscar</button>
          </div>
        </div>
        {!query.trim() ? (
          <div className="text-center py-20 text-[#6f7894]"><p className="text-5xl mb-4">🔍</p><p className="text-lg">Escribe algo para buscar grupos</p></div>
        ) : loading ? (
          <div className="text-center py-20 text-[#6f7894]"><p className="text-lg">Buscando grupos...</p></div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-[#6f7894]">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-lg mb-2">No encontramos grupos para <strong className="text-[#11182d]">"{query}"</strong></p>
            <Link href="/grupos" className="inline-block bg-[#1769ff] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0d5cef] transition-colors mt-4">Ver todas las categorias</Link>
          </div>
        ) : (
          <>
            <h1 className="font-syne font-extrabold text-[28px] mb-6">{results.length} grupos para <span className="text-[#2AABEE]">"{query}"</span></h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(g=><GroupCard key={g.name} group={g} />)}
            </div>
          </>
        )}
      </div>
      <footer className="max-w-6xl mx-auto border-t border-[#e6eaf2] px-4 sm:px-6 lg:px-10 py-7 flex items-center justify-between text-[13px] text-[#6f7894]">
        <span className="font-syne font-extrabold text-base text-[#11182d]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#6f7894]">Cargando...</div>}>
      <SearchResults />
    </Suspense>
  )
}
