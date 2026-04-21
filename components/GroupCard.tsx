import { Group } from '@/data/groups'

const avatarBg: Record<string, string> = {
  teal:'rgba(61,214,140,0.12)',blue:'rgba(42,171,238,0.12)',
  amber:'rgba(245,166,35,0.12)',red:'rgba(255,95,109,0.12)',purple:'rgba(155,89,182,0.12)',
}

export default function GroupCard({ group }: { group: Group }) {
  return (
    <div className="tg-group-card">
      {group.trending && <span className="tg-trending-badge">🔥 Trending</span>}
      <div className="tg-card-top">
        <div className="tg-avatar" style={{background: avatarBg[group.color] || avatarBg.blue}}>{group.emoji}</div>
        <div className="tg-card-info">
          <div className="tg-card-name">{group.name}</div>
          <div className="tg-card-meta">
            {group.verified && <span className="tg-verified">✓</span>}
            <span><span className="tg-members">{group.members}</span> miembros</span>
          </div>
        </div>
      </div>
      <p className="tg-card-desc">{group.desc}</p>
      <div className="tg-card-footer">
        <div className="tg-tags">{group.tags.map(t => <span key={t} className="tg-tag">#{t}</span>)}</div>
        <a href={group.link} className="tg-join-btn">Unirme →</a>
      </div>
    </div>
  )
}
