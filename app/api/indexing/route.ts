import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gamadiel21'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kftdlkakcuyexifdhlnr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGRsa2FrY3V5ZXhpZmRobG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjczMTA3NywiZXhwIjoyMDkyMzA3MDc3fQ.ZN1H9KVv-P5262g6gCGHv4f7_HVjr--jEwMFsqdcBBw'

const SERVICE_ACCOUNT = {
  client_email: 'tgonly-indexing@my-project-1-418221.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDTFzabVYsrJVhB\nHb6E+75CtMqO9YdYo2hOwue/HnZTVFZM0y+J1D8wv5mX0OSDWEwUhfz1sCBDxvOb\niCYWk+Ja+RHpMIGZNTH7md0rmsJL5oQA1ucb7UY/XbwV6Y8cz81Ov1C6dRjJg+BI\nYPf4+YHXXfhNSpmGwMxiaKEELDqPbrYeSo/zuWOInUwyFP5RPprfikYYhrgoua0Q\n6h3MDBEwwW3TFNzWYOK0oZs/yHMJOcHtRYxs4uz/mSOSGv0PKIKCv+n8u9qqySjb\nzGHVh8C/zJEz/VK2mmH67NaKiYrT01oh8j2imC96/KQjYNBdc6cskL9cSqSAPgki\nAc1VBiTfAgMBAAECggEAGRTaBSzt40uFp/8LwytSWQS4SLI9ybdozmr0NE4/Svlr\nY6d4L41LkNRDQLmuXTjhmVKuUtcBjmwWR/WuaOJbc+nCSg3caELc1INctzClQ3V5\nW8wtG7FetmrBzWy593dtcpziz7TYJCGKRa9X53pmBhwBQ9XIVi2UW2EJOMC0mJQc\npo4c8xT4Kh8diCc/JUkxpsfYwTR0BtUNywsoGZ3zvL/3olrtlvnjwTHfZPdmPjX+\nqP0AY+HeyEhDFO+A+4Uz4HK3e6FX8oz+Urt7ExukioG6LCv9pXjsPPp91lqhGirs\nzQuAV2w/6XHOkBl/Oq0JA7i1Mo5Cm0ZEwWdC+2eNsQKBgQD53i7GcNa17Mfq6RX/\nl0oA0ifXrqZM3yZqtXHDD08Pqjmsg7qMaF5x0zGZgCNvhziEHBdS7qeUxQBxkx6U\ncRB7PHNcr5ZFtkOHbPBRLDTdh63XMXCpSAkKvhcmderJ0R80tMYUam/RSm7rS545\nMCHVKgS2Bi2MAc7LttV8oasCGQKBgQDYRWjDuAO+G/B7DPCvN2V/ZCivRl1OBNz6\nW3Bca90Dzb93VHZ9eNe2Pqa5j0qyx2WUxdmGfaoUZvGcbGAwGqb9dNS5RvBnS3qn\nhiRMaMyBPvMDU0DCPM8GPHL4JfaEGWttU2NpZPrsWj+tAsJRFMkzZQSG8br1IqaZ\n14eQfVtttwKBgQCg3q1a0bdK9aFY2qxxHCRnFubT8/vZrin7tcoCfc63FS+ApGbs\nkx2LRx+95kPqQDLgy30wxbpbC+LXPJMJmymzTh4v5FRpmYksnbSzbjSzE/GWhJw2\nQMyhf/VDq9N4EA15T5Hf/w7yvmtfThYWV6jQpvbVgnC8nUVY3uPgE+4XsQKBgCOY\n0RSd3ifVa3ClgZwlbxRXxQaMe2ETFdgzYrwjmN4+aExY36PpVwANMd4LAs2IWmTx\nZ8tmNa9j/lKz1+UzDddb+oOAdKNb3hVi0+iruzVuygr7EgamgaDSJE5J2ViG4pK9\nDfjUASUT+bUdZiR4WmGWN/eKJC6jBG7/9bVHnNvjAoGBALplD2WwhV5ePbMDcF14\nlAo+Cvn+U5gUl7wn1KQRxGxD95WgWZNIamMxjm+kp6swehoZSR++VMkboWPM2Zxd\no0MdDUK0/9R3ycQ9S7nq9tvN6cfh/P/ZCbbAUXaQiufyDpVaV15zUTBqyiDNLR3F\n6rhv1W7YeD777ga9zLJJ8yRv\n-----END PRIVATE KEY-----\n',
}

function slugify(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

// Generar JWT para autenticación con Google
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const headerB64  = encode(header)
  const payloadB64 = encode(payload)
  const sigInput   = `${headerB64}.${payloadB64}`

  // Importar la clave privada
  const pemKey = SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n')
  const keyData = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')
  const binaryKey = Buffer.from(keyData, 'base64')

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    Buffer.from(sigInput)
  )

  const jwt = `${sigInput}.${Buffer.from(signature).toString('base64url')}`

  // Intercambiar JWT por access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error(`Token error: ${JSON.stringify(tokenData)}`)
  return tokenData.access_token
}

// Solicitar indexación de una URL
async function requestIndexing(url: string, token: string): Promise<{ url: string; status: string }> {
  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    })
    const data = await res.json()
    if (res.ok) return { url, status: '✅ indexada' }
    if (data.error?.code === 429) return { url, status: '⚠️ limite diario' }
    return { url, status: `❌ ${data.error?.message || 'error'}` }
  } catch (e: any) {
    return { url, status: `❌ ${e.message}` }
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { urls, category } = await req.json().catch(() => ({}))

  // Si se pasan URLs directamente, indexarlas
  let toIndex: string[] = urls || []

  // Si no hay URLs, obtenerlas de Supabase
  if (!toIndex.length) {
    const cat = category || 'fans'
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/groups?category=eq.${cat}&select=name,category&limit=200`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    )
    const groups = await res.json()

    if (Array.isArray(groups)) {
      toIndex = groups.map((g: any) =>
        `https://telegramonly.com/grupos/${g.category}/${slugify(g.name)}`
      )
    }

    // Agregar páginas principales
    toIndex = [
      'https://telegramonly.com',
      'https://telegramonly.com/grupos',
      `https://telegramonly.com/grupos/${cat}`,
      ...toIndex,
    ]
  }

  // Limitar a 200 por día (límite de Google)
  toIndex = Array.from(new Set(toIndex)).slice(0, 200)

  try {
    const token = await getAccessToken()
    const results = []
    const BATCH = 10

    for (let i = 0; i < toIndex.length; i += BATCH) {
      const batch = toIndex.slice(i, i + BATCH)
      const batchResults = await Promise.all(batch.map(url => requestIndexing(url, token)))
      results.push(...batchResults)
      if (i + BATCH < toIndex.length) await new Promise(r => setTimeout(r, 500))
    }

    const ok      = results.filter(r => r.status.startsWith('✅')).length
    const limited = results.filter(r => r.status.startsWith('⚠️')).length
    const errors  = results.filter(r => r.status.startsWith('❌')).length

    return NextResponse.json({
      ok: true,
      message: `${ok} URLs indexadas, ${limited} límite diario, ${errors} errores`,
      total: results.length, ok, limited, errors,
      results,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET — ver estado de una URL
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 })

  try {
    const token = await getAccessToken()
    const res = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
