import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
function auth(req: NextRequest) { return Boolean(ADMIN_PASSWORD) && req.headers.get('x-admin-password') === ADMIN_PASSWORD }
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!SUPABASE_KEY || !SUPABASE_URL) return NextResponse.json({ error: 'Falta configurar Supabase en el servidor' }, { status: 503 })
  const category = req.nextUrl.searchParams.get('category')||''
  const search = req.nextUrl.searchParams.get('search')||''
  try {
    const url = new URL('/rest/v1/groups', SUPABASE_URL)
    url.searchParams.set('select', '*')
    url.searchParams.set('order', 'score.desc,created_at.desc')
    url.searchParams.set('limit', '200')
    if (category) url.searchParams.set('category', `eq.${category}`)
    const res = await fetch(url, { headers: h, cache: 'no-store' })
    if (!res.ok) {
      console.error('Admin groups: Supabase returned', res.status)
      return NextResponse.json({ error: 'No se pudo consultar Supabase' }, { status: 502 })
    }
    let data = await res.json()
    if (!Array.isArray(data)) return NextResponse.json({ error: 'Respuesta inesperada de Supabase' }, { status: 502 })
    if (search) { const q = search.toLowerCase(); data = data.filter((g:any) => g.name?.toLowerCase().includes(q)||g.description?.toLowerCase().includes(q)) }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin groups: Supabase request failed', error)
    return NextResponse.json({ error: 'No se pudo conectar con Supabase' }, { status: 503 })
  }
}
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const allowed = ['name','description','tags','link','members','category','verified','trending','score','photo_url','emoji','color']
  const update: any = {}
  for (const k of allowed) { if (fields[k] !== undefined) update[k] = fields[k] }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, { method:'PATCH', headers:{...h,'Prefer':'return=representation'}, body:JSON.stringify(update) })
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
  return NextResponse.json({ ok: true })
}
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, { method:'DELETE', headers:h })
  return NextResponse.json({ ok: true })
}
