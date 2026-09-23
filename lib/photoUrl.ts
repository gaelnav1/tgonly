// Telegram file URLs contain the bot credential in their path. Never expose or persist them.
export function safePhotoUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  if (/api\.telegram\.org\/(?:file\/)?bot/i.test(value)) return null
  if (value.startsWith('/api/photo?chat_id=')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? value : null
  } catch { return null }
}
