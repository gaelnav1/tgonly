import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
function auth(req: NextRequest) { return req.headers.get('x-admin-password') === ADMIN_PASSWORD }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const category = req.nextUrl.searchParams.get('category')||''
  const search = req.nextUrl.searchParams.get('search')||''
  let url = `${SUPABASE_URL}/rest/v1/groups?select=*&order=score.desc,created_at.desc&limit=200`
  if (category) url += `&category=eq.${category}`
  const res = await fetch(url, { headers: h })
  let data = await res.json()
  if (!Array.isArray(data)) return NextResponse.json([])
  if (search) { const q = search.toLowerCase(); data = data.filter((g:any) => g.name?.toLowerCase().includes(q)||g.description?.toLowerCase().includes(q)||g.category?.toLowerCase().includes(q)) }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const allowed = ['name','description','tags','link','members','category','verified','trending','score','photo_url','emoji','color']
  const update: any = {}
  for (const k of allowed) { if (fields[k] !== undefined) update[k] = fields[k] }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, { method:'PATCH', headers:{ ...h,'Prefer':'return=representation' }, body:JSON.stringify(update) })
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${id}`, { method:'DELETE', headers:h })
  if (!res.ok) return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
