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
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-10 pt-24 pb-24">
        <div className="mb-10 pt-6">
          <div className="relative max-w-2xl">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888aa]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Busca grupos..." className="w-full bg-[#1c1c27] border border-white/[0.12] rounded-xl py-4 pl-12 pr-32 text-base text-[#f0eff8] placeholder-[#8888aa] outline-none focus:border-[#2AABEE]" />
            <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2AABEE] text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">Buscar</button>
          </div>
        </div>
        {!query.trim() ? (
          <div className="text-center py-20 text-[#8888aa]"><p className="text-5xl mb-4">🔍</p><p className="text-lg">Escribe algo para buscar grupos</p></div>
        ) : loading ? (
          <div className="text-center py-20 text-[#8888aa]"><p className="text-lg">Buscando grupos...</p></div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-[#8888aa]">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-lg mb-2">No encontramos grupos para <strong className="text-[#f0eff8]">"{query}"</strong></p>
            <Link href="/grupos" className="inline-block bg-[#2AABEE] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#1a8fd1] transition-colors mt-4">Ver todas las categorias</Link>
          </div>
        ) : (
          <>
            <h1 className="font-syne font-bold text-[22px] mb-6">{results.length} grupos para <span className="text-[#2AABEE]">"{query}"</span></h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(g=><GroupCard key={g.name} group={g} />)}
            </div>
          </>
        )}
      </div>
      <footer className="border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
        <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#8888aa]">Cargando...</div>}>
      <SearchResults />
    </Suspense>
  )
}
