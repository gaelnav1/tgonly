// ✅ Server Component — SSG con generateStaticParams
// Genera /grupos/cripto, /grupos/tech, etc. en build time
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { categories, groups } from '@/data/groups'
import GroupCard from '@/components/GroupCard'

// ✅ Genera todas las rutas estáticas en build
export async function generateStaticParams() {
  return categories.map(cat => ({ categoria: cat.slug }))
}

// ✅ Metadata dinámica por categoría
export async function generateMetadata(
  { params }: { params: { categoria: string } }
): Promise<Metadata> {
  const cat = categories.find(c => c.slug === params.categoria)
  if (!cat) return {}

  const title = `Grupos de Telegram de ${cat.name} en Español | TGOnly`
  const description = `Descubre los mejores grupos de Telegram de ${cat.name} en español. ${cat.count} comunidades verificadas para LATAM. Únete gratis.`

  return {
    title,
    description,
    keywords: [
      `grupos telegram ${cat.name.toLowerCase()}`,
      `grupos telegram ${cat.slug}`,
      `mejores grupos telegram ${cat.slug}`,
      `grupos telegram ${cat.slug} español`,
      `comunidades telegram ${cat.slug}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://tgonly.com/grupos/${cat.slug}`,
      siteName: 'TGOnly',
      locale: 'es_MX',
      type: 'website',
    },
    alternates: {
      canonical: `https://tgonly.com/grupos/${cat.slug}`,
    },
  }
}

// ✅ Schema JSON-LD para página de categoría
function CategorySchema({ cat, catGroups }: { cat: any; catGroups: any[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://tgonly.com' },
          { '@type': 'ListItem', position: 2, name: 'Grupos', item: 'https://tgonly.com/grupos' },
          { '@type': 'ListItem', position: 3, name: cat.name, item: `https://tgonly.com/grupos/${cat.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Los mejores grupos de Telegram de ${cat.name} en español`,
        description: `Lista completa de grupos de Telegram de ${cat.name} verificados para la comunidad hispana`,
        numberOfItems: catGroups.length,
        itemListElement: catGroups.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: g.name,
          description: g.desc,
          url: `https://tgonly.com/grupos/${cat.slug}/${slugify(g.name)}`,
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

function slugify(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoryPage({ params }: { params: { categoria: string } }) {
  const cat = categories.find(c => c.slug === params.categoria)
  if (!cat) notFound()

  const catGroups = groups.filter(g => g.category === cat.slug)
  const trendingInCat = catGroups.filter(g => g.trending)

  // Categorías relacionadas para internal linking
  const related = categories.filter(c => c.slug !== cat.slug).slice(0, 4)

  return (
    <>
      <CategorySchema cat={cat} catGroups={catGroups} />

      <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="fixed inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(42,171,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(42,171,238,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/[0.07]">
          <Link href="/" className="flex items-center gap-2 font-syne font-extrabold text-xl text-[#f0eff8]">
            <span className="w-2 h-2 rounded-full bg-[#2AABEE] animate-pulse" />
            TG<span className="text-[#2AABEE]">Only</span>
          </Link>
          <Link href="/agregar" className="bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">
            + Agregar grupo
          </Link>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-10 pt-24 pb-24">

          {/* ✅ Breadcrumb visible (también hay schema) */}
          <nav className="flex items-center gap-2 text-sm text-[#8888aa] mb-8">
            <Link href="/" className="hover:text-[#f0eff8] transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/grupos" className="hover:text-[#f0eff8] transition-colors">Grupos</Link>
            <span>/</span>
            <span className="text-[#f0eff8]">{cat.name}</span>
          </nav>

          {/* ✅ H1 con keyword principal de la página */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{cat.emoji}</span>
              <div>
                <h1 className="font-syne font-extrabold text-[40px] leading-tight">
                  Grupos de Telegram de <span className="text-[#2AABEE]">{cat.name}</span>
                </h1>
                <p className="text-[#8888aa] mt-1">
                  {cat.count} comunidades verificadas en español · Actualizado {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* ✅ Descripción con keywords long-tail */}
            <p className="text-[#8888aa] max-w-3xl leading-relaxed">
              Encuentra los mejores grupos de Telegram de {cat.name} en español para la comunidad hispana.
              Todos los grupos están verificados y organizados para que puedas unirte fácilmente desde México, Argentina, Colombia, España y toda LATAM.
            </p>
          </div>

          {/* Grupos trending de esta categoría */}
          {trendingInCat.length > 0 && (
            <div className="mb-12">
              <h2 className="font-syne font-bold text-xl mb-4">🔥 Trending en {cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingInCat.map(g => <GroupCard key={g.name} group={g} />)}
              </div>
            </div>
          )}

          {/* Todos los grupos de la categoría */}
          <div className="mb-16">
            <h2 className="font-syne font-bold text-xl mb-4">
              Todos los grupos de {cat.name} — {catGroups.length > 0 ? catGroups.length : cat.count}
            </h2>

            {catGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catGroups.map(g => <GroupCard key={g.name} group={g} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-[#8888aa]">
                <p className="text-4xl mb-4">{cat.emoji}</p>
                <p>Pronto habrá grupos de {cat.name} disponibles.</p>
                <Link href="/agregar" className="inline-block mt-4 bg-[#2AABEE] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#1a8fd1] transition-colors">
                  Agrega el primero →
                </Link>
              </div>
            )}
          </div>

          {/* ✅ SEO text block con long-tail keywords */}
          <div className="border border-white/[0.07] rounded-2xl p-8 mb-16 bg-[#111118]">
            <h2 className="font-syne font-bold text-lg mb-3">
              ¿Por qué unirte a grupos de Telegram de {cat.name}?
            </h2>
            <p className="text-[#8888aa] leading-relaxed mb-3">
              Los grupos de Telegram de {cat.name} en español son algunas de las comunidades más activas de LATAM.
              En TGOnly verificamos cada grupo para garantizar que sean activos, relevantes y libres de spam.
            </p>
            <p className="text-[#8888aa] leading-relaxed">
              Puedes encontrar grupos para todos los niveles — desde principiantes hasta expertos — y conectar con
              miles de hispanohablantes apasionados por {cat.name.toLowerCase()} en México, Argentina, Colombia, Chile, España y más.
            </p>
          </div>

          {/* ✅ Internal linking a categorías relacionadas */}
          <div>
            <h2 className="font-syne font-bold text-xl mb-4">Otras categorías populares</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map(relCat => (
                <Link
                  key={relCat.slug}
                  href={`/grupos/${relCat.slug}`}
                  className="flex items-center gap-3 bg-[#1c1c27] border border-white/[0.07] rounded-xl p-4 hover:border-[#2AABEE]/40 hover:bg-[#1c1c35] transition-all"
                >
                  <span className="text-2xl">{relCat.emoji}</span>
                  <div>
                    <p className="text-[13px] font-medium text-[#f0eff8]">{relCat.name}</p>
                    <p className="text-[11px] text-[#8888aa]">{relCat.count} grupos</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
