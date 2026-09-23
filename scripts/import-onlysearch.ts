import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

type JsonRecord = Record<string, unknown>

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v.length ? v : null
}

function normalizeHandle(value: string): string {
  return value
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(?:www\.)?onlyfans\.com\//i, '')
    .split(/[/?#]/)[0]
    .trim()
    .toLowerCase()
}

function handleFromRecord(record: JsonRecord): string | null {
  const candidates = [
    record.username,
    record.handle,
    record.onlyfans_username,
    record.onlyfans_handle,
    record.onlyfans_url,
    record.profile_url,
    record.url,
  ]

  for (const candidate of candidates) {
    const raw = asString(candidate)
    if (!raw) continue

    const looksLikeOnlyFansUrl = /onlyfans\.com\//i.test(raw)
    const looksLikeHandle =
      !/^https?:\/\//i.test(raw) ||
      looksLikeOnlyFansUrl

    if (!looksLikeHandle) continue

    const handle = normalizeHandle(raw)
    if (handle) return handle
  }

  return null
}

function sourceUrlFromRecord(record: JsonRecord): string | null {
  const candidates = [
    record.onlysearch_url,
    record.source_url,
    record.listing_url,
  ]

  for (const candidate of candidates) {
    const value = asString(candidate)
    if (value) return value
  }

  return null
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']'
  }

  const object = value as JsonRecord
  const keys = Object.keys(object).sort()
  return (
    '{' +
    keys
      .map((key) => JSON.stringify(key) + ':' + stableStringify(object[key]))
      .join(',') +
    '}'
  )
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function parseInput(filePath: string): JsonRecord[] {
  const raw = fs.readFileSync(filePath, 'utf8').trim()
  if (!raw) return []

  if (filePath.endsWith('.jsonl') || filePath.endsWith('.ndjson')) {
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line, index) => {
        const parsed = JSON.parse(line)
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
          throw new Error(`Line ${index + 1} is not a JSON object`)
        }
        return parsed as JsonRecord
      })
  }

  const parsed = JSON.parse(raw)

  if (Array.isArray(parsed)) {
    return parsed as JsonRecord[]
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as JsonRecord).profiles)
  ) {
    return (parsed as { profiles: JsonRecord[] }).profiles
  }

  throw new Error(
    'Expected a JSON array, {"profiles": [...]}, JSONL, or NDJSON file'
  )
}

async function main() {
  const inputArg = process.argv[2]

  if (!inputArg) {
    console.error(
      'Usage: npm run import:onlysearch -- data/onlysearch.json'
    )
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), inputArg)
  const records = parseInput(filePath)

  console.log(`OnlySearch import: ${records.length} raw records`)

  const { data: runId, error: startError } = await supabase.rpc(
    'ingest_start_run',
    {
      p_source_slug: 'onlysearch',
      p_scraper_version: 'authorized-export-v1',
    }
  )

  if (startError || !runId) {
    throw new Error(
      `Could not start ingest run: ${startError?.message ?? 'missing run id'}`
    )
  }

  let inserted = 0
  let skipped = 0
  let errors = 0
  const errorMessages: string[] = []

  for (let index = 0; index < records.length; index++) {
    const payload = records[index]
    const handle = handleFromRecord(payload)

    if (!handle) {
      skipped += 1
      errorMessages.push(`#${index + 1}: missing OnlyFans handle`)
      continue
    }

    const identityKey = `onlyfans:${handle}`
    const snapshotHash = sha256(stableStringify(payload))
    const sourceUrl = sourceUrlFromRecord(payload)

    const { data: wasInserted, error } = await supabase.rpc(
      'ingest_raw_record',
      {
        p_source_slug: 'onlysearch',
        p_scrape_run_id: runId,
        p_external_id: handle,
        p_source_url: sourceUrl,
        p_identity_key: identityKey,
        p_snapshot_hash: snapshotHash,
        p_payload: payload,
      }
    )

    if (error) {
      errors += 1
      errorMessages.push(`#${index + 1} @${handle}: ${error.message}`)
      continue
    }

    if (wasInserted) inserted += 1
  }

  const finalStatus = errors > 0 ? 'partial' : 'completed'

  const { error: finishError } = await supabase.rpc('ingest_finish_run', {
    p_run_id: runId,
    p_status: finalStatus,
    p_records_seen: records.length,
    p_records_inserted: inserted,
    p_records_changed: 0,
    p_error_count: errors + skipped,
    p_error_summary: errorMessages.slice(0, 50).join('\n') || null,
  })

  if (finishError) {
    throw new Error(`Could not finish ingest run: ${finishError.message}`)
  }

  console.log(
    `Done. inserted=${inserted} duplicate=${
      records.length - inserted - skipped - errors
    } skipped=${skipped} errors=${errors}`
  )
  console.log(`run_id=${runId}`)
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})
