import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import GroupCard from '@/components/GroupCard'
import Navbar from '@/components/Navbar'

export const revalidate = 60

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(cat => ({ categoria: cat.slug }))
}

const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  fans: {
    title: 'Grupos de Telegram OnlyFans en Espanol 2025 | TGOnly',
    description: 'Los mejores grupos de Telegram OnlyFans en espanol. Canales de contenido exclusivo, influencers y creadores de LATAM.',
    keywords: 'telegram onlyfans, grupos telegram onlyfans, telegram only fans, canales onlyfans telegram',
  },
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const categories = await getAllCategories()
  const cat = categories.find(c => c.slug === params.categoria)
  if (!cat) return {}
  const seo = CATEGORY_SEO[params.categoria]
  return {
    title: seo?.title || `Grupos de Telegram de ${cat.name} en Espanol 2025 | TGOnly`,
    description: seo?.description || `Descubre los mejores grupos de Telegram de ${cat.name} en espanol. Comunidades verificadas para LATAM.`,
    keywords: seo?.keywords,
    alternates: { canonical: `https://telegramonly.com/grupos/${cat.slug}` },
  }
}

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const [allGroups, categories] = await Promise.all([getAllGroups(), getAllCategories()])
  const cat = categories.find(c => c.slug === params.categoria)
  if (!cat) notFound()

  const catGroups = allGroups.filter(g => g.category === cat.slug)
  const trendingInCat = catGroups.filter(g => g.trending)
  const related = categories.filter(c => c.slug !== cat.slug).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-20">
        <nav className="flex items-center gap-2 text-sm text-[#6f7894] mb-8 pt-4">
          <Link href="/" className="hover:text-[#11182d] transition-colors">Inicio</Link><span>/</span>
          <Link href="/grupos" className="hover:text-[#11182d] transition-colors">Grupos</Link><span>/</span>
          <span className="text-[#11182d]">{cat.name}</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-16 h-16 rounded-2xl bg-white border border-[#e6eaf2] shadow-[0_8px_24px_rgba(39,56,95,.06)] flex items-center justify-center text-4xl">{cat.emoji}</span>
            <div>
              <h1 className="font-syne font-extrabold text-[clamp(28px,4vw,40px)] leading-tight">
                Grupos de Telegram de <span className="text-[#1769ff]">{cat.name}</span>
              </h1>
              <p className="text-[#6f7894] mt-1 text-sm">{catGroups.length} comunidades verificadas en español</p>
            </div>
          </div>
        </div>

        {params.categoria === 'fans' && (
          <div className="mb-12 bg-white border border-[#e6eaf2] rounded-2xl p-8">
            <h2 className="font-syne font-bold text-[20px] mb-4">Grupos de Telegram <span className="text-[#2AABEE]">OnlyFans</span> en Espanol</h2>
            <p className="text-[#6f7894] text-[14px] leading-relaxed mb-4">TGOnly es el directorio mas completo de <strong className="text-[#11182d]">grupos de Telegram OnlyFans en espanol</strong>. Encuentra canales de contenido exclusivo de influencers y creadores de LATAM.</p>
            <p className="text-[#6f7894] text-[14px] leading-relaxed">Nuestros <strong className="text-[#11182d]">canales de Telegram Only Fans</strong> incluyen contenido de las creadoras mas populares de habla hispana. Todos los grupos son verificados y activos.</p>
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
            <div className="text-center py-16 text-[#6f7894]">
              <p className="text-5xl mb-4">{cat.emoji}</p>
              <p className="mb-4">Pronto habra grupos de {cat.name} disponibles.</p>
              <Link href="/agregar" className="inline-block bg-[#1769ff] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0d5cef] transition-colors">Agrega el primero →</Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">Otras categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {related.map(relCat => (
              <Link key={relCat.slug} href={`/grupos/${relCat.slug}`}
                className="flex flex-col gap-2 bg-[#f3f6fb] border border-[#e6eaf2] rounded-xl p-4 hover:-translate-y-0.5 hover:border-[#e0e6ef] transition-all">                <span className="text-[13px] font-medium text-[#11182d]">{relCat.name}</span>
                <span className="text-[11px] text-[#6f7894]">{relCat.count} grupos</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <footer className="border-t border-[#e6eaf2] px-10 py-7 flex items-center justify-between text-[13px] text-[#6f7894]">
        <span className="font-syne font-extrabold text-base text-[#11182d]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}
