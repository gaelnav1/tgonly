import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import { categories as staticCategories } from '@/data/groups'
import CategoryGrid from '@/components/CategoryGrid'
import GroupCard from '@/components/GroupCard'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'TGOnly - Directorio #1 de Grupos de Telegram en Espanol | LATAM',
  description: 'Descubre los mejores grupos de Telegram en espanol. OnlyFans, cripto, gaming, tech y mas para LATAM.',
  alternates: { canonical: 'https://telegramonly.com' },
}

export default async function Home() {
  const [groups, categories] = await Promise.all([getAllGroups(), getAllCategories()])
  const trendingGroups = groups.filter(g => g.trending).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(42,171,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(42,171,238,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
      <Navbar />

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background:'radial-gradient(ellipse,rgba(42,171,238,0.12) 0%,transparent 70%)' }} />
        <div className="inline-flex items-center gap-2 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-full px-4 py-1.5 text-xs font-medium text-[#2AABEE] mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE] animate-pulse" />
          El directorio #1 de grupos de Telegram en espanol
        </div>
        <h1 className="font-syne font-extrabold text-[clamp(42px,7vw,80px)] leading-[1.05] tracking-[-2px] mb-5">
          Grupos de Telegram<br />en <em className="not-italic text-[#2AABEE]">Espanol</em>
        </h1>
        <p className="text-lg text-[#8888aa] max-w-xl mb-11 font-light">
          Miles de grupos verificados organizados por tema. Cripto, tech, gaming, educacion y mas para toda LATAM.
        </p>
        <SearchBar />
        <div className="flex items-center gap-10">
          {[
            [`${groups.length}+`,'Grupos'],['48M+','Miembros'],
            [`${categories.length}`,'Categorias'],['100%','Verificados'],
          ].map(([n,l],i) => (
            <div key={l} className="flex items-center gap-10">
              {i > 0 && <div className="w-px h-8 bg-white/[0.12]" />}
              <div className="text-center">
                <span className="block font-syne font-bold text-[26px]">{n}</span>
                <span className="text-[11px] text-[#8888aa] uppercase tracking-widest">{l}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="relative z-10 max-w-6xl mx-auto px-10 pb-20">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-syne font-bold text-[22px] tracking-tight">Explorar categorias</h2>
          <Link href="/grupos" className="text-[#2AABEE] text-[13px] font-medium hover:opacity-70">Ver todas →</Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <section id="trending" className="relative z-10 max-w-6xl mx-auto px-10 pb-24">
        <h2 className="font-syne font-bold text-[22px] tracking-tight mb-6">🔥 Grupos trending ahora</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingGroups.map(g => <GroupCard key={g.name} group={g} />)}
        </div>
        <div className="text-center mt-8">
          <Link href="/grupos" className="inline-flex items-center gap-2 border border-white/[0.12] text-[#8888aa] hover:text-[#f0eff8] transition-all px-6 py-3 rounded-xl text-sm font-medium">
            Ver todos los grupos →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
        <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
        <nav className="flex gap-6">
          {staticCategories.slice(0,6).map(cat => (
            <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="hover:text-[#f0eff8] transition-colors">Grupos {cat.name}</Link>
          ))}
        </nav>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}
