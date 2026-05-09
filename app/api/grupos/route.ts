import { NextRequest, NextResponse } from 'next/server'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, username, description, members, photo_url, link, category, tags, submitter_name, submitter_email } = body
    if (!name || !link || !category) return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    const categorySlug = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
    const tagsArray = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t:string)=>t.trim()).filter(Boolean) : []
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups_pending`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name, username, description, members: parseInt(String(members).replace(/[^0-9]/g,''))||0, photo_url, link, category: categorySlug, tags: tagsArray, submitter_name, submitter_email, status: 'pendiente', emoji: '📱', color: 'blue', verified: false, trending: false, score: 50 })
    })
    if (!res.ok) return NextResponse.json({ error: `Error al guardar: ${await res.text()}` }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Grupo enviado para revision. Lo revisaremos en 24-48 horas.' })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
