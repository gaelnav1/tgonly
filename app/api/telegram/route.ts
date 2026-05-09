import { NextRequest, NextResponse } from 'next/server'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8645667047:AAGHw3-Ig_F830J-e3fpFdP71h7m2yGQbSw'

async function getPhotoUrl(fileId: string): Promise<string|null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`)
    const data = await res.json()
    if (data.ok) return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`
    return null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const { link } = await req.json()
    if (!link) return NextResponse.json({ error: 'Link requerido' }, { status: 400 })
    const isPrivate = link.includes('/+') || link.includes('joinchat')

    if (isPrivate) {
      const inviteHash = link.replace(/.*\/(joinchat\/|\+)/,'').split('?')[0].trim()
      const previewUrl = `https://t.me/${link.includes('+') ? '+' : 'joinchat/'}${inviteHash}`
      try {
        const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(previewUrl)}`)
        const chatData = await chatRes.json()
        if (chatData.ok) {
          const photoUrl = chatData.result.photo ? await getPhotoUrl(chatData.result.photo.big_file_id) : null
          const countRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${chatData.result.id}`)
          const countData = await countRes.json()
          return NextResponse.json({ ok: true, group: { name: chatData.result.title, username: null, description: chatData.result.description||'', members: countData.ok?countData.result:0, photo_url: photoUrl, type: 'private', link: previewUrl } })
        }
      } catch {}
      try {
        const res = await fetch(previewUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
        const html = await res.text()
        const nameMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
        const membersMatch = html.match(/(\d[\d\s,.]+)\s*(members|subscribers|miembros)/i)
        return NextResponse.json({ ok: true, group: { name: nameMatch?.[1]||'', username: null, description: descMatch?.[1]||'', members: membersMatch?parseInt(membersMatch[1].replace(/[\s,.]/g,'')):0, photo_url: imageMatch?.[1]||null, type: 'private', link: previewUrl } })
      } catch {}
      return NextResponse.json({ ok: true, group: { name:'', username:null, description:'', members:0, photo_url:null, type:'private', link } })
    }

    const username = link.replace('https://t.me/','').replace('http://t.me/','').replace('@','').split('/')[0].trim()
    if (!username) return NextResponse.json({ error: 'Link invalido' }, { status: 400 })

    try {
      const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${username}`)
      const chatData = await chatRes.json()
      if (chatData.ok) {
        const photoUrl = chatData.result.photo ? await getPhotoUrl(chatData.result.photo.big_file_id) : null
        const countRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=@${username}`)
        const countData = await countRes.json()
        return NextResponse.json({ ok: true, group: { name: chatData.result.title, username, description: chatData.result.description||'', members: countData.ok?countData.result:0, photo_url: photoUrl, type: chatData.result.type, link: `https://t.me/${username}` } })
      }
    } catch {}

    try {
      const res = await fetch(`https://t.me/${username}`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } })
      const html = await res.text()
      const nameMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
      const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
      const membersMatch = html.match(/(\d[\d\s,.]+)\s*(members|subscribers|miembros)/i)
      if (!nameMatch) return NextResponse.json({ error: 'Grupo no encontrado o es privado.' }, { status: 400 })
      return NextResponse.json({ ok: true, group: { name: nameMatch[1], username, description: descMatch?.[1]||'', members: membersMatch?parseInt(membersMatch[1].replace(/[\s,.]/g,'')):0, photo_url: imageMatch?.[1]||null, type: 'supergroup', link: `https://t.me/${username}` } })
    } catch {}

    return NextResponse.json({ error: 'No se pudo obtener info del grupo.' }, { status: 400 })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
