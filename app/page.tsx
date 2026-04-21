import type { Metadata } from 'next'
import Link from 'next/link'
import { categories, groups } from '@/data/groups'
import CategoryGrid from '@/components/CategoryGrid'
import GroupCard from '@/components/GroupCard'
import SearchBar from '@/components/SearchBar'

export const metadata: Metadata = {
  title: 'TGOnly - Directorio #1 de Grupos de Telegram en Espanol | LATAM',
  description: 'Descubre los mejores grupos de Telegram en espanol. Cripto, tech, gaming, noticias, educacion y mas. Miles de comunidades verificadas para LATAM.',
  alternates: { canonical: 'https://telegramonly.com' },
}

export default function Home() {
  const trendingGroups = groups.filter(g => g.trending).slice(0, 6)
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <nav className="tg-nav">
        <Link href="/" className="tg-logo">
          <span className="tg-logo-dot" />
          TG<span className="tg-logo-accent">Only</span>
        </Link>
        <ul className="tg-nav-links">
          <li><Link href="#categories">Explorar</Link></li>
          <li><Link href="#trending">Trending</Link></li>
          <li><Link href="/grupos">Categorias</Link></li>
          <li><Link href="/agregar" className="tg-nav-cta">+ Agregar grupo</Link></li>
        </ul>
      </nav>

      <section className="tg-hero">
        <div className="tg-hero-glow" />
        <div className="tg-badge"><span className="tg-badge-dot" />El directorio #1 de grupos de Telegram en espanol</div>
        <h1 className="tg-h1">Grupos de Telegram<br />en <em className="tg-h1-accent">Espanol</em></h1>
        <p className="tg-hero-p">Miles de grupos verificados, organizados por tema. Cripto, tech, gaming, educacion y mucho mas para toda LATAM.</p>
        <SearchBar />
        <div className="tg-stats">
          <div className="tg-stat"><span className="tg-stat-num">{groups.length}+</span><span className="tg-stat-label">Grupos</span></div>
          <div className="tg-stat-divider" />
          <div className="tg-stat"><span className="tg-stat-num">48M+</span><span className="tg-stat-label">Miembros</span></div>
          <div className="tg-stat-divider" />
          <div className="tg-stat"><span className="tg-stat-num">{categories.length}</span><span className="tg-stat-label">Categorias</span></div>
          <div className="tg-stat-divider" />
          <div className="tg-stat"><span className="tg-stat-num">100%</span><span className="tg-stat-label">Verificados</span></div>
        </div>
      </section>

      <section id="categories" className="tg-section">
        <div className="tg-section-header">
          <h2 className="tg-section-title">Explorar categorias</h2>
          <Link href="/grupos" className="tg-section-link">Ver todas →</Link>
        </div>
        <CategoryGrid />
      </section>

      <section id="trending" className="tg-section">
        <div className="tg-section-header">
          <h2 className="tg-section-title">🔥 Grupos trending ahora</h2>
          <Link href="/grupos" className="tg-section-link">Ver todos →</Link>
        </div>
        <div className="tg-groups-grid">
          {trendingGroups.map(g => <GroupCard key={g.name} group={g} />)}
        </div>
      </section>

      <footer className="tg-footer">
        <span className="tg-footer-logo">TG<span className="tg-logo-accent">Only</span></span>
        <span>2025 TGOnly - Todos los derechos reservados</span>
        <span>Hecho con amor para la comunidad hispana</span>
      </footer>
    </>
  )
}
