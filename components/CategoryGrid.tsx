import Link from 'next/link'
type Category = { emoji: string; name: string; count: string; slug: string }
export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {categories.map(cat => (
        <Link key={cat.slug} href={`/grupos/${cat.slug}`}
          className="flex flex-col gap-2 bg-[#1c1c27] border border-white/[0.07] rounded-xl p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#222232]">
          <span className="text-[22px]">{cat.emoji}</span>
          <span className="text-[13px] font-medium text-[#f0eff8]">{cat.name}</span>
          <span className="text-[11px] text-[#8888aa]">{cat.count} grupos</span>
        </Link>
      ))}
    </div>
  )
}
