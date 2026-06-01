import { NextRequest, NextResponse } from 'next/server'
import { groups as staticGroups } from '@/data/groups'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim()
  if (!q || q.length < 2) return NextResponse.json([])
  let supabaseGroups: any[] = []
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?select=*&order=score.desc`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } })
    if (res.ok) { const data = await res.json(); if (Array.isArray(data)) supabaseGroups = data }
  } catch {}
  const supabaseNames = new Set(supabaseGroups.map((g:any) => g.name?.toLowerCase()))
  const allGroups = [
    ...supabaseGroups.map((g:any) => ({ emoji:g.emoji||'📱', color:'blue', name:g.name, members:String(g.members||0), verified:g.verified||false, desc:g.description||'', tags:Array.isArray(g.tags)?g.tags:[], trending:g.trending||false, category:g.category, link:g.link||'#', score:g.score||50, photo_url:g.photo_url||null, username:g.username||null })),
    ...staticGroups.filter(g=>!supabaseNames.has(g.name.toLowerCase())).map(g=>({...g,desc:(g as any).desc||'',photo_url:null,username:null})),
  ]
  const results = allGroups.filter(g => q.split(' ').every(word => [g.name,g.desc,g.category,...(g.tags||[])].join(' ').toLowerCase().includes(word)))
  results.sort((a,b) => { const ai=a.name.toLowerCase().includes(q)?1:0; const bi=b.name.toLowerCase().includes(q)?1:0; if(bi!==ai)return bi-ai; if(b.trending!==a.trending)return b.trending?1:-1; return (b.score||0)-(a.score||0) })
  return NextResponse.json(results.slice(0,50))
}
