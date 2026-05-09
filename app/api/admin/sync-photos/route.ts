import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'

const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

// Metodo 1: Bot API por @username o link de invitacion
async function getPhotoByChat(chatId: string): Promise<string | null> {
  try {
    const encoded = chatId.startsWith('http') ? encodeURIComponent(chatId) : chatId
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encoded}`)
    const data = await res.json()
    if (!data.ok || !data.result.photo) return null
    const fRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${data.result.photo.big_file_id}`)
    const fData = await fRes.json()
    if (!fData.ok) return null
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fData.result.file_path}`
  } catch { return null }
}

// Metodo 2: Scraping og:image de t.me (funciona para publicos y privados)
async function getPhotoByScraing(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
    })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    return m?.[1] || null
  } catch { return null }
}

// Metodo 3: Buscar el grupo por nombre en la API de Telegram
async function getPhotoByName(name: string): Promise<{ photoUrl: string; username: string } | null> {
  try {
    // Convertir nombre a posible username: "Free Fire LATAM" -> "freefilelatam"
    const possibleUsernames = [
      name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
      name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      name.toLowerCase().split(' ').join(''),
      name.toLowerCase().split(' ').slice(0, 3).join(''),
    ]

    for (const username of [...new Set(possibleUsernames)]) {
      if (username.length < 3) continue
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${username}`)
      const data = await res.json()
      if (data.ok && data.result.photo) {
        const fRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${data.result.photo.big_file_id}`)
        const fData = await fRes.json()
        if (fData.ok) {
          return {
            photoUrl: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fData.result.file_path}`,
            username
          }
        }
      }
      await new Promise(r => setTimeout(r, 150))
    }
  } catch {}
  return null
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/groups?photo_url=is.null&select=id,name,link,username&limit=50`,
    { headers: h }
  )
  const groups = await res.json()
  if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error obteniendo grupos' }, { status: 500 })

  let updated = 0, failed = 0

  for (const group of groups) {
    let photoUrl: string | null = null
    let username: string | null = group.username || null

    // Metodo 1: username conocido
    if (username) {
      photoUrl = await getPhotoByChat(`@${username}`)
    }

    // Metodo 2: extraer username del link
    if (!photoUrl && group.link && group.link !== '#') {
      if (group.link.includes('/+') || group.link.includes('joinchat')) {
        // Grupo privado — scraping del preview
        photoUrl = await getPhotoByScraing(group.link)
      } else {
        const u = group.link
          .replace('https://t.me/', '').replace('http://t.me/', '')
          .replace('@', '').split('/')[0].trim()
        if (u) {
          username = u
          photoUrl = await getPhotoByChat(`@${u}`)
          // Fallback scraping
          if (!photoUrl) photoUrl = await getPhotoByScraing(`https://t.me/${u}`)
        }
      }
    }

    // Metodo 3: buscar por nombre (para grupos sin link)
    if (!photoUrl) {
      const result = await getPhotoByName(group.name)
      if (result) {
        photoUrl = result.photoUrl
        username = result.username
      }
    }

    if (!photoUrl) { failed++; continue }

    const upd = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${group.id}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({
        photo_url: photoUrl,
        ...(username ? { username } : {})
      })
    })

    if (upd.ok) updated++
    else failed++

    await new Promise(r => setTimeout(r, 400))
  }

  return NextResponse.json({
    ok: true,
    message: `${updated} fotos obtenidas, ${failed} sin foto disponible`,
    updated, failed, total: groups.length
  })
}
