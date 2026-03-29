// ✅ Página individual de grupo — SSG con Schema SocialMediaPosting
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { categories, groups } from '@/data/groups'

// Función de slugify compartida
function slugify(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ✅ Genera todas las rutas: /grupos/cripto/bitcoin-mx-traders
export async function generateStaticParams() {
  return groups.map(g => ({
    categoria: g.category,
    slug: slugify(g.name),
  }))
}

export async function generateMetadata(
  { params }: { params: { categoria: string; slug: string } }
): Promise<Metadata> {
  const group = groups.find(
    g => g.category === params.categoria && slugify(g.name) === params.slug
  )
  if (!group) return {}

  const cat = categories.find(c => c.slug === group.category)
  const title = `${group.name} — Grupo de Telegram de ${cat?.name ?? group.category} | TGOnly`
  const description = `${group.desc} Únete a ${group.name}, uno de los mejores grupos de Telegram de ${cat?.name ?? group.category} en español con ${group.members} miembros.`

  return {
    title,
    description,
    keywords: [
      group.name,
      ...group.tags,
      `grupo telegram ${group.category}`,
      `${group.name} telegram`,
    ],
    openGraph: {
      title,
      description,
      url: `https://tgonly.com/grupos/${group.category}/${params.slug}`,
      siteName: 'TGOnly',
      locale: 'es_MX',
      type: 'article',
    },
    alternates: {
      canonical: `https://tgonly.com/grupos/${group.category}/${params.slug}`,
    },
  }
}

function GroupSchema({ group, cat, slug }: { group: any; cat: any; slug: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://tgonly.com' },
          { '@type': 'ListItem', position: 2, name: cat.name, item: `https://tgonly.com/grupos/${cat.slug}` },
          { '@type': 'ListItem', position: 3, name: group.name, item: `https://tgonly.com/grupos/${cat.slug}/${slug}` },
        ],
      },
      {
        '@type': 'SocialMediaPosting',
        name: group.name,
        description: group.desc,
        url: group.link,
        sharedContent: {
          '@type': 'WebPage',
          url: `https://tgonly.com/grupos/${cat.slug}/${slug}`,
        },
        author: {
          '@type': 'Organization',
          name: 'TGOnly',
          url: 'https://tgonly.com',
        },
        keywords: group.tags.join(', '),
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

export default function GroupPage({ params }: { params: { categoria: string; slug: string } }) {
  const group = groups.find(
    g => g.category === params.categoria && slugify(g.name) === params.slug
  )
  if (!group) notFound()

  const cat = categories.find(c => c.slug === group.category)
  if (!cat) notFound()

  // Grupos relacionados
  const related = groups
    .filter(g => g.category === group.category && g.name !== group.name)
    .slice(0, 3)

  const colorMap: Record<string, string> = {
    teal:   'bg-teal-500/10',
    blue:   'bg-blue-500/10',
    amber:  'bg-amber-500/10',
    red:    'bg-red-500/10',
    purple: 'bg-purple-500/10',
  }

  return (
    <>
      <GroupSchema group={group} cat={cat} slug={params.slug} />

      <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="fixed inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(42,171,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(42,171,238,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/[0.07]">
          <Link href="/" className="font-syne font-extrabold text-xl text-[#f0eff8]">
            TG<span className="text-[#2AABEE]">Only</span>
          </Link>
          <Link href="/agregar" className="bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">
            + Agregar grupo
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-10 pt-24 pb-24">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#8888aa] mb-8">
            <Link href="/" className="hover:text-[#f0eff8]">Inicio</Link>
            <span>/</span>
            <Link href={`/grupos/${cat.slug}`} className="hover:text-[#f0eff8]">{cat.name}</Link>
            <span>/</span>
            <span className="text-[#f0eff8] truncate max-w-[200px]">{group.name}</span>
          </nav>

          {/* Group header */}
          <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-5 mb-6">
              <div className={`w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl flex-shrink-0 ${colorMap[group.color]}`}>
                {group.emoji}
              </div>
              <div className="flex-1">
                {/* ✅ H1 con nombre del grupo */}
                <h1 className="font-syne font-extrabold text-[28px] leading-tight mb-2">{group.name}</h1>
                <div className="flex items-center gap-3 text-sm text-[#8888aa]">
                  {group.verified && (
                    <span className="flex items-center gap-1 text-[#2AABEE]">
                      <span className="w-4 h-4 bg-[#2AABEE] rounded-full flex items-center justify-center text-[9px] font-bold text-black">✓</span>
                      Verificado
                    </span>
                  )}
                  <span className="text-[#3dd68c] font-semibold font-syne">{group.members} miembros</span>
                  <span>·</span>
                  <Link href={`/grupos/${cat.slug}`} className="hover:text-[#f0eff8] transition-colors">
                    {cat.emoji} {cat.name}
                  </Link>
                </div>
              </div>
              {group.trending && (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded px-2.5 py-1">
                  🔥 Trending
                </span>
              )}
            </div>

            {/* ✅ H2 descripción */}
            <h2 className="font-syne font-semibold text-[17px] mb-2">Sobre este grupo</h2>
            <p className="text-[#8888aa] leading-relaxed mb-6">{group.desc}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {group.tags.map((t: string) => (
                <span key={t} className="text-[12px] text-[#8888aa] bg-[#1c1c27] border border-white/[0.07] rounded-md px-3 py-1">
                  #{t}
                </span>
              ))}
            </div>

            <a
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2AABEE] text-black font-bold text-base px-8 py-4 rounded-xl hover:bg-[#1a8fd1] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.94z"/></svg>
              Unirme en Telegram →
            </a>
          </div>

          {/* Related groups */}
          {related.length > 0 && (
            <div>
              <h2 className="font-syne font-bold text-xl mb-4">Grupos similares de {cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map(g => (
                  <Link
                    key={g.name}
                    href={`/grupos/${g.category}/${slugify(g.name)}`}
                    className="bg-[#111118] border border-white/[0.07] rounded-xl p-4 hover:border-[#2AABEE]/30 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{g.emoji}</span>
                      <span className="font-syne font-semibold text-[14px] truncate">{g.name}</span>
                    </div>
                    <p className="text-[12px] text-[#8888aa] line-clamp-2">{g.desc}</p>
                    <p className="text-[11px] text-[#3dd68c] font-semibold mt-2">{g.members} miembros</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
