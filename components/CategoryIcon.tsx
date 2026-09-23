type Props = {
  slug: string
  size?: 'sm' | 'md' | 'lg'
}

const styles: Record<string, {bg:string; fg:string; glyph:string}> = {
  cripto: { bg:'#FFF0B8', fg:'#F59E0B', glyph:'₿' },
  gaming: { bg:'#EEE8FF', fg:'#6D4AFF', glyph:'🎮' },
  tech: { bg:'#E9F2FF', fg:'#1769FF', glyph:'💻' },
  noticias: { bg:'#FFE8EE', fg:'#F43F5E', glyph:'📰' },
  marketplace: { bg:'#E7F7EE', fg:'#16A34A', glyph:'🛍️' },
  trabajos: { bg:'#EAF0FF', fg:'#2563EB', glyph:'💼' },
  'trabajos-latam': { bg:'#EAF0FF', fg:'#2563EB', glyph:'💼' },
  trabajadores: { bg:'#EAF0FF', fg:'#2563EB', glyph:'💼' },
  fans: { bg:'#FFF0F4', fg:'#EC4899', glyph:'♥' },
  salud: { bg:'#E8F7EF', fg:'#16A34A', glyph:'🌿' },
  deportes: { bg:'#F3ECFF', fg:'#7C3AED', glyph:'🏆' },
  negocios: { bg:'#FFF2DD', fg:'#F59E0B', glyph:'▥' },
  entretenimiento: { bg:'#EEE8FF', fg:'#7C3AED', glyph:'▶' },
  'arte-y-cultura': { bg:'#E8F7EF', fg:'#16A34A', glyph:'🎨' },
  arte: { bg:'#E8F7EF', fg:'#16A34A', glyph:'🎨' },
  apuestas: { bg:'#FFF2DD', fg:'#D97706', glyph:'♦' },
  gallos: { bg:'#FFE8EE', fg:'#DC2626', glyph:'★' },
  otros: { bg:'#EEF1F5', fg:'#64748B', glyph:'•••' },
  default: { bg:'#EDF4FF', fg:'#1769FF', glyph:'●' },
}

export default function CategoryIcon({ slug, size='md' }: Props) {
  const s = styles[slug] || styles.default
  const dims = size==='sm' ? 'w-10 h-10 text-[18px] rounded-xl' : size==='lg' ? 'w-16 h-16 text-[30px] rounded-2xl' : 'w-12 h-12 text-[22px] rounded-2xl'

  return (
    <span
      className={`${dims} relative flex flex-none items-center justify-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_4px_10px_rgba(39,56,95,.08)]`}
      style={{background:s.bg,color:s.fg}}
      aria-hidden="true"
    >
      <span className="absolute inset-x-1 top-1 h-[38%] rounded-full bg-white/35 blur-[1px]" />
      <span className="relative z-10 font-syne font-extrabold leading-none">{s.glyph}</span>
    </span>
  )
}
