// scripts/import-groups.ts
// Uso: npm run import
// Lee data/groups.csv y hace upsert a Supabase

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase     = createClient(supabaseUrl, supabaseKey)

function parseCSV(content: string) {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    // Maneja campos con comillas
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
      else { current += char }
    }
    values.push(current.trim())

    const obj: Record<string, string | boolean | number | string[]> = {}
    headers.forEach((h, i) => {
      const key = h.trim()
      const val = values[i]?.trim() ?? ''

      if (key === 'verified' || key === 'trending') obj[key] = val === 'true'
      else if (key === 'members') obj[key] = parseInt(val.replace(/,/g, ''))
      else if (key === 'tags') obj[key] = val.split('|')
      else obj[key] = val
    })
    return obj
  })
}

async function main() {
  const csvPath = path.join(process.cwd(), 'data', 'groups.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  const groups  = parseCSV(content)

  console.log(`Importando ${groups.length} grupos...`)

  const { error } = await supabase
    .from('groups')
    .upsert(groups, { onConflict: 'name' })

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ ${groups.length} grupos importados correctamente.`)
}

main()
