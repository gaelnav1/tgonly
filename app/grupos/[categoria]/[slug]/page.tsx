import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGroups } from '@/lib/getGroups'
import { categories as staticCategories } from '@/data/groups'
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
    title: `${group.name} — Grupo de Telegram | TGOnly`,
    description: group.desc || `Unete al grupo de Telegram ${group.name}. ${group.members} miembros activos.`,
    alternates: { canonical: `https://telegramonly.com/grupos/${params.categoria}/${params.slug}` },
  }
}

export default async function GroupPage({ params }: { params: { categoria: string; slug: string } }) {
  const groups = await getAllGroups()
  const group = groups.find(g => g.category === params.categoria && slugify(g.name) === params.slug)
  if (!group) notFound()

  const cat = staticCategories.find(c => c.slug === params.categoria)
  const related = groups.filter(g => g.category === params.categoria && slugify(g.name) !== params.slug).slice(0,3)
  const idParam   = group.id ? `&id=${group.id}` : ''
  const linkParam = group.link && group.link !== '#' ? `&link=${encodeURIComponent(group.link)}` : ''
  const photoSrc  = group.photo_url
    ? `/api/photo?url=${encodeURIComponent(group.photo_url)}${idParam}${linkParam}`
    : group.username
    ? `/api/photo?username=${group.username}${idParam}${linkParam}`
    : group.link && group.link !== '#'
    ? `/api/photo?link=${encodeURIComponent(group.link)}${idParam}`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org","@type":"SocialMediaPosting",
        "name":group.name,"description":group.desc||`Grupo de Telegram: ${group.name}`,
        "url":`https://telegramonly.com/grupos/${params.categoria}/${params.slug}`,
        "datePublished":new Date().toISOString(),"dateModified":new Date().toISOString(),
        "author":{"@type":"Organization","name":"TGOnly","url":"https://telegramonly.com"},
        "sharedContent":{"@type":"WebPage","url":group.link},
        "keywords":group.tags?.join(', ')||group.category,
        "interactionStatistic":{"@type":"InteractionCounter","interactionType":"https://schema.org/FollowAction","userInteractionCount":group.members}
      })}} />
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <nav className="flex items-center gap-2 text-sm text-[#8888aa] mb-8 pt-4">
          <Link href="/" className="hover:text-[#f0eff8] transition-colors">Inicio</Link><span>/</span>
          <Link href="/grupos" className="hover:text-[#f0eff8] transition-colors">Grupos</Link><span>/</span>
          <Link href={`/grupos/${params.categoria}`} className="hover:text-[#f0eff8] transition-colors">{cat?.name||params.categoria}</Link><span>/</span>
          <span className="text-[#f0eff8] truncate">{group.name}</span>
        </nav>

        <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-5 mb-6">
            <div className="relative flex-shrink-0" style={{width:80,height:80}}>
              <div className="absolute inset-0 rounded-2xl bg-[#2AABEE]/10 flex items-center justify-center text-4xl">{group.emoji}</div>
              {photoSrc && <img src={photoSrc} alt={group.name} width={80} height={80} className="absolute inset-0 rounded-2xl object-cover w-full h-full" style={{zIndex:1}} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="font-syne font-extrabold text-[24px] text-[#f0eff8]">{group.name}</h1>
                {group.verified && <span className="w-5 h-5 bg-[#2AABEE] rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">✓</span>}
                {group.trending && <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded px-2 py-0.5">🔥 Trending</span>}
              </div>
              <div className="flex items-center gap-4 text-sm text-[#8888aa]">
                <span className="text-[#3dd68c] font-semibold font-syne text-base">{group.members} miembros</span>
                <span className="capitalize">{cat?.name||params.categoria}</span>
              </div>
            </div>
          </div>

          {group.desc && <p className="text-[#8888aa] leading-relaxed mb-6 text-[15px]">{group.desc}</p>}

          {group.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              {group.tags.map(t=><span key={t} className="text-[12px] text-[#8888aa] bg-[#1c1c27] border border-white/[0.07] rounded-lg px-3 py-1">#{t}</span>)}
            </div>
          )}

          <a href={group.link} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#2AABEE] text-black font-bold text-[16px] py-4 rounded-xl hover:bg-[#1a8fd1] transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(42,171,238,0.3)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.94z"/></svg>
            Unirme gratis en Telegram
          </a>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="font-syne font-bold text-[18px] mb-4">Grupos similares en {cat?.name}</h2>
            <div className="flex flex-col gap-3">
              {related.map(g => {
                const rPhotoSrc = g.photo_url ? `/api/photo?url=${encodeURIComponent(g.photo_url)}` : g.username ? `/api/photo?username=${g.username}` : null
                return (
                  <Link key={g.name} href={`/grupos/${g.category}/${slugify(g.name)}`}
                    className="flex items-center gap-4 bg-[#111118] border border-white/[0.07] rounded-xl p-4 hover:border-[#2AABEE]/30 transition-all">
                    <div className="relative flex-shrink-0" style={{width:44,height:44}}>
                      <div className="absolute inset-0 rounded-xl bg-[#2AABEE]/10 flex items-center justify-center text-xl">{g.emoji}</div>
                      {rPhotoSrc && <img src={rPhotoSrc} alt={g.name} width={44} height={44} className="absolute inset-0 rounded-xl object-cover w-full h-full" style={{zIndex:1}} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-syne font-bold text-[14px] text-[#f0eff8] truncate">{g.name}</p>
                      <p className="text-[12px] text-[#3dd68c] font-semibold">{g.members} miembros</p>
                    </div>
                    <svg className="text-[#8888aa]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <footer className="border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
        <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}
