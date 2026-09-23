import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import Navbar from '@/components/Navbar'

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

function getPhotoSrc(g:any) {
  if (g.photo_url) return `/api/photo?url=${encodeURIComponent(g.photo_url)}`
  if (g.username) return `/api/photo?username=${encodeURIComponent(g.username)}${g.id ? `&id=${g.id}` : ''}`
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
  const mainPhoto = getPhotoSrc(group)
  const username = group.username ? `@${group.username.replace(/^@/,'')}` : null
  const relatedSearches = [
    `${group.name} oficial`,
    `${group.name} telegram`,
    `${group.name} fans`,
    ...((group.tags||[]).slice(0,4))
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
              {"@type":"ListItem","position":2,"name":"Categorías","item":"https://telegramonly.com/grupos"},
              {"@type":"ListItem","position":3,"name":cat?.name||params.categoria,"item":`https://telegramonly.com/grupos/${params.categoria}`},
              {"@type":"ListItem","position":4,"name":group.name,"item":`https://telegramonly.com/grupos/${params.categoria}/${params.slug}`}
            ]
          }
        ]
      })}} />

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 lg:px-10">
        <nav className="mb-5 flex items-center gap-2 text-[13px] text-[#7a86a2]">
          <Link href="/" className="hover:text-[#1769ff]">Inicio</Link><span>›</span>
          <Link href="/grupos" className="hover:text-[#1769ff]">Categorías</Link><span>›</span>
          <Link href={`/grupos/${params.categoria}`} className="hover:text-[#1769ff]">{cat?.name||params.categoria}</Link><span>›</span>
          <span className="font-semibold text-[#11182d]">{group.name}</span>
        </nav>

        <section className="mb-4 rounded-[26px] border border-[#e6eaf2] bg-white p-5 shadow-[0_12px_34px_rgba(39,56,95,.05)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
            <div className="grid gap-6 sm:grid-cols-[230px_1fr]">
              <div className="relative h-[230px] w-full overflow-hidden rounded-[24px] bg-[#edf4ff]">
                {mainPhoto ? (
                  <img src={mainPhoto} alt={group.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-syne text-7xl font-extrabold text-[#1769ff]">{group.name.slice(0,1)}</div>
                )}
                {group.verified && (
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#1769ff] text-sm font-bold text-white">✓</div>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-center pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-syne text-[clamp(34px,4vw,48px)] font-extrabold leading-[1.02] tracking-[-1.2px]">{group.name}</h1>
                  {group.verified && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1769ff] text-[10px] font-bold text-white">✓</span>}
                </div>

                {username && <div className="mt-2 text-[16px] font-medium text-[#66718d]">{username}</div>}

                <div className="mt-4 flex items-center gap-2 text-[16px] font-semibold text-[#34405f]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
                  {group.members} miembros
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FFE8EE] px-4 py-2 text-[12px] font-bold text-[#D94B6B]">{cat?.name||params.categoria}</span>
                  {(group.tags||[]).slice(0,2).map(t=>(
                    <span key={t} className="rounded-full bg-[#EEF4FF] px-4 py-2 text-[12px] font-bold text-[#1769ff]">{t}</span>
                  ))}
                </div>

                {group.desc && (
                  <p className="mt-5 max-w-[620px] text-[14px] leading-[1.65] text-[#66718d]">{group.desc}</p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-[#FFF4C9]">
              <img
                src="/illustrations/detail-community-reference.webp"
                alt=""
                aria-hidden="true"
                className="block h-auto w-full"
              />
              <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${group.name} en Telegram`}
                className="absolute bottom-[5%] left-[5%] right-[5%] h-[19%] rounded-[14px] focus:outline-none focus:ring-4 focus:ring-[#1769ff]/25"
              />
            </div>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['MIEMBROS',group.members,'Comunidad en crecimiento','#E9F8EE'],
            ['ESTADO',group.verified?'Verificado':'Disponible',group.verified?'Revisado por TGOnly':'Enlace disponible','#EDF4FF'],
            ['CATEGORÍA',cat?.name||params.categoria,'Clasificación','#FFF0F4'],
            ['TEMAS',String((group.tags||[]).length),'Etiquetas relacionadas','#F2EEFF']
          ].map(([label,value,sub,bg])=>(
            <div key={label} className="rounded-[22px] border border-[#e6eaf2] bg-white p-5 shadow-[0_8px_24px_rgba(39,56,95,.04)]">
              <div className="text-[10px] font-extrabold tracking-[.14em] text-[#8390aa]">{label}</div>
              <div className="mt-2 font-syne text-[22px] font-extrabold tracking-[-.4px]">{value}</div>
              <div className="mt-1 text-[11px] text-[#8390aa]">{sub}</div>
            </div>
          ))}
        </section>

        <section className="mb-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[24px] border border-[#e6eaf2] bg-white p-6 shadow-[0_8px_24px_rgba(39,56,95,.04)] sm:p-7">
            <h2 className="font-syne text-[22px] font-extrabold tracking-[-.35px]">Sobre esta comunidad</h2>

            <div className="mt-5 space-y-4 text-[14px] leading-[1.75] text-[#66718d]">
              <p>{group.desc || `Información disponible sobre ${group.name} y su comunidad en Telegram.`}</p>
              {(group.tags||[]).length > 0 && (
                <p>Temas relacionados: {(group.tags||[]).join(', ')}.</p>
              )}
            </div>

            <div className="mt-6 rounded-[18px] border border-[#F3E8A7] bg-[#FFF8D9] p-5">
              <div className="text-[13px] italic leading-relaxed text-[#53607e]">
                “Encuentra el enlace correcto y entra directamente a la comunidad en Telegram.”
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-[#e6eaf2] bg-white p-6 shadow-[0_8px_24px_rgba(39,56,95,.04)]">
              <h2 className="font-syne text-[20px] font-extrabold leading-tight tracking-[-.3px]">Información de la comunidad</h2>
              <div className="mt-4 divide-y divide-[#edf0f5] text-[13px]">
                <div className="flex justify-between gap-4 py-3"><span className="text-[#7d89a4]">Categoría</span><span className="font-semibold">{cat?.name||params.categoria}</span></div>
                <div className="flex justify-between gap-4 py-3"><span className="text-[#7d89a4]">Miembros</span><span className="font-semibold">{group.members}</span></div>
                <div className="flex justify-between gap-4 py-3"><span className="text-[#7d89a4]">Verificado</span><span className="font-semibold">{group.verified?'Sí':'No'}</span></div>
                {username && <div className="flex justify-between gap-4 py-3"><span className="text-[#7d89a4]">Usuario</span><span className="font-semibold text-[#1769ff]">{username}</span></div>}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e6eaf2] bg-white p-6 shadow-[0_8px_24px_rgba(39,56,95,.04)]">
              <h2 className="font-syne text-[20px] font-extrabold tracking-[-.3px]">Búsquedas relacionadas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedSearches.map(q=>(
                  <Link key={q} href={`/buscar?q=${encodeURIComponent(q)}`} className="rounded-full bg-[#EDF4FF] px-3 py-1.5 text-[11px] font-semibold text-[#1769ff]">{q}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mb-4 rounded-[24px] border border-[#e6eaf2] bg-white p-6 shadow-[0_8px_24px_rgba(39,56,95,.04)] sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-syne text-[22px] font-extrabold tracking-[-.35px]">Comunidades relacionadas</h2>
                <p className="mt-1 text-[12px] text-[#7b86a1]">Descubre más comunidades que podrían interesarte.</p>
              </div>
              <Link href={`/grupos/${params.categoria}`} className="text-[12px] font-bold text-[#1769ff]">Ver todas las comunidades →</Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {related.map(g=>{
                const rPhoto=getPhotoSrc(g)
                return (
                  <article key={g.name} className="rounded-[18px] border border-[#e6eaf2] bg-white p-3.5">
                    <Link href={`/grupos/${g.category}/${slugify(g.name)}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 flex-none overflow-hidden rounded-full bg-[#edf4ff]">
                          {rPhoto ? <img src={rPhoto} alt={g.name} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center font-bold text-[#1769ff]">{g.name.slice(0,1)}</div>}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-bold">{g.name}</div>
                          <div className="text-[11px] text-[#7d89a4]">{g.members} miembros</div>
                        </div>
                        {g.verified && <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#1769ff] text-[9px] font-bold text-white">✓</span>}
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-[36px] text-[11px] leading-relaxed text-[#66718d]">{g.desc}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(g.tags||[]).slice(0,2).map((t:string)=><span key={t} className="rounded-full bg-[#F1F5FB] px-2 py-1 text-[9px] font-semibold text-[#66718d]">{t}</span>)}
                      </div>
                    </Link>
                    <a href={g.link} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-[10px] bg-[#1769ff] py-2 text-center text-[11px] font-bold text-white">Unirse en Telegram ↗</a>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-[#e2eee6] bg-[#edf9f1] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-syne text-xl font-extrabold">TGOnly</div>
              <p className="mt-1 text-[12px] text-[#6f7894]">Grupos y comunidades de Telegram en español para México, Argentina, Colombia y toda Latinoamérica.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] text-[#66718d]">
              <Link href="/grupos">Explorar</Link>
              <Link href="/buscar">Buscar</Link>
              <Link href="/agregar">Agregar grupo</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
