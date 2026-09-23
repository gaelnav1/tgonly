import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, username, description, members, photo_url, link, category, tags, submitter_name, submitter_email } = body
    if (!name || !link || !category) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    const categorySlug = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
    const tagsArray = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t:string)=>t.trim()).filter(Boolean) : []
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups_pending`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name, username, description, members: parseInt(String(members).replace(/[^0-9]/g,''))||0, photo_url, link, category: categorySlug, tags: tagsArray, submitter_name, submitter_email, status: 'pendiente', emoji: '📱', color: 'blue', verified: false, trending: false, score: 50 })
    })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Grupo enviado para revision.' })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
