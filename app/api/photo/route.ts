import { NextRequest, NextResponse } from 'next/server'
import { safePhotoUrl } from '@/lib/photoUrl'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  const username = req.nextUrl.searchParams.get('username')
  const chatId = req.nextUrl.searchParams.get('chat_id')
  const link = req.nextUrl.searchParams.get('link')

  if (url) {
    try {
      const fetchUrl = safePhotoUrl(url)
      if (!fetchUrl || !fetchUrl.startsWith('https://')) throw new Error('Invalid image URL')
      const res = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const ct = res.headers.get('content-type') || 'image/jpeg'
        if (ct.startsWith('image/') || ct.includes('jpeg') || ct.includes('png') || ct.includes('webp')) {
          return new NextResponse(await res.arrayBuffer(), { headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' } })
        }
      }
    } catch {}
  }

  if (BOT_TOKEN && ((username && /^\w{5,32}$/.test(username)) || (chatId && /^-?\d+$/.test(chatId)))) {
    try {
      const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(chatId || '@' + username)}`)
      const chatData = await chatRes.json()
      if (chatData.ok && chatData.result.photo) {
        const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
        const fileData = await fileRes.json()
        if (fileData.ok) {
          const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`
          const imgRes = await fetch(photoUrl)
          if (imgRes.ok) return new NextResponse(await imgRes.arrayBuffer(), { headers: {'Content-Type':'image/jpeg','Cache-Control':'public, max-age=3600'} })
        }
      }
    } catch {}
  }

  if (link && link !== '#') {
    try {
      const res = await fetch(link, { headers: {'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1)'}, signal: AbortSignal.timeout(5000) })
      const html = await res.text()
      const m = html.match(/<meta property="og:image" content="([^"]+)"/)
      if (m?.[1]) {
        const imgRes = await fetch(m[1])
        if (imgRes.ok) return new NextResponse(await imgRes.arrayBuffer(), { headers: {'Content-Type':'image/jpeg','Cache-Control':'public, max-age=3600'} })
      }
    } catch {}
  }

  return new NextResponse('Not found', { status: 404 })
}
