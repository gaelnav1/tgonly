import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('id')
  const link    = req.nextUrl.searchParams.get('link')

  // Obtener datos del grupo desde Supabase
  if (!groupId) return new NextResponse('Missing id', { status: 400 })

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}&select=name,link,username,photo_file_path`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    )
    const [group] = await res.json()
    if (!group) return new NextResponse('Not found', { status: 404 })

    // 1. Si tiene file_path guardado — reconstruir URL con bot token actual (nunca expira)
    if (group.photo_file_path) {
      const imgUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${group.photo_file_path}`
      const imgRes = await fetch(imgUrl)
      if (imgRes.ok) {
        return new NextResponse(await imgRes.arrayBuffer(), {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
        })
      }
    }

    // 2. Si tiene username — pedir file_path al bot y guardarlo
    const chatId = group.username ? `@${group.username}` 
                 : (group.link && group.link !== '#') ? encodeURIComponent(group.link) 
                 : null

    if (chatId) {
      const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
      const chatData = await chatRes.json()

      if (chatData.ok && chatData.result.photo) {
        const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
        const fileData = await fileRes.json()

        if (fileData.ok) {
          const filePath = fileData.result.file_path
          // Guardar solo el file_path — nunca expira
          fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_file_path: filePath, photo_url: null })
          }).catch(() => {})

          const imgRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`)
          if (imgRes.ok) {
            return new NextResponse(await imgRes.arrayBuffer(), {
              headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
            })
          }
        }
      }
    }

    // 3. Scraping del link de invitación como último recurso
    const groupLink = link || group.link
    if (groupLink && groupLink !== '#') {
      const pageRes = await fetch(groupLink, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
      const html = await pageRes.text()
      const m = html.match(/<meta property="og:image" content="([^"]+)"/)
      if (m?.[1]) {
        const imgRes = await fetch(m[1])
        if (imgRes.ok) {
          return new NextResponse(await imgRes.arrayBuffer(), {
            headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=600' }
          })
        }
      }
    }
  } catch {}

  return new NextResponse('Not found', { status: 404 })
}
