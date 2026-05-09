import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'

const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

export async function getPhotoForGroup(group: { name: string; link?: string; username?: string }): Promise<{ photoUrl: string; username?: string } | null> {
  // Intentar todos los metodos en paralelo y tomar el primero que responda
  const attempts: Promise<{ photoUrl: string; username?: string } | null>[] = []

  // Metodo 1: username directo
  if (group.username) {
    attempts.push(tryBotApi(`@${group.username}`, group.username))
  }

  // Metodo 2: extraer del link
  if (group.link && group.link !== '#') {
    if (group.link.includes('/+') || group.link.includes('joinchat')) {
      // Privado — scraping del preview
      attempts.push(tryScraping(group.link))
    } else {
      const u = group.link.replace('https://t.me/','').replace('http://t.me/','').replace('@','').split('/')[0].trim()
      if (u) {
        attempts.push(tryBotApi(`@${u}`, u))
        attempts.push(tryScraping(`https://t.me/${u}`))
      }
    }
  }

  // Metodo 3: scraping por nombre en t.me
  attempts.push(tryScraping(`https://t.me/${group.name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}`))

  // Correr todos en paralelo, tomar el primero exitoso
  const results = await Promise.allSettled(attempts)
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value?.photoUrl) return r.value
  }
  return null
}

async function tryBotApi(chatId: string, username?: string): Promise<{ photoUrl: string; username?: string } | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
    const data = await res.json()
    if (!data.ok || !data.result.photo) return null
    const fRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${data.result.photo.big_file_id}`)
    const fData = await fRes.json()
    if (!fData.ok) return null
    return { photoUrl: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fData.result.file_path}`, username }
  } catch { return null }
}

async function tryScraping(url: string): Promise<{ photoUrl: string } | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (m?.[1]) return { photoUrl: m[1] }
  } catch {}
  return null
}

async function updateGroupPhoto(id: string, photoUrl: string, username?: string) {
  return fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ photo_url: photoUrl, ...(username ? { username } : {}) })
  })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Obtener grupos sin foto en lotes de 100
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/groups?photo_url=is.null&select=id,name,link,username&limit=100`,
    { headers: h }
  )
  const groups = await res.json()
  if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error' }, { status: 500 })

  // Procesar en grupos de 10 en paralelo
  let updated = 0, failed = 0
  const BATCH = 10

  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = groups.slice(i, i + BATCH)
    await Promise.all(batch.map(async (group: any) => {
      const result = await getPhotoForGroup(group)
      if (!result) { failed++; return }
      const upd = await updateGroupPhoto(group.id, result.photoUrl, result.username)
      if (upd.ok) updated++
      else failed++
    }))
    // Pausa entre lotes para no saturar la API
    if (i + BATCH < groups.length) await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({
    ok: true,
    message: `${updated} fotos obtenidas, ${failed} sin foto disponible`,
    updated, failed, total: groups.length
  })
}
