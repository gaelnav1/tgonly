import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function GET(req: NextRequest) {
  const url      = req.nextUrl.searchParams.get('url')
  const username = req.nextUrl.searchParams.get('username')
  const groupId  = req.nextUrl.searchParams.get('id')

  if (url) {
    const decoded = decodeURIComponent(url)
    try {
      let fetchUrl = decoded

      // Si es URL de api.telegram.org — reconstruir con bot token actual
      const filePathMatch = decoded.match(/\/file\/bot[^/]+\/(.+)$/)
      if (filePathMatch) {
        fetchUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePathMatch[1]}`
      }

      // Intentar fetch directo (funciona para api.telegram.org, telesco.pe, cdn, etc)
      const res = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        const buffer = await res.arrayBuffer()
        const ct = res.headers.get('content-type') || 'image/jpeg'
        // Solo servir si es imagen
        if (ct.startsWith('image/') || ct.includes('jpeg') || ct.includes('png') || ct.includes('webp')) {
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': ct,
              'Cache-Control': 'public, max-age=86400', // 24 horas
            }
          })
        }
      }

      // Si fallo la URL guardada — intentar scraping del link del grupo
      if (groupId) {
        const link = req.nextUrl.searchParams.get('link')
        if (link && link !== '#') {
          const scraped = await fetchByScraing(link, groupId)
          if (scraped) return scraped
        }
      }
      if (groupId && username) {
        return await fetchFromBot(username, groupId)
      }
    } catch {}
  }

  // Sin URL — obtener del bot por username
  if (username) {
    return await fetchFromBot(username, groupId)
  }

  // Solo link — scraping directo
  const linkOnly = req.nextUrl.searchParams.get('link')
  if (linkOnly && linkOnly !== '#') {
    const scraped = await fetchByScraing(linkOnly, groupId)
    if (scraped) return scraped
  }

  return new NextResponse('Not found', { status: 404 })
}

async function fetchByScraing(link: string, groupId: string | null): Promise<NextResponse | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
  try {
    const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }, signal: AbortSignal.timeout(5000) })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (!m?.[1]) return null
    const photoUrl = m[1]
    // Guardar en Supabase
    if (groupId) {
      fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoUrl })
      }).catch(() => {})
    }
    const imgRes = await fetch(photoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (imgRes.ok) return new NextResponse(await imgRes.arrayBuffer(), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' } })
  } catch {}
  return null
}

async function fetchFromBot(username: string, groupId: string | null): Promise<NextResponse> {
  try {
    const chatId = username.startsWith('http') ? encodeURIComponent(username) : `@${username}`
    const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
    const chatData = await chatRes.json()

    if (chatData.ok && chatData.result.photo) {
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
      const fileData = await fileRes.json()

      if (fileData.ok) {
        const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`

        // Actualizar en Supabase para la próxima vez
        if (groupId) {
          fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo_url: photoUrl })
          }).catch(() => {})
        }

        const imgRes = await fetch(photoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (imgRes.ok) {
          return new NextResponse(await imgRes.arrayBuffer(), {
            headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }
          })
        }
      }
    }
  } catch {}

  return new NextResponse('Not found', { status: 404 })
}
