export function supabaseHeaders(key: string): Record<string, string> {
  return {
    apikey: key,
    ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
  }
}
