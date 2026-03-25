'use client'

import { Group } from '@/data/groups'

const colorMap: Record<Group['color'], string> = {
  teal:   'bg-teal-500/10',
  blue:   'bg-blue-500/10',
  amber:  'bg-amber-500/10',
  red:    'bg-red-500/10',
  purple: 'bg-purple-500/10',
}

export default function GroupCard({ group }: { group: Group }) {
  return (
    <div className="group-card relative bg-[#111118] border border-white/[0.07] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#2AABEE]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] cursor-pointer overflow-hidden">

      {group.trending && (
        <span className="absolute top-3.5 right-3.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded px-2 py-0.5">
          🔥 Trending
        </span>
      )}

      {/* Top row */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className={`w-13 h-13 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 ${colorMap[group.color]}`}
             style={{ width: 52, height: 52 }}>
          {group.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-syne font-bold text-[15px] truncate text-[#f0eff8] mb-1">
            {group.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#8888aa]">
            {group.verified && (
              <span className="w-3.5 h-3.5 bg-[#2AABEE] rounded-full flex items-center justify-center text-[8px] font-bold text-black flex-shrink-0">
                ✓
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="text-[#3dd68c] font-semibold font-syne">{group.members}</span>
              {' '}miembros
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-[#8888aa] leading-relaxed mb-4 line-clamp-2">
        {group.desc}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {group.tags.map((t) => (
            <span key={t} className="text-[11px] text-[#8888aa] font-medium bg-[#1c1c27] border border-white/[0.07] rounded-md px-2.5 py-0.5">
              #{t}
            </span>
          ))}
        </div>
        <a
          href={group.link}
          className="flex-shrink-0 bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg transition-all hover:bg-[#1a8fd1] hover:scale-[1.03]"
        >
          Unirme →
        </a>
      </div>
    </div>
  )
}
