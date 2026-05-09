const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'

async function tryBotApi(chatId: string, username?: string): Promise<{ photoUrl: string; username?: string } | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
    const data = await res.json()
    if (!data.ok || !data.result.photo) return null
    const fRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${data.result.photo.big_file_id}`)
    const fData = await fRes.json()
    if (!fData.ok) return null
    return { photoUrl: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fData.result.file_path}`, username }
  } catch { return null }
}

async function tryScraping(url: string): Promise<{ photoUrl: string } | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (m?.[1]) return { photoUrl: m[1] }
  } catch {}
  return null
}

export async function getPhotoForGroup(group: { name: string; link?: string; username?: string }): Promise<{ photoUrl: string; username?: string } | null> {
  const attempts: Promise<{ photoUrl: string; username?: string } | null>[] = []

  if (group.username) {
    attempts.push(tryBotApi(`@${group.username}`, group.username))
  }

  if (group.link && group.link !== '#') {
    if (group.link.includes('/+') || group.link.includes('joinchat')) {
      attempts.push(tryScraping(group.link))
    } else {
      const u = group.link.replace('https://t.me/','').replace('http://t.me/','').replace('@','').split('/')[0].trim()
      if (u) {
        attempts.push(tryBotApi(`@${u}`, u))
        attempts.push(tryScraping(`https://t.me/${u}`))
      }
    }
  }

  const results = await Promise.allSettled(attempts)
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value?.photoUrl) return r.value
  }
  return null
}
