import Link from 'next/link'
type Group = {
  emoji: string; color: string; name: string; members: string
  verified: boolean; desc: string; tags: string[]; trending: boolean
  category: string; link: string; score?: number
  photo_url?: string | null; username?: string | null; id?: string
}
function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}
function getPhotoSrc(group: Group): string | null {
  if (!group.id) return null
  return `/api/photo?id=${group.id}`
}
export default function GroupCard({ group }: { group: Group }) {
  const groupUrl = `/grupos/${group.category}/${slugify(group.name)}`
  const photoSrc = getPhotoSrc(group)
  return (
    <div className="relative bg-[#111118] border border-white/[0.07] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#2AABEE]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden">
      {group.trending && <span className="absolute top-3.5 right-3.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded px-2 py-0.5">🔥 Trending</span>}
      <Link href={groupUrl} className="block no-underline text-inherit">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative flex-shrink-0" style={{width:52,height:52}}>
            <div className="absolute inset-0 rounded-[14px] bg-blue-500/10 flex items-center justify-center text-2xl">{group.emoji}</div>
            {photoSrc && <img src={photoSrc} alt={group.name} width={52} height={52} className="absolute inset-0 rounded-[14px] object-cover w-full h-full" style={{zIndex:1}} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-syne font-bold text-[15px] truncate text-[#f0eff8] mb-1">{group.name}</p>
            <div className="flex items-center gap-2 text-xs text-[#8888aa]">
              {group.verified && <span className="w-3.5 h-3.5 bg-[#2AABEE] rounded-full flex items-center justify-center text-[8px] font-bold text-black flex-shrink-0">✓</span>}
              <span><span className="text-[#3dd68c] font-semibold font-syne">{group.members}</span> miembros</span>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-[#8888aa] leading-relaxed mb-4 line-clamp-2">{group.desc}</p>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {group.tags.map(t=><span key={t} className="text-[11px] text-[#8888aa] font-medium bg-[#1c1c27] border border-white/[0.07] rounded-md px-2.5 py-0.5">#{t}</span>)}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3">
        <Link href={groupUrl} className="text-[12px] text-[#8888aa] hover:text-[#2AABEE] transition-colors">Ver detalles →</Link>
        <a href={group.link} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 bg-[#2AABEE] text-black font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all hover:bg-[#1a8fd1] hover:scale-[1.05] shadow-[0_0_12px_rgba(42,171,238,0.35)] flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.94z"/></svg>
          Unirme gratis
        </a>
      </div>
    </div>
  )
}
