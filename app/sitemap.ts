import { MetadataRoute } from 'next'
import { categories } from '@/data/groups'
import { getAllGroups } from '@/lib/getGroups'

const BASE = 'https://telegramonly.com'

function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const groups = await getAllGroups()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/grupos`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/agregar`,  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE}/grupos/${cat.slug}`,
    lastModified: now, changeFrequency: 'daily' as const, priority: 0.85,
  }))

  const groupPages: MetadataRoute.Sitemap = groups.map(g => ({
    url: `${BASE}/grupos/${g.category}/${slugify(g.name)}`,
    lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...groupPages]
}
