import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const batchSize = Number(process.argv[2] ?? 200)

  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) {
    throw new Error('Batch size must be an integer between 1 and 1000')
  }

  let totalProcessed = 0
  let totalCreated = 0
  let totalLinked = 0
  let totalIgnored = 0

  while (true) {
    const { data, error } = await supabase.rpc('normalize_onlysearch_batch', {
      p_limit: batchSize,
    })

    if (error) throw error

    const result = data as {
      processed: number
      created_candidates: number
      linked_evidence: number
      ignored: number
    }

    totalProcessed += result.processed
    totalCreated += result.created_candidates
    totalLinked += result.linked_evidence
    totalIgnored += result.ignored

    console.log(result)

    if (result.processed + result.ignored === 0) break
  }

  console.log({
    totalProcessed,
    totalCreated,
    totalLinked,
    totalIgnored,
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
