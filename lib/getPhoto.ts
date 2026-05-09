const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'

export type PhotoResult = {
  photoUrl: string
  username?: string
  method: string
}

async function tryBotApi(chatId: string, username?: string): Promise<PhotoResult | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`)
    const data = await res.json()
    if (!data.ok) return null
    if (!data.result.photo) return null
    const fRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${data.result.photo.big_file_id}`)
    const fData = await fRes.json()
    if (!fData.ok) return null
    return { photoUrl: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fData.result.file_path}`, username, method: `bot_api:${chatId}` }
  } catch (e: any) { return null }
}

async function tryScraping(url: string): Promise<PhotoResult | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
    const html = await res.text()
    const m = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (m?.[1]) return { photoUrl: m[1], method: `scraping:${url}` }
  } catch {}
  return null
}

export async function getPhotoForGroup(group: { name: string; link?: string; username?: string }): Promise<PhotoResult | null> {
  // Metodo 1: username directo
  if (group.username) {
    const r = await tryBotApi(`@${group.username}`, group.username)
    if (r) return r
  }

  // Metodo 2: desde link
  if (group.link && group.link !== '#') {
    if (group.link.includes('/+') || group.link.includes('joinchat')) {
      const r = await tryScraping(group.link)
      if (r) return r
    } else {
      const u = group.link.replace('https://t.me/','').replace('http://t.me/','').replace('@','').split('/')[0].trim()
      if (u) {
        const r1 = await tryBotApi(`@${u}`, u)
        if (r1) return r1
        const r2 = await tryScraping(`https://t.me/${u}`)
        if (r2) return r2
      }
    }
  }

  return null
}
