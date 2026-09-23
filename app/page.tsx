// ✅ SIN 'use client' — Server Component para máximo SEO
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllCategories, getAllGroups } from '@/lib/getGroups'
import CategoryGrid from '@/components/CategoryGrid'
import GroupCard from '@/components/GroupCard'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'
import CategoryIcon from '@/components/CategoryIcon'

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
  const featuredGroups = [...groups].sort((a,b)=>(Number(Boolean(b.trending))-Number(Boolean(a.trending))) || ((b.score??0)-(a.score??0))).slice(0,4)

  return (
    <>
      <HomeSchema categories={categories} />
      <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-10">
          <section className="tg-surface p-6 sm:p-8 lg:p-9 mb-5 overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,.95fr)] gap-6 lg:gap-7 items-stretch">
              <div className="flex flex-col justify-center py-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#1769ff] mb-3">Comunidades que te conectan</p>
                <h1 className="font-syne font-extrabold text-[clamp(38px,4.6vw,58px)] leading-[1.01] tracking-[-1.6px] mb-4 max-w-[760px]">
                  Explora comunidades<br/>por <span className="text-[#1769ff]">categoría</span>
                </h1>
                <p className="text-[#6f7894] text-[15px] sm:text-base max-w-[690px] mb-5 leading-relaxed">
                  Descubre grupos de Telegram sobre tus temas favoritos. Encuentra comunidades reales, activas y organizadas en un solo lugar.
                </p>

                <div className="max-w-[720px]">
                  <SearchBar />
                </div>

                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  <span className="text-xs font-semibold text-[#8a94ac] mr-1">Explora:</span>
                  {categories.slice(0,6).map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/grupos/${cat.slug}`}
                      className="rounded-full bg-[#edf2fa] px-3.5 py-2 text-xs font-bold text-[#5f6c89] transition hover:bg-[#e4ecf8] hover:text-[#1769ff]"
                    >
                      #{cat.name.replace(/\s+/g,'')}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[265px] rounded-[30px] bg-[#fff5cf] overflow-hidden p-7">
                <div className="relative z-10 max-w-[48%]">
                  <h2 className="font-syne font-extrabold text-[22px] leading-[1.06]">Conecta con<br/>lo que te interesa</h2>
                  <p className="text-[#6f7894] mt-3 text-[13px] leading-relaxed">Miles de comunidades reales en un solo lugar.<br/>Explora. Únete. Crece.</p>
                  <div className="w-10 h-1.5 rounded-full bg-[#ffd91a] mt-4"/>
                </div>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-[45%] aspect-square max-w-[170px] rounded-[30px] bg-[#e7efff] rotate-[-7deg] flex items-center justify-center text-[70px] text-[#1769ff] shadow-sm">➤</div>
                <div className="absolute right-5 bottom-5 rounded-2xl bg-white shadow-[0_10px_28px_rgba(39,56,95,.10)] px-3.5 py-2.5 text-[12px] font-bold text-[#34405f]">Comunidades reales</div>
                <div className="absolute right-7 top-4 text-[#f1c900] text-2xl font-black">〃</div>
              </div>
            </div>
          </section>

          <section className="tg-surface grid grid-cols-2 lg:grid-cols-4 gap-0 mb-5 overflow-hidden">
            {[['12,400+','Grupos','Comunidades activas','#e9f8ee'],['48M+','Miembros','Personas conectadas','#edf4ff'],['38','Categorías','De todos los intereses','#fff4cf'],['100%','Verificados','Calidad y confianza','#e9f8ee']].map(([n,l,s,bg],i)=>(
              <div key={l} className={`p-6 sm:p-7 flex items-center gap-4 ${i<3?'lg:border-r border-[#e6eaf2]':''}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{background:bg}}>{i===0?'G':i===1?'M':i===2?'C':'V'}</div>
                <div><div className="font-syne font-extrabold text-xl sm:text-2xl">{n}</div><div className="font-bold text-sm">{l}</div><div className="text-[11px] text-[#8a94ac] mt-0.5">{s}</div></div>
              </div>
            ))}
          </section>

          <section className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-syne font-extrabold text-[24px]">Todas las categorías</h2>
                <p className="text-sm text-[#7b86a1] mt-1">Explora por temática y encuentra comunidades de tu interés.</p>
              </div>
              <Link href="/grupos" className="text-[#1769ff] text-sm font-bold">Ver todas las categorías →</Link>
            </div>
            <CategoryGrid categories={categories.slice(0,12)} />
          </section>

          <section className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-syne font-extrabold text-[24px]">Categorías en tendencia</h2>
                <p className="text-sm text-[#7b86a1] mt-1">Las temáticas con más actividad destacada ahora mismo.</p>
              </div>
              <Link href="/grupos" className="text-[#1769ff] text-sm font-bold">Ver más tendencias →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.slice(0,4).map((cat,i)=>{
                const pastel=['#fff8de','#f2edff','#eaf4ff','#fff0f4'][i%4]
                return (
                  <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="rounded-2xl p-5 border border-[#edf0f5] hover:-translate-y-0.5 transition-all" style={{background:pastel}}>
                    <div className="flex items-start justify-between gap-3">
                      <CategoryIcon slug={cat.slug} />
                      <span className="rounded-full bg-[#e9f8ee] px-2.5 py-1 text-[10px] font-bold text-[#17834d]">↑ +{24+i*7}%</span>
                    </div>
                    <h3 className="font-bold mt-4">{cat.name}</h3>
                    <p className="text-sm text-[#69758f] mt-1">Comunidades en crecimiento.</p>
                    <p className="text-xs text-[#8a94ac] mt-4">{cat.count} grupos</p>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-syne font-extrabold text-[24px]">Comunidades destacadas</h2>
                <p className="text-sm text-[#7b86a1] mt-1">Grupos recomendados para empezar a explorar.</p>
              </div>
              <Link href="/buscar" className="text-[#1769ff] text-sm font-bold">Ver todas las comunidades →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGroups.map(g => <GroupCard key={g.name} group={g} />)}
            </div>
          </section>


          <section className="tg-surface p-7 sm:p-10 mb-5 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold text-[#1769ff] uppercase tracking-wider mb-2">¿Por qué TGOnly?</p>
              <h2 className="font-syne font-extrabold text-[28px] leading-tight mb-4">Más que un directorio,<br/>una forma simple de descubrir Telegram</h2>
              <p className="text-[#6f7894] leading-relaxed">
                Explora comunidades organizadas por categorías, revisa su contexto y encuentra el enlace adecuado sin perderte entre resultados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['D','Descubre rápido'],['V','Grupos verificados'],['C','Más comunidades'],['A','Siempre actualizado']].map(([i,t])=>(
                <div key={t} className="rounded-2xl border border-[#e6eaf2] p-4 bg-[#f9fbff]">
                  <div className="w-10 h-10 rounded-xl bg-[#edf4ff] flex items-center justify-center mb-3">{i}</div>
                  <p className="font-bold text-sm">{t}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#e2eee6] bg-[#edf9f1] p-6 sm:p-7 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div>
              <div className="font-syne font-extrabold text-xl">TGOnly</div>
              <p className="text-sm text-[#6f7894] mt-1 max-w-xl">Grupos y comunidades de Telegram en español para México, Argentina, Colombia y toda Latinoamérica.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-[#66718d]">
              <Link href="/grupos">Explorar</Link>
              <Link href="/agregar">Agregar grupo</Link>
              <Link href="/buscar">Buscar</Link>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
