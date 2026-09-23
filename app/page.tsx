// ✅ SIN 'use client' — Server Component para máximo SEO
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllCategories, getAllGroups } from '@/lib/getGroups'
import CategoryGrid from '@/components/CategoryGrid'
import GroupCard from '@/components/GroupCard'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'

// ✅ Metadata estática para la homepage
export const metadata: Metadata = {
  title: 'TGOnly — Directorio #1 de Grupos de Telegram en Español | LATAM',
  description: 'Descubre los mejores grupos de Telegram en español. Cripto, tech, gaming, noticias, educación y más. Miles de comunidades verificadas para la audiencia hispana.',
  keywords: ['grupos telegram español', 'grupos telegram cripto', 'mejores grupos telegram', 'grupos telegram mexico', 'grupos telegram latam', 'directorio telegram'],
  openGraph: {
    title: 'TGOnly — Directorio #1 de Grupos de Telegram en Español',
    description: 'Descubre miles de grupos verificados de Telegram en español. Cripto, tech, gaming y más.',
    url: 'https://telegramonly.com',
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
    canonical: 'https://telegramonly.com',
  },
}

// ✅ Schema JSON-LD para la homepage (ItemList + WebSite)
function HomeSchema({ categories }: { categories: Awaited<ReturnType<typeof getAllCategories>> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://telegramonly.com/#website',
        url: 'https://telegramonly.com',
        name: 'TGOnly',
        description: 'Directorio #1 de grupos de Telegram en español',
        inLanguage: 'es',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://telegramonly.com/buscar?q={search_term_string}',
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
          url: `https://telegramonly.com/grupos/${cat.slug}`,
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

export default async function Home() {
  const [categories, groups] = await Promise.all([getAllCategories(), getAllGroups()])
  const trendingGroups = groups.filter(g => g.trending).slice(0, 6)
  const featuredGroups = [...groups].sort((a,b)=>(b.score??0)-(a.score??0)).slice(0, 6)
  const totalMembers = groups.reduce((sum, g) => {
    const parsed = Number(String(g.members).replace(/[^0-9]/g, ''))
    return sum + (Number.isFinite(parsed) ? parsed : 0)
  }, 0)
  const quickLinks = featuredGroups.slice(0, 5)

  return (
    <>
      <HomeSchema categories={categories} />

      <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Grid bg */}
        <div className="fixed inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(42,171,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(42,171,238,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <Navbar />

        <section className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-32 sm:pt-36 pb-16 sm:pb-20">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[min(680px,90vw)] h-[300px] pointer-events-none"
               style={{ background: 'radial-gradient(ellipse, rgba(42,171,238,0.12) 0%, transparent 70%)' }} />

          <div className="relative inline-flex items-center gap-2 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-full px-4 py-1.5 text-xs font-medium text-[#2AABEE] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE]" />
            {groups.length} comunidades disponibles
          </div>

          <h1 className="relative font-syne font-extrabold text-[clamp(38px,7vw,72px)] leading-[1.03] tracking-[-2px] mb-5 max-w-4xl">
            Encuentra lo que buscas<br />
            <span className="text-[#2AABEE]">en Telegram</span>
          </h1>

          <p className="relative text-base sm:text-lg text-[#8888aa] max-w-2xl mb-8 font-light">
            Busca personas, grupos, canales y comunidades en español. Revisa el contexto y abre el enlace correcto en Telegram.
          </p>

          <div className="relative w-full flex justify-center mb-5">
            <SearchBar />
          </div>

          {quickLinks.length > 0 && (
            <div className="relative flex flex-wrap justify-center gap-2 max-w-3xl">
              <span className="text-xs text-[#66667d] py-1.5 mr-1">Popular:</span>
              {quickLinks.map(g => (
                <Link key={g.name} href={`/grupos/${g.category}/${g.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}`}
                  className="text-xs text-[#aaaac0] bg-[#111118] border border-white/[0.08] rounded-full px-3 py-1.5 hover:text-[#f0eff8] hover:border-[#2AABEE]/30 transition-colors">
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          <div className="relative grid grid-cols-3 gap-6 sm:gap-12 mt-10 pt-8 border-t border-white/[0.07]">
            <div>
              <span className="block font-syne font-bold text-xl sm:text-2xl">{groups.length}</span>
              <span className="text-[10px] sm:text-[11px] text-[#77778f] uppercase tracking-wider">Comunidades</span>
            </div>
            <div>
              <span className="block font-syne font-bold text-xl sm:text-2xl">{categories.length}</span>
              <span className="text-[10px] sm:text-[11px] text-[#77778f] uppercase tracking-wider">Categorías</span>
            </div>
            <div>
              <span className="block font-syne font-bold text-xl sm:text-2xl">{totalMembers.toLocaleString('es-MX')}</span>
              <span className="text-[10px] sm:text-[11px] text-[#77778f] uppercase tracking-wider">Miembros registrados</span>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-syne font-bold text-[22px] tracking-tight">Explorar por categoría</h2>
            <Link href="/grupos" className="text-[#2AABEE] text-[13px] font-medium hover:opacity-70 transition-opacity">Ver todas →</Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        {/* TRENDING - Server rendered */}
        <section id="trending" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-20 sm:pb-24">
          <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">Tendencias ahora</h2>
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
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pb-24 text-center">
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
