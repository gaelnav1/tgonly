type Props = {
  slug: string
  size?: 'sm' | 'md' | 'lg'
}

const styles: Record<string, {bg:string; fg:string; icon:string}> = {
  cripto: { bg:'#FFF0B8', fg:'#F59E0B', icon:'bitcoin' },
  gaming: { bg:'#EEE8FF', fg:'#6D4AFF', icon:'gamepad' },
  tech: { bg:'#E9F2FF', fg:'#1769FF', icon:'laptop' },
  noticias: { bg:'#FFE8EE', fg:'#F43F5E', icon:'news' },
  marketplace: { bg:'#E7F7EE', fg:'#16A34A', icon:'bag' },
  trabajos: { bg:'#EAF0FF', fg:'#2563EB', icon:'briefcase' },
  'trabajos-latam': { bg:'#EAF0FF', fg:'#2563EB', icon:'briefcase' },
  trabajadores: { bg:'#EAF0FF', fg:'#2563EB', icon:'briefcase' },
  fans: { bg:'#FFF0F4', fg:'#EC4899', icon:'heart' },
  salud: { bg:'#E8F7EF', fg:'#16A34A', icon:'leaf' },
  deportes: { bg:'#F3ECFF', fg:'#7C3AED', icon:'trophy' },
  negocios: { bg:'#FFF2DD', fg:'#F59E0B', icon:'bars' },
  entretenimiento: { bg:'#EEE8FF', fg:'#7C3AED', icon:'play' },
  'arte-y-cultura': { bg:'#E8F7EF', fg:'#16A34A', icon:'palette' },
  arte: { bg:'#E8F7EF', fg:'#16A34A', icon:'palette' },
  apuestas: { bg:'#FFF2DD', fg:'#D97706', icon:'dice' },
  gallos: { bg:'#FFE8EE', fg:'#DC2626', icon:'star' },
  otros: { bg:'#EEF1F5', fg:'#64748B', icon:'dots' },
  default: { bg:'#EDF4FF', fg:'#1769FF', icon:'grid' },
}

function Icon({name}:{name:string}) {
  const common = { width:24, height:24, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:2, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }
  switch(name) {
    case 'bitcoin':
      return <svg {...common}><path d="M8 6h6a3 3 0 0 1 0 6H8z"/><path d="M8 12h7a3 3 0 0 1 0 6H8z"/><path d="M10 4v16M14 4v2M14 18v2"/></svg>
    case 'gamepad':
      return <svg {...common}><path d="M8 8h8a5 5 0 0 1 4.7 6.7l-1 2.8a2 2 0 0 1-3.5.5L14.8 16H9.2L7.8 18a2 2 0 0 1-3.5-.5l-1-2.8A5 5 0 0 1 8 8z"/><path d="M7 12h3M8.5 10.5v3M16 12h.01M18 14h.01"/></svg>
    case 'laptop':
      return <svg {...common}><rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 18h18"/></svg>
    case 'news':
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
    case 'bag':
      return <svg {...common}><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
    case 'briefcase':
      return <svg {...common}><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V5h6v2M3 12h18M10 12v2h4v-2"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>
    case 'leaf':
      return <svg {...common}><path d="M20 4c-8 0-14 4-14 10a6 6 0 0 0 6 6c6 0 8-8 8-16z"/><path d="M5 19c4-5 8-8 14-11"/></svg>
    case 'trophy':
      return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M6 5H4v2a4 4 0 0 0 4 4M18 5h2v2a4 4 0 0 1-4 4M12 12v5M9 20h6M10 17h4"/></svg>
    case 'bars':
      return <svg {...common}><path d="M5 19V10M12 19V5M19 19V8"/></svg>
    case 'play':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/></svg>
    case 'palette':
      return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0-3-10z"/><path d="M7.5 9h.01M9 6h.01M14 6h.01M17 9h.01"/></svg>
    case 'dice':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/></svg>
    case 'star':
      return <svg {...common}><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3z"/></svg>
    case 'dots':
      return <svg {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
    default:
      return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
  }
}

export default function CategoryIcon({ slug, size='md' }: Props) {
  const s = styles[slug] || styles.default
  const dims = size==='sm' ? 'w-10 h-10 rounded-xl' : size==='lg' ? 'w-16 h-16 rounded-2xl' : 'w-12 h-12 rounded-2xl'

  return (
    <span
      className={`${dims} relative flex flex-none items-center justify-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_5px_12px_rgba(39,56,95,.08)]`}
      style={{background:s.bg,color:s.fg}}
      aria-hidden="true"
    >
      <span className="absolute inset-x-1 top-1 h-[34%] rounded-full bg-white/30 blur-[1px]" />
      <span className="relative z-10"><Icon name={s.icon}/></span>
    </span>
  )
}
