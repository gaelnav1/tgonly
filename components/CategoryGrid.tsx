import Link from 'next/link'
type Category = { emoji: string; name: string; count: string; slug: string }

const covers = [
  {bg:'#fff0b8', fg:'#7a5b00'},
  {bg:'#eee8ff', fg:'#5d49a8'},
  {bg:'#e9f2ff', fg:'#225fa8'},
  {bg:'#ffe8ee', fg:'#a33d5a'},
  {bg:'#e7f7ee', fg:'#2f7c55'},
  {bg:'#eaf0ff', fg:'#315faa'},
  {bg:'#fff0f4', fg:'#a44866'},
  {bg:'#e8f7ef', fg:'#337a58'},
  {bg:'#f3ecff', fg:'#684fa8'},
  {bg:'#fff2dd', fg:'#8a5a16'},
  {bg:'#e8f5f7', fg:'#356d77'},
  {bg:'#eef1f5', fg:'#53607e'},
]

function initials(name:string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0,2)
    .map(w=>w[0]?.toUpperCase())
    .join('')
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map((cat, i) => {
        const cover = covers[i % covers.length]
        return (
          <Link key={cat.slug} href={`/grupos/${cat.slug}`}
            className="group overflow-hidden bg-white border border-[#e6eaf2] rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(39,56,95,.08)]">
            <div className="h-20 relative overflow-hidden" style={{background:cover.bg}}>
              <div className="absolute -right-3 -top-5 w-20 h-20 rounded-full border-[12px] border-white/40" />
              <div className="absolute right-10 bottom-[-28px] w-16 h-16 rotate-12 rounded-2xl bg-white/25" />
              <div className="absolute left-4 bottom-3 font-syne font-extrabold text-[22px] tracking-[-1px]" style={{color:cover.fg}}>
                {initials(cat.name)}
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="min-w-0">
                <span className="block text-[14px] font-bold text-[#11182d] truncate">{cat.name}</span>
                <span className="text-[11px] text-[#7f89a3]">{cat.count} grupos</span>
              </div>
              <span className="ml-auto text-[#95a0b8] group-hover:text-[#1769ff]">›</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
