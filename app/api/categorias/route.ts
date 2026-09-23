import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
function slugify(text: string) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }
export async function POST(req: NextRequest) {
  const { name, emoji, description, submitter_name, submitter_email } = await req.json()
  if (!name || !emoji) return NextResponse.json({ error: 'Nombre y emoji requeridos' }, { status: 400 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories_pending`, { method:'POST', headers:{...h,'Prefer':'return=minimal'}, body:JSON.stringify({name,slug:slugify(name),emoji,description,submitter_name,submitter_email,status:'pendiente'}) })
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
  return NextResponse.json({ ok: true, message: 'Categoria enviada.' })
}
export async function GET(req: NextRequest) {
  if (!ADMIN_PASSWORD || req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories_pending?status=eq.pendiente&order=created_at.desc`, { headers: h })
  return NextResponse.json(await res.json())
}
export async function PATCH(req: NextRequest) {
  if (!ADMIN_PASSWORD || req.headers.get('x-admin-password') !== ADMIN_PASSWORD) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, action } = await req.json()
  if (action === 'aprobar') {
    const [cat] = await (await fetch(`${SUPABASE_URL}/rest/v1/categories_pending?id=eq.${id}`,{headers:h})).json()
    if (!cat) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    await fetch(`${SUPABASE_URL}/rest/v1/categories_custom`,{method:'POST',headers:{...h,'Prefer':'resolution=merge-duplicates'},body:JSON.stringify({name:cat.name,slug:cat.slug,emoji:cat.emoji,description:cat.description})})
    await fetch(`${SUPABASE_URL}/rest/v1/categories_pending?id=eq.${id}`,{method:'PATCH',headers:h,body:JSON.stringify({status:'aprobado'})})
    return NextResponse.json({ ok: true, message: `Categoria "${cat.name}" aprobada` })
  }
  await fetch(`${SUPABASE_URL}/rest/v1/categories_pending?id=eq.${id}`,{method:'PATCH',headers:h,body:JSON.stringify({status:'rechazado'})})
  return NextResponse.json({ ok: true, message: 'Rechazada' })
}
