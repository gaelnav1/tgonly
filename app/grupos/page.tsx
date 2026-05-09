import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGroups, getAllCategories } from '@/lib/getGroups'
import Navbar from '@/components/Navbar'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Todos los grupos de Telegram en Espanol por Categoria | TGOnly',
  description: 'Explora todas las categorias de grupos de Telegram en espanol para LATAM.',
  alternates: { canonical: 'https://telegramonly.com/grupos' },
}

export default async function GruposPage() {
  const [groups, categories] = await Promise.all([getAllGroups(), getAllCategories()])
  const countByCategory = categories.map(cat => ({
    ...cat,
    realCount: groups.filter(g => g.category === cat.slug).length,
    trending: groups.filter(g => g.category === cat.slug && g.trending).length,
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8]" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-10 pt-24 pb-24">
        <div className="mb-12 pt-6">
          <div className="inline-flex items-center gap-2 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-full px-4 py-1.5 text-xs font-medium text-[#2AABEE] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE] animate-pulse" />{groups.length}+ grupos verificados
          </div>
          <h1 className="font-syne font-extrabold text-[clamp(32px,5vw,52px)] leading-tight mb-4">
            Todas las categorias de<br /><span className="text-[#2AABEE]">Telegram en Espanol</span>
          </h1>
          <p className="text-[#8888aa] text-lg max-w-xl">{categories.length} categorias con miles de grupos activos para toda LATAM.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countByCategory.map(cat => (
            <Link key={cat.slug} href={`/grupos/${cat.slug}`}
              className="group flex items-center gap-4 bg-[#111118] border border-white/[0.07] rounded-2xl p-5 hover:border-[#2AABEE]/30 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-14 h-14 rounded-xl bg-[#1c1c27] flex items-center justify-center text-3xl flex-shrink-0">{cat.emoji}</div>
              <div className="flex-1 min-w-0">
                <h2 className="font-syne font-bold text-[16px] text-[#f0eff8] mb-1">{cat.name}</h2>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-[#3dd68c] font-semibold">{cat.realCount || cat.count} grupos</span>
                  {cat.trending > 0 && <span className="text-amber-400">🔥 {cat.trending} trending</span>}
                </div>
              </div>
              <svg className="text-[#8888aa] group-hover:text-[#2AABEE] transition-colors flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center bg-[#111118] border border-white/[0.07] rounded-2xl p-10">
          <p className="text-4xl mb-4">📣</p>
          <h2 className="font-syne font-bold text-[22px] mb-3">¿Tu grupo no esta aqui?</h2>
          <p className="text-[#8888aa] mb-6 max-w-md mx-auto">Agrega tu grupo gratis. Lo revisamos en 24-48 horas.</p>
          <Link href="/agregar" className="inline-flex items-center gap-2 bg-[#2AABEE] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#1a8fd1] transition-colors text-[15px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.94z"/></svg>
            Agregar mi grupo gratis
          </Link>
        </div>
      </div>
      <footer className="border-t border-white/[0.07] px-10 py-7 flex items-center justify-between text-[13px] text-[#8888aa]">
        <span className="font-syne font-extrabold text-base text-[#f0eff8]">TG<span className="text-[#2AABEE]">Only</span></span>
        <span>2025 TGOnly · LATAM</span>
      </footer>
    </div>
  )
}
