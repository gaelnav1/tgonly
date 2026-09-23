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
            <div className="grid lg:grid-cols-[1.6fr_.9fr] gap-8 items-stretch">
              <div className="flex flex-col justify-center py-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#1769ff] mb-3">Comunidades que te conectan</p>
                <h1 className="font-syne font-extrabold text-[clamp(38px,4.35vw,56px)] leading-[1.06] tracking-[-1.2px] mb-4 max-w-[740px]">
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

              <div className="relative ml-auto w-full max-w-[430px] min-h-[330px] rounded-[34px] bg-[#FFF3C9] overflow-hidden p-8">
                <div className="relative z-10 max-w-[210px]">
                  <h2 className="font-syne font-extrabold text-[24px] leading-[1.08] tracking-[-0.35px] text-[#0D1533]">
                    Conecta<br/>con<br/>lo que te<br/>interesa
                  </h2>

                  <p className="mt-5 text-[13px] leading-[1.6] text-[#66718D]">
                    Miles de comunidades<br/>reales en un solo lugar.<br/>Explora. Únete. Crece.
                  </p>

                  <div className="mt-6 h-[6px] w-14 rounded-full bg-[#F4C400]" />
                </div>

                <div className="absolute right-12 top-8 flex gap-3">
                  <span className="block h-[34px] w-[6px] rotate-[14deg] rounded-full bg-[#F4C400]" />
                  <span className="block h-[26px] w-[6px] rotate-[14deg] rounded-full bg-[#F4C400]" />
                </div>

                <div className="absolute right-7 top-[94px] rotate-[-8deg]">
                  <div className="flex h-[190px] w-[190px] items-center justify-center rounded-[36px] bg-[#E8EEFF] shadow-[0_18px_40px_rgba(39,56,95,.12)]">
                    <svg width="92" height="92" viewBox="0 0 24 24" fill="currentColor" className="text-[#256BFF]" aria-hidden="true">
                      <path d="M21.5 3.5L2.8 10.7c-1.3.5-1.3 1.3-.2 1.7l4.8 1.5 1.8 5.5c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.6c.9.5 1.5.2 1.7-.8l3.2-15.1c.3-1.2-.4-1.8-1.5-1.3Z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-6 left-1/2 z-10 flex min-w-[260px] -translate-x-1/2 items-center gap-3 rounded-[22px] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(39,56,95,.14)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#256BFF]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5 1.34 3.5 3 3.5Z" />
                      <path d="M8 11c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Z" />
                      <path d="M16 20v-1c0-1.66-1.79-3-4-3s-4 1.34-4 3v1" />
                      <path d="M20 20v-1c0-1.2-.94-2.23-2.28-2.74" />
                      <path d="M4 20v-1c0-1.2.94-2.23 2.28-2.74" />
                    </svg>
                  </div>

                  <div className="leading-tight">
                    <div className="text-[15px] font-bold text-[#243250]">Comunidades reales</div>
                    <div className="text-[13px] text-[#7A86A2]">Personas como tú</div>
                  </div>
                </div>
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
