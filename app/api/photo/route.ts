import { NextRequest, NextResponse } from 'next/server'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  const username = req.nextUrl.searchParams.get('username')
  const groupId = req.nextUrl.searchParams.get('id')

  if (url) {
    try {
      let fetchUrl = decodeURIComponent(url)
      const match = fetchUrl.match(/\/file\/bot[^/]+\/(.+)$/)
      if (match) fetchUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${match[1]}`
      const res = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (res.ok) {
        return new NextResponse(await res.arrayBuffer(), {
          headers: { 'Content-Type': res.headers.get('content-type')||'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
        })
      }
    } catch {}
  }

  if (username) {
    try {
      const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${username}`)
      const chatData = await chatRes.json()
      if (chatData.ok && chatData.result.photo) {
        const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
        const fileData = await fileRes.json()
        if (fileData.ok) {
          const filePath = fileData.result.file_path
          const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
          if (groupId) {
            fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${groupId}`, {
              method: 'PATCH',
              headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ photo_url: photoUrl })
            }).catch(()=>{})
          }
          const imgRes = await fetch(photoUrl)
          if (imgRes.ok) return new NextResponse(await imgRes.arrayBuffer(), {
            headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' }
          })
        }
      }
    } catch {}
  }

  return new NextResponse('Not found', { status: 404 })
}
