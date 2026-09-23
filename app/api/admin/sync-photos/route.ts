import { NextRequest, NextResponse } from 'next/server'
import { getPhotoForGroup } from '@/lib/getPhoto'
const SUPABASE_URL = 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = 'Gamadiel21'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  if (body.single && body.id) {
    const result = await getPhotoForGroup({ id: body.id, name: body.name, link: body.link, username: body.username } as any)
    if (!result) return NextResponse.json({ ok: false, log: [{ name: body.name, link: body.link, status: '❌ sin foto', method: 'fallaron todos los metodos', photo: '' }] })
    await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${body.id}`, { method:'PATCH', headers:h, body:JSON.stringify({ photo_url: result.photoUrl, ...(result.username?{username:result.username}:{}) }) })
    return NextResponse.json({ ok: true, log: [{ name: body.name, status: '✅ foto guardada', method: result.method, photo: result.photoUrl }] })
  }
  const category = body.category || ''
  let url = `${SUPABASE_URL}/rest/v1/groups?photo_url=is.null&select=id,name,link,username&limit=100`
  if (category) url += `&category=eq.${category}`
  const res = await fetch(url, { headers: h })
  const groups = await res.json()
  if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error' }, { status: 500 })
  const log: any[] = []
  const BATCH = 5
  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = groups.slice(i, i + BATCH)
    await Promise.all(batch.map(async (group: any) => {
      const result = await getPhotoForGroup(group)
      if (!result) { log.push({ name: group.name, link: group.link||'#', status: '❌ sin foto', method: group.link&&group.link!=='#'?'intentado':'sin link', photo: '' }); return }
      const upd = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${group.id}`, { method:'PATCH', headers:h, body:JSON.stringify({ photo_url: result.photoUrl, ...(result.username?{username:result.username}:{}) }) })
      log.push({ name: group.name, link: group.link||'#', status: upd.ok?'✅ foto guardada':'⚠️ error guardando', method: result.method, photo: result.photoUrl })
    }))
    if (i + BATCH < groups.length) await new Promise(r => setTimeout(r, 800))
  }
  const updated = log.filter(l=>l.status.includes('✅')).length
  const failed = log.filter(l=>l.status.includes('❌')).length
  return NextResponse.json({ ok: true, message: `${updated} fotos obtenidas · ${failed} sin foto`, updated, failed, total: groups.length, log })
}
