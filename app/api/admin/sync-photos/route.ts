import { NextRequest, NextResponse } from 'next/server'
import { getPhotoForGroup } from '@/lib/getPhoto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const h = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/groups?photo_url=is.null&select=id,name,link,username&limit=100`,
    { headers: h }
  )
  const groups = await res.json()
  if (!Array.isArray(groups)) return NextResponse.json({ error: 'Error' }, { status: 500 })

  let updated = 0, failed = 0
  const BATCH = 10

  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = groups.slice(i, i + BATCH)
    await Promise.all(batch.map(async (group: any) => {
      const result = await getPhotoForGroup(group)
      if (!result) { failed++; return }
      const upd = await fetch(`${SUPABASE_URL}/rest/v1/groups?id=eq.${group.id}`, {
        method: 'PATCH', headers: h,
        body: JSON.stringify({ photo_url: result.photoUrl, ...(result.username ? { username: result.username } : {}) })
      })
      if (upd.ok) updated++; else failed++
    }))
    if (i + BATCH < groups.length) await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({ ok: true, message: `${updated} fotos obtenidas, ${failed} sin foto`, updated, failed, total: groups.length })
}
