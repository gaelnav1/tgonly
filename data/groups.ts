export type Category = {
  emoji: string
  name: string
  count: string
  slug: string
}

export type Group = {
  emoji: string
  color: 'teal' | 'blue' | 'amber' | 'red' | 'purple'
  name: string
  members: string
  verified: boolean
  desc: string
  tags: string[]
  trending: boolean
  category: string
  link: string
}

export const categories: Category[] = [
  { emoji: '💰', name: 'Cripto',          count: '2,341', slug: 'cripto' },
  { emoji: '💻', name: 'Tech',            count: '1,890', slug: 'tech' },
  { emoji: '🎮', name: 'Gaming',          count: '1,540', slug: 'gaming' },
  { emoji: '📰', name: 'Noticias',        count: '980',   slug: 'noticias' },
  { emoji: '🎓', name: 'Educación',       count: '1,120', slug: 'educacion' },
  { emoji: '🎵', name: 'Música',          count: '760',   slug: 'musica' },
  { emoji: '⚽', name: 'Deportes',        count: '1,200', slug: 'deportes' },
  { emoji: '🍿', name: 'Entretenimiento', count: '840',   slug: 'entretenimiento' },
  { emoji: '🌎', name: 'LATAM',           count: '630',   slug: 'latam' },
  { emoji: '💼', name: 'Negocios',        count: '590',   slug: 'negocios' },
  { emoji: '🔬', name: 'Ciencia',         count: '420',   slug: 'ciencia' },
  { emoji: '🎨', name: 'Arte & Diseño',   count: '380',   slug: 'arte' },
]

export const groups: Group[] = [
  {
    emoji: '₿',
    color: 'amber',
    name: 'Bitcoin México Traders',
    members: '45,231',
    verified: true,
    desc: 'Señales de trading, análisis técnico y noticias del mercado crypto en tiempo real. Comunidad activa 24/7.',
    tags: ['cripto', 'trading', 'bitcoin'],
    trending: true,
    category: 'cripto',
    link: '#',
  },
  {
    emoji: '🤖',
    color: 'blue',
    name: 'Dev Hispano — IA & ML',
    members: '28,900',
    verified: true,
    desc: 'Desarrolladores de toda LATAM compartiendo recursos sobre inteligencia artificial, machine learning y LLMs.',
    tags: ['tech', 'ia', 'programación'],
    trending: true,
    category: 'tech',
    link: '#',
  },
  {
    emoji: '🎮',
    color: 'purple',
    name: 'Free Fire LATAM Oficial',
    members: '120,440',
    verified: true,
    desc: 'El grupo más grande de Free Fire en español. Torneos, clanes, tips y memes del juego.',
    tags: ['gaming', 'freefire', 'torneos'],
    trending: false,
    category: 'gaming',
    link: '#',
  },
  {
    emoji: '📊',
    color: 'teal',
    name: 'Economía MX — Análisis',
    members: '18,750',
    verified: false,
    desc: 'Análisis semanal de la economía mexicana, tipo de cambio, mercados y noticias financieras.',
    tags: ['noticias', 'economia', 'mexico'],
    trending: false,
    category: 'noticias',
    link: '#',
  },
  {
    emoji: '🚀',
    color: 'amber',
    name: 'Altcoins & DeFi Signals',
    members: '34,100',
    verified: true,
    desc: 'Señales gratuitas de altcoins, oportunidades DeFi y análisis on-chain para hispanohablantes.',
    tags: ['cripto', 'defi', 'altcoins'],
    trending: true,
    category: 'cripto',
    link: '#',
  },
  {
    emoji: '📚',
    color: 'teal',
    name: 'Aprende a Programar',
    members: '22,300',
    verified: true,
    desc: 'Recursos gratuitos, tutoriales y mentoría para personas aprendiendo desarrollo web y móvil desde cero.',
    tags: ['educacion', 'programación', 'gratis'],
    trending: false,
    category: 'educacion',
    link: '#',
  },
]
