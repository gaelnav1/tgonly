import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

async function getPhotoUrl(chatId: string): Promise<string|null> {
  try {
    const encodedId = chatId.startsWith('http') ? encodeURIComponent(chatId) : chatId
    const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encodedId}`)
    const chatData = await chatRes.json()
    if (chatData.ok && chatData.result.photo) {
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatData.result.photo.big_file_id}`)
      const fileData = await fileRes.json()
      if (fileData.ok) return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`
    }
  } catch {}
  try {
    const previewUrl = chatId.startsWith('http') ? chatId : `https://t.me/${chatId.replace('@','')}`
    const res = await fetch(previewUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (m?.[1]) return m[1]
  } catch {}
  return null
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?photo_url=is.null&select=id,name,link,username&limit=50`, { headers: h })
  const groups = await res.json()
  if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error' }, { status: 500 })
  let updated=0, failed=0
  for (const group of groups) {
    let chatId: string|null = null
    if (group.username) chatId = `@${group.username}`
    else if (group.link && group.link !== '#') {
      if (group.link.includes('/+') || group.link.includes('joinchat')) chatId = group.link
      else { const u = group.link.replace('https://t.me/','').replace('http://t.me/','').replace('@','').split('/')[0].trim(); if(u) chatId=`@${u}` }
    }
    if (!chatId) { failed++; continue }
    const photoUrl = await getPhotoUrl(chatId)
    if (!photoUrl) { failed++; continue }
    const upd = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${group.id}`, { method:'PATCH', headers:h, body:JSON.stringify({photo_url:photoUrl,username:chatId.replace('@','')}) })
    if (upd.ok) updated++; else failed++
    await new Promise(r=>setTimeout(r,300))
  }
  return NextResponse.json({ ok:true, message:`${updated} fotos obtenidas, ${failed} sin foto`, updated, failed, total:groups.length })
}
