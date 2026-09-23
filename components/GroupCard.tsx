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
  const idParam = group.id ? `&id=${group.id}` : ''
  const linkParam = group.link && group.link !== '#' ? `&link=${encodeURIComponent(group.link)}` : ''
  if (group.photo_url) return `/api/photo?url=${encodeURIComponent(group.photo_url)}${idParam}${linkParam}`
  if (group.username) return `/api/photo?username=${group.username}${idParam}${linkParam}`
  if (group.link && group.link !== '#') return `/api/photo?link=${encodeURIComponent(group.link)}${idParam}`
  return null
}
export default function GroupCard({ group }: { group: Group }) {
  const groupUrl = `/grupos/${group.category}/${slugify(group.name)}`
  const photoSrc = getPhotoSrc(group)
  return (
    <div className="relative bg-white border border-[#e6eaf2] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(39,56,95,.09)] overflow-hidden">
      {group.trending && <span className="absolute top-3.5 right-3.5 text-[10px] font-bold text-[#a46600] bg-[#fff4cf] rounded-full px-2.5 py-1">🔥 Trending</span>}
      <Link href={groupUrl} className="block no-underline text-inherit">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative flex-shrink-0" style={{width:52,height:52}}>
            <div className="absolute inset-0 rounded-[14px] bg-[#edf4ff] flex items-center justify-center text-2xl">{group.emoji}</div>
            {photoSrc && <img src={photoSrc} alt={group.name} width={52} height={52} className="absolute inset-0 rounded-[14px] object-cover w-full h-full" style={{zIndex:1}} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-syne font-bold text-[15px] truncate text-[#11182d] mb-1">{group.name}</p>
            <div className="flex items-center gap-2 text-xs text-[#7b86a1]">
              {group.verified && <span className="w-4 h-4 bg-[#1769ff] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">✓</span>}
              <span><span className="text-[#1769ff] font-semibold">{group.members}</span> miembros</span>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-[#66718d] leading-relaxed mb-4 line-clamp-2">{group.desc}</p>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {group.tags.slice(0,3).map(t=><span key={t} className="text-[11px] text-[#53607e] font-medium bg-[#f3f6fb] rounded-full px-2.5 py-1">#{t}</span>)}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3">
        <Link href={groupUrl} className="text-[12px] font-semibold text-[#53607e] hover:text-[#1769ff]">Ver detalles →</Link>
        <a href={group.link} target="_blank" rel="noopener noreferrer" className="tg-primary flex-shrink-0 font-bold text-[13px] px-4 py-2.5">
          Unirse →
        </a>
      </div>
    </div>
  )
}
