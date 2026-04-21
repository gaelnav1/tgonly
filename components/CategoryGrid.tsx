import { categories } from '@/data/groups'
import Link from 'next/link'

export default function CategoryGrid() {
  return (
    <div className="tg-cat-grid">
      {categories.map(cat => (
        <Link key={cat.slug} href={`/grupos/${cat.slug}`} className="tg-cat-card">
          <span className="tg-cat-emoji">{cat.emoji}</span>
          <span className="tg-cat-name">{cat.name}</span>
          <span className="tg-cat-count">{cat.count} grupos</span>
        </Link>
      ))}
    </div>
  )
}
