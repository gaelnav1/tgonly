import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?status=eq.pendiente&order=created_at.desc`, { headers: h })
  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, action } = await req.json()
  if (!id || !action) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  if (action === 'aprobar') {
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { headers: h })
    const [group] = await getRes.json()
    if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
    let photoUrl = group.photo_url || null
    if (!photoUrl && group.link && !group.link.includes('/+')) {
      try {
        const u = group.link.replace('https://t.me/','').replace('@','').split('/')[0].trim()
        const cr = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${u}`)
        const cd = await cr.json()
        if (cd.ok && cd.result.photo) {
          const fr = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${cd.result.photo.big_file_id}`)
          const fd = await fr.json()
          if (fd.ok) photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fd.result.file_path}`
        }
      } catch {}
    }
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
      method: 'POST', headers: { ...h, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ name:group.name, username:group.username, emoji:group.emoji||'📱', color:'blue', members:group.members, verified:true, description:group.description, tags:group.tags, trending:false, category:group.category, link:group.link, photo_url:photoUrl, score:group.score||50 })
    })
    if (!ins.ok) return NextResponse.json({ error: `Error: ${await ins.text()}` }, { status: 500 })
    await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { method:'PATCH', headers:h, body:JSON.stringify({status:'aprobado'}) })
    return NextResponse.json({ ok: true, message: 'Grupo aprobado y publicado' })
  }

  if (action === 'rechazar') {
    await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { method:'PATCH', headers:h, body:JSON.stringify({status:'rechazado'}) })
    return NextResponse.json({ ok: true, message: 'Grupo rechazado' })
  }
  return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
}
