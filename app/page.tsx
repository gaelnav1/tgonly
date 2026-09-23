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
  const trendingGroups = groups.filter(g => g.trending).slice(0, 4)
  const featuredGroups = [...groups].sort((a,b)=>(b.score??0)-(a.score??0)).slice(0, 6)
  const quickLinks = featuredGroups.slice(0, 6)

  return (
    <>
      <HomeSchema categories={categories} />
      <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16">
          <section className="tg-surface overflow-hidden p-6 sm:p-10 lg:p-12 mb-5">
            <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#fff4cf] text-[#765d00] rounded-full px-3 py-1.5 text-xs font-bold mb-5">
                  ● Comunidades que te conectan
                </div>
                <h1 className="font-syne font-extrabold text-[clamp(38px,6vw,66px)] leading-[1.02] tracking-[-2px] mb-5">
                  Encuentra tu próxima<br/><span className="text-[#1769ff]">comunidad en Telegram</span>
                </h1>
                <p className="text-[#6f7894] text-base sm:text-lg max-w-2xl mb-7">
                  Busca personas, grupos, canales y temas. Encuentra contexto antes de abrir el enlace correcto en Telegram.
                </p>
                <SearchBar />
                {quickLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 items-center">
                    <span className="text-xs text-[#8a94ac]">Búsquedas populares:</span>
                    {quickLinks.map(g => (
                      <Link key={g.name} href={`/grupos/${g.category}/${g.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}`}
                        className="text-xs font-semibold text-[#53607e] bg-[#f1f5fb] rounded-full px-3 py-1.5 hover:text-[#1769ff]">
                        {g.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative min-h-[280px] hidden lg:block">
                <div className="absolute top-0 left-2 w-[82%] h-[72%] rounded-[34px] bg-[#fff4cf] p-8">
                  <p className="font-syne font-extrabold text-[28px] leading-tight">Conversaciones<br/>que importan</p>
                  <p className="text-[#6f7894] mt-3">Personas reales.<br/>Comunidades reales.<br/>En Telegram.</p>
                  <div className="w-10 h-1.5 rounded-full bg-[#ffd91a] mt-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-[58%] h-[60%] rounded-[34px] bg-[#eaf3ff] rotate-[-5deg] flex items-center justify-center text-[92px] text-[#1769ff] shadow-sm">➤</div>
              </div>
            </div>
          </section>

          <section className="tg-surface grid grid-cols-2 lg:grid-cols-4 gap-0 mb-5 overflow-hidden">
            {[['12,400+','Grupos','Comunidades activas','#e9f8ee'],['48M+','Miembros','Personas conectadas','#edf4ff'],['38','Categorías','De todos los intereses','#fff4cf'],['100%','Verificados','Calidad y confianza','#e9f8ee']].map(([n,l,s,bg],i)=>(
              <div key={l} className={`p-6 sm:p-7 flex items-center gap-4 ${i<3?'lg:border-r border-[#e6eaf2]':''}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{background:bg}}>{i===0?'👥':i===1?'👤':i===2?'📁':'🛡️'}</div>
                <div><div className="font-syne font-extrabold text-xl sm:text-2xl">{n}</div><div className="font-bold text-sm">{l}</div><div className="text-[11px] text-[#8a94ac] mt-0.5">{s}</div></div>
              </div>
            ))}
          </section>

          <section id="categories" className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="font-syne font-extrabold text-[24px]">Explora por categoría</h2><p className="text-sm text-[#7b86a1] mt-1">Encuentra comunidades por tema.</p></div>
              <Link href="/grupos" className="text-[#1769ff] text-sm font-bold">Ver todas →</Link>
            </div>
            <CategoryGrid categories={categories.slice(0,8)} />
          </section>

          <section id="trending" className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="font-syne font-extrabold text-[24px]">🔥 Comunidades destacadas</h2><p className="text-sm text-[#7b86a1] mt-1">Descubre comunidades activas de diferentes categorías.</p></div>
              <Link href="/grupos" className="text-[#1769ff] text-sm font-bold">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(trendingGroups.length ? trendingGroups : featuredGroups.slice(0,4)).map(g => <GroupCard key={g.name} group={g} />)}
            </div>
          </section>

          <section className="tg-surface p-7 sm:p-10 mb-5 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold text-[#1769ff] uppercase tracking-wider mb-2">¿Por qué TGOnly?</p>
              <h2 className="font-syne font-extrabold text-[28px] leading-tight mb-4">Más que un directorio,<br/>una forma simple de descubrir Telegram</h2>
              <p className="text-[#6f7894] leading-relaxed">Explora comunidades organizadas por categorías, revisa su contexto y encuentra el enlace adecuado sin perderte entre resultados.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['🔎','Descubre rápido'],['🛡️','Grupos verificados'],['👥','Más comunidades'],['⚡','Siempre actualizado']].map(([i,t],idx)=><div key={t} className="rounded-2xl border border-[#e6eaf2] p-4 bg-[#f9fbff]"><div className="w-10 h-10 rounded-xl bg-[#edf4ff] flex items-center justify-center mb-3">{i}</div><p className="font-bold text-sm">{t}</p></div>)}
            </div>
          </section>



        </main>

        <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-8">
          <div className="rounded-3xl bg-[#edf9f1] border border-[#e2eee6] p-6 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
            <div className="font-syne font-extrabold text-xl">TGOnly <span className="text-sm font-normal text-[#6f7894] ml-2">Grupos y comunidades de Telegram en español para México, Argentina, Colombia y toda Latinoamérica.</span></div>
            <div className="flex flex-wrap gap-5 text-sm text-[#66718d]"><Link href="/grupos">Explorar</Link><Link href="/agregar">Agregar grupo</Link><Link href="/buscar">Buscar</Link></div>
          </div>
        </footer>
      </div>
    </>
  )
}
