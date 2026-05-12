import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function GET(req: NextRequest) {
  const url      = req.nextUrl.searchParams.get('url')
  const username = req.nextUrl.searchParams.get('username')
  const groupId  = req.nextUrl.searchParams.get('id')
  const link     = req.nextUrl.searchParams.get('link')

  // Caso 1: tiene URL directa — intentar fetch
  if (url) {
    try {
      let fetchUrl = decodeURIComponent(url)
      // Reconstruir URLs de Telegram con bot token actual
      const match = fetchUrl.match(/\/file\/bot[^/]+\/(.+)$/)
      if (match) fetchUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${match[1]}`

      const res = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const ct = res.headers.get('content-type') || 'image/jpeg'
        if (ct.startsWith('image/') || ct.includes('jpeg') || ct.includes('png') || ct.includes('webp')) {
          return new NextResponse(await res.arrayBuffer(), {
            headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' }
          })
        }
      }
    } catch {}

    // URL falló — intentar obtener del bot si tenemos link
    if (link && link !== '#') {
      const scraped = await scrapeLink(link, groupId)
      if (scraped) return scraped
    }
  }

  // Caso 2: tiene username — pedir al bot
  if (username) {
    const result = await fetchFromBot(`@${username}`, groupId)
    if (result) return result
  }

  // Caso 3: tiene link — scraping del preview
  if (link && link !== '#') {
    const scraped = await scrapeLink(link, groupId)
    if (scraped) return scraped
  }

  return new NextResponse('Not found', { status: 404 })
}

async function fetchFromBot(chatId: string, groupId: string | null): Promise<NextResponse | null> {
  try {
    const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
    const chatData = await chatRes.json()
    if (!chatData.ok || !chatData.result.photo) return null

    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
    const fileData = await fileRes.json()
    if (!fileData.ok) return null

    const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`

    // Guardar URL actualizada en Supabase
    if (groupId) {
      fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoUrl })
      }).catch(() => {})
    }

    const imgRes = await fetch(photoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!imgRes.ok) return null
    return new NextResponse(await imgRes.arrayBuffer(), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
    })
  } catch { return null }
}

async function scrapeLink(link: string, groupId: string | null): Promise<NextResponse | null> {
  try {
    const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (!m?.[1]) return null

    const imgRes = await fetch(m[1], { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!imgRes.ok) return null
    return new NextResponse(await imgRes.arrayBuffer(), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
    })
  } catch { return null }
}
