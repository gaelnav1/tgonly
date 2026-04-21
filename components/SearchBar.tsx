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
    <div className="tg-search-wrap">
      <svg className="tg-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input className="tg-search-input" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Busca grupos de cripto, gaming, noticias..." />
      <button className="tg-search-btn" onClick={handleSearch}>Buscar</button>
    </div>
  )
}
