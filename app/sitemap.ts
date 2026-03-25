import { MetadataRoute } from 'next'
import { categories, groups } from '@/data/groups'

function slugify(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://tgonly.com'
  const now = new Date()

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/grupos`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/agregar`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Páginas de categoría — alta prioridad SEO
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${base}/grupos/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  // Páginas individuales de grupos
  const groupPages: MetadataRoute.Sitemap = groups.map(g => ({
    url: `${base}/grupos/${g.category}/${slugify(g.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...groupPages]
}
