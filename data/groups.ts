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
  score?: number
}

export const categories: Category[] = [
  { emoji: '💰', name: 'Cripto',          count: '2,341', slug: 'cripto' },
  { emoji: '💻', name: 'Tech',            count: '1,890', slug: 'tech' },
  { emoji: '🎮', name: 'Gaming',          count: '1,540', slug: 'gaming' },
  { emoji: '📰', name: 'Noticias',        count: '980',   slug: 'noticias' },
  { emoji: '🎓', name: 'Educacion',       count: '1,120', slug: 'educacion' },
  { emoji: '🎵', name: 'Musica',          count: '760',   slug: 'musica' },
  { emoji: '⚽', name: 'Deportes',        count: '1,200', slug: 'deportes' },
  { emoji: '🍿', name: 'Entretenimiento', count: '840',   slug: 'entretenimiento' },
  { emoji: '🌎', name: 'LATAM',           count: '630',   slug: 'latam' },
  { emoji: '💼', name: 'Negocios',        count: '590',   slug: 'negocios' },
  { emoji: '🔬', name: 'Ciencia',         count: '420',   slug: 'ciencia' },
  { emoji: '🎨', name: 'Arte y Diseno',   count: '380',   slug: 'arte' },
]

export const groups: Group[] = [
  // CRIPTO
  {
    emoji: '₿', color: 'amber', name: 'Bitcoin Mexico Traders', members: '45,231', verified: true,
    desc: 'Senales de trading, analisis tecnico y noticias del mercado crypto en tiempo real. Comunidad activa 24/7.',
    tags: ['cripto', 'trading', 'bitcoin'], trending: true, category: 'cripto', link: '#', score: 98,
  },
  {
    emoji: '🚀', color: 'amber', name: 'Altcoins y DeFi Signals', members: '34,100', verified: true,
    desc: 'Senales gratuitas de altcoins, oportunidades DeFi y analisis on-chain para hispanohablantes.',
    tags: ['cripto', 'defi', 'altcoins'], trending: true, category: 'cripto', link: '#', score: 94,
  },
  {
    emoji: '📈', color: 'teal', name: 'Ethereum Hispano', members: '28,450', verified: true,
    desc: 'Comunidad hispanohablante dedicada a Ethereum, smart contracts, NFTs y el ecosistema Web3.',
    tags: ['cripto', 'ethereum', 'web3'], trending: false, category: 'cripto', link: '#', score: 88,
  },
  {
    emoji: '💎', color: 'blue', name: 'Crypto Senales LATAM', members: '52,800', verified: true,
    desc: 'Las mejores senales de trading de criptomonedas para el mercado latinoamericano. Analisis tecnico diario.',
    tags: ['cripto', 'senales', 'trading'], trending: true, category: 'cripto', link: '#', score: 96,
  },
  {
    emoji: '🏦', color: 'purple', name: 'DeFi en Espanol', members: '19,300', verified: true,
    desc: 'Todo sobre finanzas descentralizadas en espanol. Yield farming, liquidity pools y protocolos DeFi.',
    tags: ['cripto', 'defi', 'finanzas'], trending: false, category: 'cripto', link: '#', score: 82,
  },
  {
    emoji: '⚡', color: 'amber', name: 'Bitcoin Lightning Network MX', members: '11,200', verified: false,
    desc: 'Grupo especializado en Lightning Network y pagos con Bitcoin. Tutoriales, nodos y casos de uso reales.',
    tags: ['cripto', 'bitcoin', 'lightning'], trending: false, category: 'cripto', link: '#', score: 74,
  },
  {
    emoji: '🌐', color: 'teal', name: 'Web3 Developers Hispanos', members: '15,670', verified: true,
    desc: 'Desarrolladores blockchain de habla hispana. Solidity, Rust, contratos inteligentes y dApps.',
    tags: ['cripto', 'web3', 'desarrollo'], trending: false, category: 'cripto', link: '#', score: 79,
  },
  {
    emoji: '📊', color: 'blue', name: 'Analisis Crypto Diario', members: '22,100', verified: true,
    desc: 'Analisis tecnico y fundamental de las principales criptomonedas cada dia. Bitcoin, ETH, BNB y mas.',
    tags: ['cripto', 'analisis', 'trading'], trending: true, category: 'cripto', link: '#', score: 91,
  },
  {
    emoji: '🦊', color: 'amber', name: 'MetaMask y Wallets Hispano', members: '8,900', verified: false,
    desc: 'Soporte y tutoriales sobre wallets cripto. MetaMask, Ledger, Trust Wallet y seguridad Web3.',
    tags: ['cripto', 'wallets', 'seguridad'], trending: false, category: 'cripto', link: '#', score: 68,
  },
  {
    emoji: '🐂', color: 'teal', name: 'Bull Run LATAM', members: '31,500', verified: true,
    desc: 'Comunidad optimista sobre el mercado cripto. Noticias, analisis y estrategias para el largo plazo.',
    tags: ['cripto', 'inversion', 'latam'], trending: true, category: 'cripto', link: '#', score: 87,
  },
  // TECH
  {
    emoji: '🤖', color: 'blue', name: 'Dev Hispano — IA y ML', members: '28,900', verified: true,
    desc: 'Desarrolladores de toda LATAM compartiendo recursos sobre inteligencia artificial, machine learning y LLMs.',
    tags: ['tech', 'ia', 'programacion'], trending: true, category: 'tech', link: '#',
  },
  // GAMING
  {
    emoji: '🎮', color: 'purple', name: 'Free Fire LATAM Oficial', members: '120,440', verified: true,
    desc: 'El grupo mas grande de Free Fire en espanol. Torneos, clanes, tips y memes del juego.',
    tags: ['gaming', 'freefire', 'torneos'], trending: false, category: 'gaming', link: '#',
  },
  // NOTICIAS
  {
    emoji: '📊', color: 'teal', name: 'Economia MX — Analisis', members: '18,750', verified: false,
    desc: 'Analisis semanal de la economia mexicana, tipo de cambio, mercados y noticias financieras.',
    tags: ['noticias', 'economia', 'mexico'], trending: false, category: 'noticias', link: '#',
  },
  // EDUCACION
  {
    emoji: '📚', color: 'teal', name: 'Aprende a Programar', members: '22,300', verified: true,
    desc: 'Recursos gratuitos, tutoriales y mentoria para personas aprendiendo desarrollo web y movil desde cero.',
    tags: ['educacion', 'programacion', 'gratis'], trending: false, category: 'educacion', link: '#',
  },
]
