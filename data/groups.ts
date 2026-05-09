// Categorias y grupos de TGOnly

export type Category = { emoji: string; name: string; count: string; slug: string }
export type Group = { emoji: string; color: string; name: string; members: string; verified: boolean; desc: string; tags: string[]; trending: boolean; category: string; link: string; score?: number }

export const categories: Category[] = [
  { emoji: '💰', name: 'Cripto',                       count: '10',  slug: 'cripto' },
  { emoji: '🎮', name: 'Gaming',                       count: '20',  slug: 'gaming' },
  { emoji: '🎲', name: 'Apuestas',                     count: '10',  slug: 'apuestas' },
  { emoji: '🎬', name: 'Entretenimiento',               count: '20',  slug: 'entretenimiento' },
  { emoji: '💻', name: 'Tech',                         count: '20',  slug: 'tech' },
  { emoji: '💪', name: 'Salud',                        count: '20',  slug: 'salud' },
  { emoji: '💼', name: 'Negocios',                     count: '20',  slug: 'negocios' },
  { emoji: '⚽', name: 'Deportes',                     count: '20',  slug: 'deportes' },
  { emoji: '📰', name: 'Noticias',                     count: '20',  slug: 'noticias' },
  { emoji: '🌟', name: 'Fans',                         count: '97',  slug: 'fans' },
  { emoji: '🐓', name: 'Gallos',                       count: '2',   slug: 'gallos' },
  { emoji: '🛒', name: 'Marketplace',                  count: '20',  slug: 'marketplace' },
  { emoji: '🌎', name: 'Trabajos LATAM',               count: '20',  slug: 'trabajos-latam' },
  { emoji: '🎖️', name: 'Grupos Militares en México',   count: '1',   slug: 'grupos-militares-en-mexico' },
]

export const groups: Group[] = [
  { emoji:'💰', color:'teal',   name:'Bitcoin Mexico Traders',       members:'45,231', verified:true,  desc:'Senales de trading, analisis tecnico y noticias del mercado crypto en espanol.',    tags:['cripto','trading','bitcoin'],    trending:true,  category:'cripto',          link:'#', score:98 },
  { emoji:'🚀', color:'blue',   name:'Altcoins y DeFi Signals',      members:'34,100', verified:true,  desc:'Senales gratuitas de altcoins, DeFi y nuevos proyectos con potencial.',            tags:['cripto','defi','altcoins'],      trending:true,  category:'cripto',          link:'#', score:94 },
  { emoji:'📈', color:'teal',   name:'Ethereum Hispano',             members:'28,450', verified:true,  desc:'Comunidad dedicada a Ethereum, NFTs y el ecosistema Web3.',                        tags:['cripto','ethereum','web3'],      trending:false, category:'cripto',          link:'#', score:88 },
  { emoji:'🔥', color:'amber',  name:'Free Fire LATAM Oficial',      members:'120,440',verified:true,  desc:'El grupo mas grande de Free Fire en espanol. Torneos, clanes, tips y memes.',      tags:['gaming','freefire','torneos'],   trending:true,  category:'gaming',          link:'https://t.me/freefirelatamofc', score:99 },
  { emoji:'🎮', color:'purple', name:'Fortnite Espanol',             members:'89,200', verified:true,  desc:'Encuentra compañeros, torneos y las ultimas noticias de Fortnite.',                 tags:['gaming','fortnite','battle'],    trending:true,  category:'gaming',          link:'#', score:96 },
  { emoji:'📺', color:'blue',   name:'Netflix Hispano',              members:'92,400', verified:true,  desc:'La comunidad mas grande de Netflix en espanol. Recomendaciones y debates.',         tags:['entretenimiento','netflix','series'],trending:true,category:'entretenimiento',link:'#', score:97 },
  { emoji:'🤖', color:'teal',   name:'ChatGPT y LLMs Hispano',       members:'54,100', verified:true,  desc:'Todo sobre ChatGPT, Claude, Gemini y los mejores modelos de IA.',                  tags:['tech','ia','chatgpt'],           trending:true,  category:'tech',            link:'#', score:99 },
  { emoji:'🌍', color:'blue',   name:'Noticias LATAM en Vivo',       members:'85,460', verified:true,  desc:'Las noticias mas importantes de toda America Latina en tiempo real.',               tags:['noticias','latam','internacional'],trending:true,category:'noticias',        link:'#', score:99 },
  { emoji:'⚽', color:'teal',   name:'Futbol LATAM',                 members:'203,400',verified:true,  desc:'Resultados, analisis y debate del futbol latinoamericano.',                        tags:['deportes','futbol','latam'],     trending:true,  category:'deportes',        link:'#', score:99 },
  { emoji:'📱', color:'blue',   name:'Famosas Mexas',                members:'1,333',  verified:false, desc:'Buen grupo',                                                                       tags:['onlyfans'],                     trending:false, category:'fans',            link:'https://t.me/+VS3Pee3ckVFkZWUx', score:50 },
]
