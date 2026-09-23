import Link from 'next/link'

type Category = { emoji: string; name: string; count: string; slug: string }
type Group = {
  name: string
  category: string
  members: string
  trending?: boolean
  photo_url?: string | null
  username?: string | null
  link?: string
}

function photoSrc(group: Group): string | null {
  if (group.photo_url) return `/api/photo?url=${encodeURIComponent(group.photo_url)}`
  if (group.username) return `/api/photo?username=${encodeURIComponent(group.username)}`
  if (group.link && group.link !== '#') return `/api/photo?link=${encodeURIComponent(group.link)}`
  return null
}

const accents = [
  ['#fff6d8','#8a6900'],
  ['#efeaff','#604aab'],
  ['#eaf3ff','#2d63a4'],
  ['#ffecef','#a5425c'],
  ['#e9f8ef','#2e7b54'],
  ['#eef3ff','#365da6'],
  ['#fff0f5','#a24a68'],
  ['#e9f7ef','#3c7d5a'],
]

export default function CategoryGrid({ categories, groups = [] }: { categories: Category[]; groups?: Group[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat, i) => {
        const preview = groups
          .filter(g => g.category === cat.slug)
          .sort((a,b) => Number(Boolean(b.trending)) - Number(Boolean(a.trending)))
          .slice(0,3)

        const [soft, ink] = accents[i % accents.length]

        return (
          <Link
            key={cat.slug}
            href={`/grupos/${cat.slug}`}
            className="group bg-white border border-[#e6eaf2] rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(39,56,95,.10)]"
          >
            <div className="p-5 border-b border-[#edf0f5]" style={{background:soft}}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-syne font-extrabold text-[22px] leading-tight" style={{color:ink}}>{cat.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#77829b]">{cat.count} comunidades</p>
                </div>

                <div className="flex -space-x-2">
                  {preview.length > 0 ? preview.map((g, idx) => {
                    const src = photoSrc(g)
                    return (
                      <div key={g.name} className="relative w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden" style={{zIndex:3-idx}}>
                        {src ? (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] font-extrabold" style={{color:ink,background:'rgba(255,255,255,.55)'}}>
                            {g.name.slice(0,2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white/60 flex items-center justify-center text-[11px] font-extrabold" style={{color:ink}}>
                      {cat.name.slice(0,2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5">
              {preview.length > 0 ? (
                <div className="space-y-3">
                  {preview.map((g, idx) => (
                    <div key={g.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#f3f6fb] flex items-center justify-center text-[11px] font-extrabold text-[#53607e]">{idx+1}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#182036]">{g.name}</p>
                        <p className="text-[11px] text-[#8a94ac]">{g.members} miembros</p>
                      </div>
                      {g.trending && <span className="text-[10px] font-bold text-[#a66a00] bg-[#fff4cf] px-2 py-1 rounded-full">Trending</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-sm text-[#8a94ac]">Explora las comunidades disponibles en esta categoría.</div>
              )}

              <div className="mt-5 pt-4 border-t border-[#edf0f5] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7d879d]">Ver comunidades</span>
                <span className="w-8 h-8 rounded-full bg-[#f3f6fb] flex items-center justify-center text-[#1769ff] transition group-hover:bg-[#1769ff] group-hover:text-white">→</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
