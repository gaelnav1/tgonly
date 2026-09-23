import Link from 'next/link'
type Category = { emoji: string; name: string; count: string; slug: string }

const tints = ['#fff4cf','#eeeaff','#eaf3ff','#ffeaf0','#e8f8ee','#edf4ff','#fff0f4','#e8f8ee']

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map((cat, i) => (
        <Link key={cat.slug} href={`/grupos/${cat.slug}`}
          className="group flex items-center gap-3 bg-white border border-[#e6eaf2] rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(39,56,95,.08)]">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]" style={{background:tints[i%tints.length]}}>{cat.emoji}</span>
          <div className="min-w-0">
            <span className="block text-[14px] font-bold text-[#11182d] truncate">{cat.name}</span>
            <span className="text-[11px] text-[#7f89a3]">{cat.count} grupos</span>
          </div>
          <span className="ml-auto text-[#95a0b8] group-hover:text-[#1769ff]">›</span>
        </Link>
      ))}
    </div>
  )
}
