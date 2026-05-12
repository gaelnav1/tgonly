import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

function auth(req: NextRequest) {
  return req.headers.get('x-admin-password') === ADMIN_PASSWORD
}

function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')
}

function similarity(a: string, b: string): number {
  a = a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  b = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return Math.min(a.length,b.length)/Math.max(a.length,b.length)
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  let matches = 0
  for (let i = 0; i < shorter.length; i++) if (longer.includes(shorter[i])) matches++
  return matches / longer.length
}

// GET — obtener estadísticas de cobertura
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const action = req.nextUrl.searchParams.get('action') || 'stats'

  if (action === 'stats') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?category=eq.fans&select=id,name,link,photo_url,description,username&limit=500`, { headers: h })
    const groups = await res.json()
    if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error DB' }, { status: 500 })

    return NextResponse.json({
      total: groups.length,
      withLink: groups.filter((g:any) => g.link && g.link !== '#').length,
      withPhoto: groups.filter((g:any) => g.photo_url).length,
      withDesc: groups.filter((g:any) => g.description).length,
      noLink: groups.filter((g:any) => !g.link || g.link === '#').length,
      noPhoto: groups.filter((g:any) => !g.photo_url).length,
      noDesc: groups.filter((g:any) => !g.description).length,
      groups,
    })
  }

  if (action === 'dedup') {
    const threshold = parseFloat(req.nextUrl.searchParams.get('threshold') || '0.75')
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?category=eq.fans&select=id,name&limit=500`, { headers: h })
    const groups = await res.json()
    if (!Array.isArray(groups)) return NextResponse.json([])

    const pairs: any[] = []
    for (let i = 0; i < groups.length; i++) {
      for (let j = i+1; j < groups.length; j++) {
        const sim = similarity(groups[i].name, groups[j].name)
        if (sim >= threshold && sim < 1) {
          pairs.push({ a: groups[i], b: groups[j], similarity: Math.round(sim * 100) })
        }
      }
    }
    return NextResponse.json(pairs.sort((a,b) => b.similarity - a.similarity).slice(0, 50))
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}

// POST — acciones: scrape, import, delete-dup, generate-seo
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { action, ...body } = await req.json()

  // Scraping de fuentes públicas
  if (action === 'scrape') {
    const { country, keyword } = body
    const results: any[] = []
    const log: string[] = []

    // Fuente 1: Reddit LATAM
    try {
      const subreddits = ['onlyfanslatam', 'onlyfansmx', 'onlyfanscolombia', 'telegram']
      const query = keyword || (country === 'mexico' ? 'mexico mexicana' : country === 'colombia' ? 'colombia colombiana' : 'latina latam')
      const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query + ' onlyfans telegram')}&limit=25&sort=top&t=month`

      const res = await fetch(redditUrl, { headers: { 'User-Agent': 'TGOnly/1.0' } })
      const data = await res.json()

      if (data?.data?.children) {
        for (const post of data.data.children) {
          const title = post.data?.title || ''
          const text = post.data?.selftext || ''
          const content = title + ' ' + text

          // Extraer nombres con patrones
          const namePatterns = content.match(/(?:@|de )([\w\s]{4,30})(?:\s+onlyfans|\s+of|\s+telegram)/gi) || []
          const tgLinks = content.match(/t\.me\/[\w+]+/g) || []
          const ofLinks = content.match(/onlyfans\.com\/[\w]+/g) || []

          if (tgLinks.length > 0 || ofLinks.length > 0) {
            results.push({
              source: 'reddit',
              title: title.slice(0, 80),
              tgLinks, ofLinks,
              names: namePatterns.map((m:string) => m.replace(/^(@|de )/i,'').replace(/\s+(onlyfans|of|telegram)$/i,'').trim()),
            })
          }
        }
        log.push(`Reddit: ${results.length} posts con links`)
      }
    } catch(e) { log.push(`Reddit: bloqueado o sin resultados`) }

    // Fuente 2: Twitter/X búsqueda pública via nitter
    try {
      const query = `${keyword || (country === 'mexico' ? 'mexicana' : 'latina')} onlyfans telegram grupo`
      const nitterUrl = `https://nitter.net/search?q=${encodeURIComponent(query)}&f=tweets`
      const res = await fetch(nitterUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const html = await res.text()
      const tgMatches = html.match(/t\.me\/[\w+]{4,}/g) || []
      const nameMatches = html.match(/(?:@)([\w]{4,20})/g) || []

      if (tgMatches.length > 0) {
        results.push({ source: 'twitter', tgLinks: [...new Set(tgMatches)], names: nameMatches.slice(0,10), ofLinks: [] })
        log.push(`Twitter: ${tgMatches.length} links encontrados`)
      }
    } catch { log.push(`Twitter: sin acceso`) }

    // Fuente 3: Buscar en Telegram preview por keywords
    const searchTerms = keyword
      ? [keyword]
      : country === 'mexico'
      ? ['karely','yeri','kenia','virginia','lizbeth','yanet','cindy','jessica','gaby','nicholette','lugo','mafeer','madeleyn','dominik','lily','rashel','thaily','jacky','yami','ludivinita','mariana','marivic','beth','amalinali','datsy','patty','brenda','wendy','nath']
      : country === 'colombia'
      ? ['karina','karime','pamela','tania','epa','andrea','aida','segura','lina']
      : ['latina','onlyfans','fans','creadora']

    for (const term of searchTerms.slice(0, 15)) {
      try {
        const tgRes = await fetch(`https://t.me/s/${term}`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
        const html = await tgRes.text()
        const nameMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
        const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
        if (nameMatch) {
          results.push({
            source: 'telegram',
            name: nameMatch[1],
            description: descMatch?.[1] || '',
            photo_url: imgMatch?.[1] || null,
            tgLinks: [`https://t.me/${term}`],
            username: term,
            ofLinks: [],
          })
        }
      } catch {}
      await new Promise(r => setTimeout(r, 200))
    }
    log.push(`Telegram: ${results.filter((r:any)=>r.source==='telegram').length} perfiles encontrados`)

    return NextResponse.json({ results, log })
  }

  // Importar creadoras a Supabase
  if (action === 'import') {
    const { items } = body
    let imported = 0, skipped = 0

    for (const item of items) {
      if (!item.name) continue
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/groups?category=eq.fans&name=eq.${encodeURIComponent(item.name)}&select=id`, { headers: h })
      const existing = await checkRes.json()
      if (Array.isArray(existing) && existing.length > 0) { skipped++; continue }

      await fetch(`${SUPABASE_URL}/rest/v1/groups_pending`, {
        method: 'POST',
        headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          name: item.name,
          username: item.username || slugify(item.name),
          description: item.description || '',
          members: item.members || 0,
          photo_url: item.photo_url || null,
          link: item.link || '#',
          category: 'fans',
          tags: ['onlyfans', 'telegram'],
          submitter_name: 'Intel System',
          status: 'pendiente',
          emoji: '📱', color: 'blue', verified: false, trending: false, score: 50,
        })
      })
      imported++
    }

    return NextResponse.json({ ok: true, imported, skipped, message: `${imported} importadas, ${skipped} ya existían` })
  }

  // Eliminar duplicado
  if (action === 'delete') {
    const { id } = body
    await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
  }

  // Generar descripción SEO con Claude
  if (action === 'generate-seo') {
    const { name, country, members, bio } = body

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Genera descripción SEO de 80-120 palabras en español para grupo de Telegram de fans de ${name}, creadora de OnlyFans de ${country || 'LATAM'}. Miembros: ${members || 'desconocidos'}. Bio: ${bio || 'N/A'}. Incluye naturalmente: "grupo de Telegram", "OnlyFans", "${name}". Call to action al final. SOLO responde con: [DESC]texto[/DESC][TAGS]tag1,tag2,tag3,tag4,tag5[/TAGS]`
        }]
      })
    })
    const claudeData = await claudeRes.json()
    const text = claudeData.content?.[0]?.text || ''
    const desc = text.match(/\[DESC\]([\s\S]*?)\[\/DESC\]/)?.[1]?.trim() || text.slice(0, 200)
    const tags = text.match(/\[TAGS\]([\s\S]*?)\[\/TAGS\]/)?.[1]?.split(',').map((t:string) => t.trim()).filter(Boolean) || []

    // Guardar en Supabase si tiene ID
    if (body.groupId && desc) {
      await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${body.groupId}`, {
        method: 'PATCH', headers: h,
        body: JSON.stringify({ description: desc, tags })
      })
    }

    return NextResponse.json({ ok: true, description: desc, tags })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
