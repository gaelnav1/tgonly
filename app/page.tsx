// ✅ SIN 'use client' — Server Component para máximo SEO
import type { Metadata } from 'next'
import Link from 'next/link'
import { categories, groups } from '@/data/groups'
import CategoryGrid from '@/components/CategoryGrid'
import GroupCard from '@/components/GroupCard'
import SearchBar from '@/components/SearchBar'  // Client component separado

// ✅ Metadata estática para la homepage
export const metadata: Metadata = {
  title: 'TGOnly — Directorio #1 de Grupos de Telegram en Español | LATAM',
  description: 'Descubre los mejores grupos de Telegram en español. Cripto, tech, gaming, noticias, educación y más. Miles de comunidades verificadas para la audiencia hispana.',
  keywords: ['grupos telegram español', 'grupos telegram cripto', 'mejores grupos telegram', 'grupos telegram mexico', 'grupos telegram latam', 'directorio telegram'],
  openGraph: {
    title: 'TGOnly — Directorio #1 de Grupos de Telegram en Español',
    description: 'Descubre miles de grupos verificados de Telegram en español. Cripto, tech, gaming y más.',
    url: 'https://tgonly.com',
    siteName: 'TGOnly',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TGOnly — Grupos de Telegram en Español',
    description: 'El directorio #1 de grupos de Telegram para la comunidad hispana.',
  },
  alternates: {
    canonical: 'https://tgonly.com',
  },
}

// ✅ Schema JSON-LD para la homepage (ItemList + WebSite)
function HomeSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://tgonly.com/#website',
        url: 'https://tgonly.com',
        name: 'TGOnly',
        description: 'Directorio #1 de grupos de Telegram en español',
        inLanguage: 'es',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://tgonly.com/buscar?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Categorías de grupos de Telegram en español',
        numberOfItems: categories.length,
        itemListElement: categories.map((cat, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Grupos de Telegram de ${cat.name}`,
          url: `https://tgonly.com/grupos/${cat.slug}`,
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function Home() {
  const trendingGroups = groups.filter(g => g.trending)

  return (
    <>
      <HomeSchema />

      <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Grid bg */}
        <div className="fixed inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(42,171,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(42,171,238,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/[0.07]">
          <Link href="/" className="flex items-center gap-2 font-syne font-extrabold text-xl no-underline text-[#f0eff8]">
            <span className="w-2 h-2 rounded-full bg-[#2AABEE] shadow-[0_0_10px_#2AABEE] animate-pulse" />
            TG<span className="text-[#2AABEE]">Only</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#categories" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Explorar</Link>
            <Link href="#trending"   className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Trending</Link>
            <Link href="/agregar"    className="bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">
              + Agregar grupo
            </Link>
          </div>
        </nav>

        {/* HERO - H1 con keyword principal */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
               style={{ background: 'radial-gradient(ellipse, rgba(42,171,238,0.12) 0%, transparent 70%)' }} />

          <div className="inline-flex items-center gap-2 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-full px-4 py-1.5 text-xs font-medium text-[#2AABEE] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE] animate-pulse" />
            El directorio #1 de grupos de Telegram en español
          </div>

          {/* ✅ H1 con keywords naturales */}
          <h1 className="font-syne font-extrabold text-[clamp(42px,7vw,80px)] leading-[1.05] tracking-[-2px] mb-5">
            Grupos de Telegram<br />
            en <em className="not-italic text-[#2AABEE]">Español</em>
          </h1>

          {/* ✅ Descripción con keywords secundarias */}
          <p className="text-lg text-[#8888aa] max-w-xl mb-11 font-light">
            Miles de grupos verificados organizados por tema. Cripto, tech, gaming, educación y más — para toda la comunidad hispana de LATAM.
          </p>

          {/* SearchBar es Client Component */}
          <SearchBar />

          {/* Stats */}
          <div className="flex items-center gap-10">
            {[['12,400+','Grupos'],['48M+','Miembros'],['38','Categorías'],['100%','Verificados']].map(([n,l], i) => (
              <div key={l} className="flex items-center gap-10">
                {i > 0 && <div className="w-px h-8 bg-white/[0.12]" />}
                <div className="text-center">
                  <span className="block font-syne font-bold text-[26px]">{n}</span>
                  <span className="text-[11px] text-[#8888aa] uppercase tracking-widest">{l}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="relative z-10 max-w-6xl mx-auto px-10 pb-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-syne font-bold text-[22px] tracking-tight">Explorar categorías de grupos</h2>
            <Link href="/grupos" className="text-[#2AABEE] text-[13px] font-medium hover:opacity-70 transition-opacity">Ver todas →</Link>
          </div>
          <CategoryGrid />
        </section>

        {/* TRENDING - Server rendered */}
        <section id="trending" className="relative z-10 max-w-6xl mx-auto px-10 pb-24">
          <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">🔥 Grupos trending ahora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingGroups.map((g) => <GroupCard key={g.name} group={g} />)}
          </div>
          <div className="text-center mt-8">
            <Link href="/grupos" className="inline-flex items-center gap-2 border border-white/[0.12] text-[#8888aa] hover:text-[#f0eff8] hover:border-white/25 transition-all px-6 py-3 rounded-xl text-sm font-medium">
              Ver todos los grupos →
            </Link>
          </div>
        </section>

        {/* SEO TEXT BLOCK - Importante para long-tail */}
        <section className="relative z-10 max-w-3xl mx-auto px-10 pb-24 text-center">
          <h2 className="font-syne font-bold text-[20px] mb-4 text-[#f0eff8]">¿Por qué usar TGOnly?</h2>
          <p className="text-[#8888aa] leading-relaxed mb-4">
            TGOnly es el directorio más completo de <strong className="text-[#f0eff8]">grupos de Telegram en español</strong>. 
            Encontrar comunidades de calidad en Telegram puede ser difícil — nosotros lo hacemos simple.
          </p>
          <p className="text-[#8888aa] leading-relaxed">
            Desde grupos de <Link href="/grupos/cripto" className="text-[#2AABEE] hover:underline">cripto y trading</Link>, 
            hasta comunidades de <Link href="/grupos/tech" className="text-[#2AABEE] hover:underline">tecnología e IA</Link>, 
            pasando por grupos de <Link href="/grupos/gaming" className="text-[#2AABEE] hover:underline">gaming</Link> y 
            <Link href="/grupos/educacion" className="text-[#2AABEE] hover:underline"> educación</Link> — 
            todos verificados y actualizados para México, Argentina, Colombia y toda LATAM.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
          <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
          <nav className="flex gap-6">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="hover:text-[#f0eff8] transition-colors">
                Grupos {cat.name}
              </Link>
            ))}
          </nav>
          <span>© 2025 TGOnly · LATAM</span>
        </footer>
      </div>
    </>
  )
}
