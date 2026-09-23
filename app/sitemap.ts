import { MetadataRoute } from 'next'
import { getAllCategories, getAllGroups } from '@/lib/getGroups'

function slugify(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://telegramonly.com'
  const now = new Date()
  const [categories, groups] = await Promise.all([getAllCategories(), getAllGroups()])

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/grupos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/agregar`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${base}/grupos/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const groupPages: MetadataRoute.Sitemap = groups.map(g => ({
    url: `${base}/grupos/${g.category}/${slugify(g.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...groupPages]
}
