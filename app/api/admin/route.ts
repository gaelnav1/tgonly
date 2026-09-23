import { supabaseHeaders } from '@/lib/supabaseHeaders'
import { NextRequest, NextResponse } from 'next/server'
import { getPhotoForGroup } from '@/lib/getPhoto'
import { safePhotoUrl } from '@/lib/photoUrl'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const h = { ...supabaseHeaders(SUPABASE_KEY), 'Content-Type': 'application/json' }
export async function GET(req: NextRequest) {
  if (!ADMIN_PASSWORD || req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?status=eq.pendiente&order=created_at.desc`, { headers: h })
  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data.map(group => ({ ...group, photo_url: safePhotoUrl(group.photo_url) })) : data)
}
export async function POST(req: NextRequest) {
  if (!ADMIN_PASSWORD || req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, action } = await req.json()
  if (!id || !action) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  if (action === 'aprobar') {
    const [group] = await (await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { headers: h })).json()
    if (!group) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    let photoUrl = safePhotoUrl(group.photo_url)
    let username = group.username || null
    if (!photoUrl) {
      const result = await getPhotoForGroup({ name: group.name, link: group.link, username: group.username })
      if (result) { photoUrl = result.photoUrl; username = result.username || username }
    }
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
      method: 'POST', headers: { ...h, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ name:group.name, username, emoji:group.emoji||'📱', color:'blue', members:group.members, verified:true, description:group.description, tags:group.tags, trending:false, category:group.category, link:group.link, photo_url:photoUrl, score:group.score||50 })
    })
    if (!ins.ok) return NextResponse.json({ error: await ins.text() }, { status: 500 })
    await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { method:'PATCH', headers:h, body:JSON.stringify({status:'aprobado'}) })
    fetch('https://www.google.com/ping?sitemap=https://telegramonly.com/sitemap.xml').catch(()=>{})
    return NextResponse.json({ ok: true, message: `Grupo aprobado${photoUrl?' con foto ✅':''}` })
  }
  if (action === 'rechazar') {
    await fetch(`${SUPABASE_URL}/rest/v1/groups_pending?id=eq.${id}`, { method:'PATCH', headers:h, body:JSON.stringify({status:'rechazado'}) })
    return NextResponse.json({ ok: true, message: 'Grupo rechazado' })
  }
  return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
}
