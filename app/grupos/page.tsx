import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import Navbar from '@/components/Navbar'
import CategoryIcon from '@/components/CategoryIcon'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Todos los grupos de Telegram en Espanol por Categoria | TGOnly',
  description: 'Explora todas las categorias de grupos de Telegram en espanol para LATAM.',
  alternates: { canonical: 'https://telegramonly.com/grupos' },
}

function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

function photoSrc(g: any) {
  if (g.photo_url) return `/api/photo?url=${encodeURIComponent(g.photo_url)}`
  if (g.username) return `/api/photo?username=${encodeURIComponent(g.username)}`
  if (g.link && g.link !== '#') return `/api/photo?link=${encodeURIComponent(g.link)}`
  return null
}

export default async function GruposPage() {
  const [groups, categories] = await Promise.all([getAllGroups(), getAllCategories()])

  const countByCategory = categories.map(cat => ({
    ...cat,
    realCount: groups.filter(g => g.category === cat.slug).length,
    trending: groups.filter(g => g.category === cat.slug && g.trending).length,
  }))

  const trendingCategories = [...countByCategory]
    .sort((a,b) => b.trending - a.trending || b.realCount - a.realCount)
    .slice(0,4)

  const featured = [...groups]
    .sort((a,b)=>(Number(Boolean(b.trending))-Number(Boolean(a.trending))) || ((b.score??0)-(a.score??0)))
    .slice(0,4)

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-10">

        <section className="tg-surface p-6 sm:p-8 lg:p-10 mb-5 overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-stretch">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#1769ff] mb-3">Explorar</p>
              <h1 className="font-syne font-extrabold text-[clamp(40px,6vw,64px)] leading-[1.02] tracking-[-2px] mb-4">
                Explora comunidades<br/>por <span className="text-[#1769ff]">categoría</span>
              </h1>
              <p className="text-[#6f7894] text-base sm:text-lg max-w-2xl mb-6">
                Descubre grupos de Telegram sobre tus temas favoritos. Encuentra comunidades organizadas para toda Latinoamérica.
              </p>

              <form action="/buscar" method="get" className="relative max-w-2xl">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6f7894]" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input name="q" placeholder="Busca categorías, grupos o temas..." className="w-full rounded-2xl border border-[#dfe5ef] bg-white py-[17px] pl-12 pr-32 text-[15px] outline-none focus:border-[#1769ff] focus:ring-4 focus:ring-[#1769ff]/10" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 tg-primary px-5 py-2.5 text-sm font-bold">Buscar →</button>
              </form>

              <div className="flex flex-wrap gap-2 mt-5">
                {['Todas','Populares','Nuevas','Verificadas'].map((t,i)=>(
                  <span key={t} className={`rounded-full px-4 py-2 text-xs font-bold ${i===0?'bg-[#1769ff] text-white':'bg-[#edf2fa] text-[#68738e]'}`}>{t}</span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[300px] rounded-[34px] bg-[#fff5cf] overflow-hidden p-8">
              <div className="relative z-10 max-w-[220px]">
                <h2 className="font-syne font-extrabold text-[28px] leading-tight">Conecta con<br/>lo que te interesa</h2>
                <p className="text-[#6f7894] mt-3 text-sm leading-relaxed">Miles de comunidades reales en un solo lugar.<br/>Explora. Únete. Crece.</p>
                <div className="w-10 h-1.5 rounded-full bg-[#ffd91a] mt-5"/>
              </div>
              <div className="absolute right-7 top-12 w-44 h-44 rounded-[34px] bg-[#e7efff] rotate-[-7deg] flex items-center justify-center text-[86px] text-[#1769ff] shadow-sm">➤</div>
              <div className="absolute right-4 bottom-7 rounded-2xl bg-white shadow-[0_10px_28px_rgba(39,56,95,.10)] px-4 py-3 text-sm font-bold text-[#34405f]">👥 Comunidades reales</div>
              <div className="absolute right-8 top-4 text-[#f1c900] text-3xl font-black">〃</div>
            </div>
          </div>
        </section>

        <section className="tg-surface p-6 sm:p-8 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-syne font-extrabold text-[24px]">Todas las categorías</h2>
              <p className="text-sm text-[#7b86a1] mt-1">Explora por temática y encuentra comunidades de tu interés.</p>
            </div>
            <span className="hidden sm:inline text-[#1769ff] text-sm font-bold">{categories.length} categorías</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {countByCategory.map(cat => (
              <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="group flex items-center gap-3 rounded-2xl border border-[#e6eaf2] bg-white p-4 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(39,56,95,.08)] transition-all">
                <CategoryIcon slug={cat.slug} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[14px] truncate">{cat.name}</h3>
                  <p className="text-[11px] text-[#7f89a3]">{cat.realCount || cat.count} grupos</p>
                </div>
                <span className="text-[#94a0b8] group-hover:text-[#1769ff]">›</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="tg-surface p-6 sm:p-8 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-syne font-extrabold text-[24px]">🔥 Categorías en tendencia</h2>
              <p className="text-sm text-[#7b86a1] mt-1">Las categorías con más actividad destacada ahora mismo.</p>
            </div>
            <Link href="/grupos" className="text-[#1769ff] text-sm font-bold">Ver más →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingCategories.map((cat,i)=>{
              const pastel=['#fff8de','#f2edff','#eaf4ff','#fff0f4'][i%4]
              return (
                <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="rounded-2xl p-5 border border-[#edf0f5] hover:-translate-y-0.5 transition-all" style={{background:pastel}}>
                  <div className="flex items-start justify-between gap-3">
                    <CategoryIcon slug={cat.slug} />
                    <span className="rounded-full bg-[#e9f8ee] px-2.5 py-1 text-[10px] font-bold text-[#17834d]">↑ +{24+i*7}%</span>
                  </div>
                  <h3 className="font-bold mt-4">{cat.name}</h3>
                  <p className="text-sm text-[#69758f] mt-1">{cat.trending > 0 ? `${cat.trending} comunidades destacadas` : 'Categoría en crecimiento'}</p>
                  <p className="text-xs text-[#8a94ac] mt-4">{cat.realCount || cat.count} grupos</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="tg-surface p-6 sm:p-8 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-syne font-extrabold text-[24px]">⭐ Comunidades destacadas</h2>
              <p className="text-sm text-[#7b86a1] mt-1">Grupos recomendados para empezar a explorar.</p>
            </div>
            <Link href="/buscar" className="text-[#1769ff] text-sm font-bold">Ver comunidades →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(g=>{
              const src=photoSrc(g)
              return (
                <article key={g.name} className="rounded-2xl border border-[#e6eaf2] bg-white p-4 flex flex-col">
                  <Link href={`/grupos/${g.category}/${slugify(g.name)}`} className="block">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#edf4ff] flex items-center justify-center text-xl">
                        {src ? <img src={src} alt={g.name} className="w-full h-full object-cover"/> : <span>{g.emoji}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{g.name}</p>
                        <p className="text-[11px] text-[#7f89a3]">{g.members} miembros</p>
                      </div>
                      {g.verified && <span className="ml-auto w-4 h-4 rounded-full bg-[#1769ff] text-white text-[9px] flex items-center justify-center">✓</span>}
                    </div>
                    <p className="text-[12px] text-[#66718d] leading-relaxed mt-4 line-clamp-3">{g.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(g.tags||[]).slice(0,2).map((t:string)=><span key={t} className="rounded-full bg-[#f2f5fa] px-2.5 py-1 text-[10px] font-semibold text-[#61708d]">{t}</span>)}
                    </div>
                  </Link>
                  <a href={g.link} target="_blank" rel="noopener noreferrer" className="tg-primary mt-4 text-center py-2.5 text-xs font-bold">Unirse →</a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e2eee6] bg-[#edf9f1] p-6 sm:p-7 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <div className="font-syne font-extrabold text-xl">TGOnly</div>
            <p className="text-sm text-[#6f7894] mt-1 max-w-xl">Grupos y comunidades de Telegram en español para México, Argentina, Colombia y toda Latinoamérica.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-[#66718d]">
            <Link href="/">Inicio</Link>
            <Link href="/buscar">Buscar</Link>
            <Link href="/agregar">Agregar grupo</Link>
          </div>
        </section>

      </main>
    </div>
  )
}
