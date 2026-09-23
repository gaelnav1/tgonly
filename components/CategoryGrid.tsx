import Link from 'next/link'
import CategoryIcon from './CategoryIcon'

type Category = { emoji: string; name: string; count: string; slug: string }

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map(cat => (
        <Link
          key={cat.slug}
          href={`/grupos/${cat.slug}`}
          className="group flex items-center gap-3 rounded-2xl border border-[#e6eaf2] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(39,56,95,.08)]"
        >
          <CategoryIcon slug={cat.slug} />
          <div className="min-w-0">
            <span className="block truncate text-[14px] font-bold text-[#11182d]">{cat.name}</span>
            <span className="text-[11px] text-[#7f89a3]">{cat.count} grupos</span>
          </div>
          <span className="ml-auto text-[#95a0b8] transition-colors group-hover:text-[#1769ff]">›</span>
        </Link>
      ))}
    </div>
  )
}
