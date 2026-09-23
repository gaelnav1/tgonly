import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import Navbar from '@/components/Navbar'
import GroupCard from '@/components/GroupCard'

export const revalidate = 60

function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

export async function generateStaticParams() {
  const groups = await getAllGroups()
  return groups.sort((a,b)=>(b.score??0)-(a.score??0)).slice(0,20)
    .map(g => ({ categoria: g.category, slug: slugify(g.name) }))
}

export async function generateMetadata({ params }: { params: { categoria: string; slug: string } }): Promise<Metadata> {
  const groups = await getAllGroups()
  const group = groups.find(g => g.category === params.categoria && slugify(g.name) === params.slug)
  if (!group) return {}
  return {
    title: `${group.name} Telegram — Grupo, canal y enlace | TGOnly`,
    description: group.desc || `Encuentra ${group.name} en Telegram. Consulta el enlace, comunidad relacionada y datos del grupo en TGOnly.`,
    keywords: [`${group.name} telegram`, `telegram ${group.name}`, `grupo telegram ${group.name}`, `canal telegram ${group.name}`],
    alternates: { canonical: `https://telegramonly.com/grupos/${params.categoria}/${params.slug}` },
  }
}

function photoSrc(g:any) {
  if (g.photo_url) return `/api/photo?url=${encodeURIComponent(g.photo_url)}`
  if (g.username) return `/api/photo?username=${encodeURIComponent(g.username)}${g.id?`&id=${g.id}`:''}`
  if (g.link && g.link !== '#') return `/api/photo?link=${encodeURIComponent(g.link)}`
  return null
}

export default async function GroupPage({ params }: { params: { categoria: string; slug: string } }) {
  const groups = await getAllGroups()
  const group = groups.find(g => g.category === params.categoria && slugify(g.name) === params.slug)
  if (!group) notFound()

  const categories = await getAllCategories()
  const cat = categories.find(c => c.slug === params.categoria)
  const related = groups.filter(g => g.category === params.categoria && slugify(g.name) !== params.slug).slice(0,4)
  const mainPhoto = photoSrc(group)
  const username = group.username ? `@${group.username.replace(/^@/,'')}` : null
  const relatedSearches = [
    `${group.name} telegram`,
    `telegram ${group.name}`,
    `${group.name} oficial`,
    `${group.name} comunidad`
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org",
        "@graph":[
          {
            "@type":"WebPage",
            "@id":`https://telegramonly.com/grupos/${params.categoria}/${params.slug}#webpage`,
            "url":`https://telegramonly.com/grupos/${params.categoria}/${params.slug}`,
            "name":`${group.name} Telegram — Grupo, canal y enlace`,
            "description":group.desc||`Información y enlace de Telegram relacionado con ${group.name}`,
            "inLanguage":"es",
            "isPartOf":{"@id":"https://telegramonly.com/#website"},
            "about":{"@type":"Thing","name":group.name},
            "mainEntity":{
              "@type":"WebPage",
              "name":group.name,
              "url":group.link,
              ...(group.username ? {"alternateName":username} : {})
            }
          },
          {
            "@type":"BreadcrumbList",
            "itemListElement":[
              {"@type":"ListItem","position":1,"name":"Inicio","item":"https://telegramonly.com"},
              {"@type":"ListItem","position":2,"name":"Grupos","item":"https://telegramonly.com/grupos"},
              {"@type":"ListItem","position":3,"name":cat?.name||params.categoria,"item":`https://telegramonly.com/grupos/${params.categoria}`},
              {"@type":"ListItem","position":4,"name":group.name,"item":`https://telegramonly.com/grupos/${params.categoria}/${params.slug}`}
            ]
          }
        ]
      })}} />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-10">
        <nav className="flex items-center gap-2 text-sm text-[#7a86a2] mb-5">
          <Link href="/">Inicio</Link><span>›</span>
          <Link href="/grupos">Categorías</Link><span>›</span>
          <Link href={`/grupos/${params.categoria}`}>{cat?.name||params.categoria}</Link><span>›</span>
          <span className="font-semibold text-[#11182d] truncate">{group.name}</span>
        </nav>

        <section className="tg-surface p-5 sm:p-6 mb-5 overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 items-stretch">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative w-full sm:w-[230px] h-[230px] flex-none rounded-[26px] overflow-hidden bg-[#edf4ff]">
                {mainPhoto ? (
                  <img src={mainPhoto} alt={group.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-syne font-extrabold text-[#1769ff]">{group.name.slice(0,1)}</div>
                )}
                {group.verified && <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-[#1769ff] text-white flex items-center justify-center font-bold shadow-lg">✓</div>}
              </div>

              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-syne font-extrabold text-[clamp(34px,5vw,52px)] leading-none tracking-[-1.5px]">{group.name}</h1>
                  {group.verified && <span className="w-5 h-5 rounded-full bg-[#1769ff] text-white text-[11px] flex items-center justify-center font-bold">✓</span>}
                </div>

                {username && <p className="mt-2 text-[#5f6c89] text-base">{username}</p>}

                <div className="mt-4 flex items-center gap-2 text-[#34405f] font-semibold">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
                  <span>{group.members} miembros</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="rounded-full bg-[#ffeaf0] px-3.5 py-2 text-xs font-bold text-[#c44062]">{cat?.name||params.categoria}</span>
                  {(group.tags||[]).slice(0,2).map(t=>(
                    <span key={t} className="rounded-full bg-[#edf4ff] px-3.5 py-2 text-xs font-bold text-[#1769ff]">{t}</span>
                  ))}
                </div>

                {group.desc && <p className="mt-5 max-w-2xl text-[#64708d] leading-relaxed text-[15px]">{group.desc}</p>}
              </div>
            </div>

            <div className="relative rounded-[28px] bg-[#fff5cf] min-h-[230px] overflow-hidden p-6 flex flex-col justify-between">
              <div className="relative z-10 max-w-[210px]">
                <h2 className="font-syne font-extrabold text-[24px] leading-[1.05]">Personas reales<br/>Conversaciones<br/>que inspiran</h2>
                <div className="w-10 h-1.5 rounded-full bg-[#f4c400] mt-4"/>
              </div>

              <div className="absolute right-5 top-8 w-[150px] h-[150px] rounded-[30px] bg-[#e7eeff] rotate-[-8deg] flex items-center justify-center text-[#1769ff] shadow-sm">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5L2.8 10.7c-1.3.5-1.3 1.3-.2 1.7l4.8 1.5 1.8 5.5c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.6c.9.5 1.5.2 1.7-.8l3.2-15.1c.3-1.2-.4-1.8-1.5-1.3Z"/></svg>
              </div>

              <a href={group.link} target="_blank" rel="noopener noreferrer" className="relative z-10 mt-auto tg-primary w-full py-3.5 text-center text-sm font-bold">
                Abrir en Telegram ↗
              </a>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            ['Miembros',group.members,'Comunidad'],
            ['Estado',group.verified?'Verificado':'Disponible',group.verified?'Revisado por TGOnly':'Enlace disponible'],
            ['Categoría',cat?.name||params.categoria,'Clasificación'],
            ['Temas',String((group.tags||[]).length),'Etiquetas relacionadas']
          ].map(([label,value,sub])=>(
            <div key={label} className="tg-surface p-5">
              <div className="text-[11px] uppercase tracking-[.12em] font-bold text-[#8a94ac]">{label}</div>
              <div className="font-syne font-extrabold text-[22px] mt-2">{value}</div>
              <div className="text-xs text-[#7b86a1] mt-1">{sub}</div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-5 mb-5">
          <div className="tg-surface p-6 sm:p-8">
            <h2 className="font-syne font-extrabold text-[22px] mb-5">Sobre esta comunidad</h2>
            <p className="text-[#64708d] leading-8">
              {group.desc || `Información disponible sobre ${group.name} y su comunidad en Telegram.`}
            </p>

            {(group.tags||[]).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {group.tags.map(t=><span key={t} className="rounded-full bg-[#f2f5fa] px-3 py-1.5 text-xs font-semibold text-[#61708d]">{t}</span>)}
              </div>
            )}

            <div className="mt-7 rounded-2xl bg-[#fff9df] border border-[#f6ebbb] p-5">
              <p className="text-sm text-[#6f7894]">Usa el botón “Abrir en Telegram” para visitar directamente la comunidad asociada a esta página.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="tg-surface p-6">
              <h2 className="font-syne font-extrabold text-[20px] mb-4">Información de la comunidad</h2>
              <div className="divide-y divide-[#edf0f5] text-sm">
                <div className="py-3 flex justify-between gap-4"><span className="text-[#7b86a1]">Categoría</span><span className="font-semibold">{cat?.name||params.categoria}</span></div>
                <div className="py-3 flex justify-between gap-4"><span className="text-[#7b86a1]">Miembros</span><span className="font-semibold">{group.members}</span></div>
                <div className="py-3 flex justify-between gap-4"><span className="text-[#7b86a1]">Verificado</span><span className="font-semibold">{group.verified?'Sí':'No'}</span></div>
                {username && <div className="py-3 flex justify-between gap-4"><span className="text-[#7b86a1]">Usuario</span><span className="font-semibold text-[#1769ff]">{username}</span></div>}
              </div>
            </div>

            <div className="tg-surface p-6">
              <h2 className="font-syne font-extrabold text-[20px] mb-4">Búsquedas relacionadas</h2>
              <div className="flex flex-wrap gap-2">
                {relatedSearches.map(q=>(
                  <Link key={q} href={`/buscar?q=${encodeURIComponent(q)}`} className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-semibold text-[#1769ff]">{q}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="tg-surface p-6 sm:p-8 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-syne font-extrabold text-[22px]">Comunidades relacionadas</h2>
                <p className="text-sm text-[#7b86a1] mt-1">Descubre más comunidades de {cat?.name||params.categoria}.</p>
              </div>
              <Link href={`/grupos/${params.categoria}`} className="text-sm font-bold text-[#1769ff]">Ver todas →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(g=><GroupCard key={g.name} group={g}/>)}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-[#e2eee6] bg-[#edf9f1] p-6 sm:p-7 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <div className="font-syne font-extrabold text-xl">TGOnly</div>
            <p className="text-sm text-[#6f7894] mt-1 max-w-xl">Grupos y comunidades de Telegram en español para México, Argentina, Colombia y toda Latinoamérica.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-[#66718d]">
            <Link href="/grupos">Explorar</Link>
            <Link href="/buscar">Buscar</Link>
            <Link href="/agregar">Agregar grupo</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
