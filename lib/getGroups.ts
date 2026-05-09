import { groups as staticGroups, categories as staticCategories } from '@/data/groups'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

export type Group = {
  emoji: string; color: string; name: string; members: string
  verified: boolean; desc: string; tags: string[]; trending: boolean
  category: string; link: string; score?: number
  photo_url?: string | null; username?: string | null; id?: string
}
export type Category = { emoji: string; name: string; count: string; slug: string }

async function getSupabaseGroups(): Promise<Group[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?select=*&order=score.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((g: any) => ({
      emoji: g.emoji || '📱', color: g.color || 'blue', name: g.name,
      members: g.members?.toLocaleString('es') || '0',
      verified: g.verified || false, desc: g.description || '',
      tags: Array.isArray(g.tags) ? g.tags : [],
      trending: g.trending || false, category: g.category,
      link: g.link || '#', score: g.score || 50,
      photo_url: g.photo_url || null, username: g.username || null, id: g.id,
    }))
  } catch { return [] }
}

async function getCustomCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories_custom?select=*&order=created_at.asc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((c: any) => ({ emoji: c.emoji || '📁', name: c.name, count: '0', slug: c.slug }))
  } catch { return [] }
}

export async function getAllGroups(): Promise<Group[]> {
  const supabaseGroups = await getSupabaseGroups()
  if (supabaseGroups.length === 0) {
    return staticGroups.map(g => ({ ...g, desc: (g as any).desc || '', photo_url: null, username: null }))
  }
  const supabaseNames = new Set(supabaseGroups.map(g => g.name.toLowerCase()))
  const uniqueStatic = staticGroups
    .filter(g => !supabaseNames.has(g.name.toLowerCase()))
    .map(g => ({ ...g, desc: (g as any).desc || '', photo_url: null, username: null }))
  return [...supabaseGroups, ...uniqueStatic]
}

export async function getGroupsByCategory(category: string): Promise<Group[]> {
  const all = await getAllGroups()
  return all.filter(g => g.category === category)
}

export async function getAllCategories(): Promise<Category[]> {
  const all = await getAllGroups()
  const catMap = new Map<string, number>()
  all.forEach(g => catMap.set(g.category, (catMap.get(g.category) || 0) + 1))

  const cats = staticCategories.map(c => ({
    ...c, count: String(catMap.get(c.slug) || parseInt(c.count) || 0),
  }))

  const staticSlugs = new Set(staticCategories.map(c => c.slug))
  catMap.forEach((count, slug) => {
    if (!staticSlugs.has(slug)) cats.push({ emoji: '📁', name: slug, count: String(count), slug })
  })

  const customCats = await getCustomCategories()
  const existingSlugs = new Set(cats.map(c => c.slug))
  for (const cc of customCats) {
    if (!existingSlugs.has(cc.slug)) cats.push({ ...cc, count: String(catMap.get(cc.slug) || 0) })
    else {
      const existing = cats.find(c => c.slug === cc.slug)
      if (existing && cc.emoji !== '📁') existing.emoji = cc.emoji
    }
  }
  return cats
}
