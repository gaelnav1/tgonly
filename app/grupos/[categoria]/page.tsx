import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { categories as staticCategories } from '@/data/groups'
import { getAllGroups } from '@/lib/getGroups'
import GroupCard from '@/components/GroupCard'
import Navbar from '@/components/Navbar'

export const revalidate = 60
export const dynamicParams = true

const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  fans: {
    title: 'Grupos de Telegram OnlyFans en Espanol 2025 | TGOnly',
    description: 'Los mejores grupos de Telegram OnlyFans en espanol. Canales de contenido exclusivo, influencers y creadores de LATAM.',
    keywords: 'telegram onlyfans, grupos telegram onlyfans, telegram only fans, canales onlyfans telegram',
  },
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = staticCategories.find(c => c.slug === params.categoria)
  const seo = CATEGORY_SEO[params.categoria]
  const catName = cat?.name || params.categoria.replace(/-/g, ' ')
  return {
    title: seo?.title || `Grupos de Telegram de ${catName} en Espanol 2025 | TGOnly`,
    description: seo?.description || `Descubre los mejores grupos de Telegram de ${catName} en espanol. Comunidades verificadas para LATAM.`,
    keywords: seo?.keywords,
    alternates: { canonical: `https://telegramonly.com/grupos/${params.categoria}` },
  }
}

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const allGroups = await getAllGroups()
  const catGroups = allGroups.filter(g => g.category === params.categoria)

  // Buscar categoria en estaticas o construirla desde los grupos
  let cat = staticCategories.find(c => c.slug === params.categoria)
  if (!cat) {
    if (catGroups.length === 0) notFound()
    // Construir categoria desde los grupos de Supabase
    cat = {
      emoji: catGroups[0]?.emoji || '📁',
      name: params.categoria.replace(/-/g, ' ').replace(/\w/g, l => l.toUpperCase()),
      count: String(catGroups.length),
      slug: params.categoria,
    }
  }
  const trendingInCat = catGroups.filter(g => g.trending)
  const related = staticCategories.filter(c => c.slug !== cat.slug).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-10 pt-24 pb-24">
        <nav className="flex items-center gap-2 text-sm text-[#8888aa] mb-8 pt-4">
          <Link href="/" className="hover:text-[#f0eff8] transition-colors">Inicio</Link><span>/</span>
          <Link href="/grupos" className="hover:text-[#f0eff8] transition-colors">Grupos</Link><span>/</span>
          <span className="text-[#f0eff8]">{cat.name}</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{cat.emoji}</span>
            <div>
              <h1 className="font-syne font-extrabold text-[clamp(28px,4vw,40px)] leading-tight">
                Grupos de Telegram de <span className="text-[#2AABEE]">{cat.name}</span>
              </h1>
              <p className="text-[#8888aa] mt-1 text-sm">{catGroups.length} comunidades verificadas en espanol</p>
            </div>
          </div>
        </div>

        {params.categoria === 'fans' && (
          <div className="mb-12 bg-[#111118] border border-white/[0.07] rounded-2xl p-8">
            <h2 className="font-syne font-bold text-[20px] mb-4">Grupos de Telegram <span className="text-[#2AABEE]">OnlyFans</span> en Espanol</h2>
            <p className="text-[#8888aa] text-[14px] leading-relaxed mb-4">TGOnly es el directorio mas completo de <strong className="text-[#f0eff8]">grupos de Telegram OnlyFans en espanol</strong>. Encuentra canales de contenido exclusivo de influencers y creadores de LATAM.</p>
            <p className="text-[#8888aa] text-[14px] leading-relaxed">Nuestros <strong className="text-[#f0eff8]">canales de Telegram Only Fans</strong> incluyen contenido de las creadoras mas populares de habla hispana. Todos los grupos son verificados y activos.</p>
          </div>
        )}

        {trendingInCat.length > 0 && (
          <div className="mb-12">
            <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">🔥 Trending en {cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingInCat.map(g => <GroupCard key={g.name} group={g} />)}
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">Todos los grupos de {cat.name} — {catGroups.length}</h2>
          {catGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catGroups.map(g => <GroupCard key={g.name} group={g} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-[#8888aa]">
              <p className="text-5xl mb-4">{cat.emoji}</p>
              <p className="mb-4">Pronto habra grupos de {cat.name} disponibles.</p>
              <Link href="/agregar" className="inline-block bg-[#2AABEE] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#1a8fd1] transition-colors">Agrega el primero →</Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">Otras categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {related.map(relCat => (
              <Link key={relCat.slug} href={`/grupos/${relCat.slug}`}
                className="flex flex-col gap-2 bg-[#1c1c27] border border-white/[0.07] rounded-xl p-4 hover:-translate-y-0.5 hover:border-white/[0.12] transition-all">
                <span className="text-[22px]">{relCat.emoji}</span>
                <span className="text-[13px] font-medium text-[#f0eff8]">{relCat.name}</span>
                <span className="text-[11px] text-[#8888aa]">{relCat.count} grupos</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <footer className="border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
        <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}
