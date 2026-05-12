'use client'
import { useState, useEffect, useCallback } from 'react'

const PASS = 'Gamadiel21'
const h = { 'x-admin-password': PASS, 'Content-Type': 'application/json' }

type Group = { id:string; name:string; link:string; photo_url:string|null; description:string; username:string }
type DedupPair = { a:{id:string;name:string}; b:{id:string;name:string}; similarity:number }
type ScrapeResult = { source:string; name?:string; title?:string; description?:string; photo_url?:string|null; tgLinks:string[]; ofLinks:string[]; names?:string[]; username?:string }

const f: React.CSSProperties = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const syne = "'Syne',system-ui,sans-serif"

export default function IntelPage() {
  const [tab, setTab] = useState<'overview'|'scraper'|'dedup'|'seo'|'coverage'>('overview')
  const [stats, setStats] = useState<any>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null)

  // Scraper
  const [scCountry, setScCountry] = useState('mexico')
  const [scKeyword, setScKeyword] = useState('')
  const [scResults, setScResults] = useState<ScrapeResult[]>([])
  const [scLog, setScLog] = useState<string[]>([])
  const [scLoading, setScLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Dedup
  const [dedupPairs, setDedupPairs] = useState<DedupPair[]>([])
  const [threshold, setThreshold] = useState(75)
  const [dedupLoading, setDedupLoading] = useState(false)

  // SEO
  const [seoGroup, setSeoGroup] = useState<Group|null>(null)
  const [seoResult, setSeoResult] = useState('')
  const [seoTags, setSeoTags] = useState<string[]>([])
  const [seoLoading, setSeoLoading] = useState(false)
  const [batchLog, setBatchLog] = useState<string[]>([])
  const [batchRunning, setBatchRunning] = useState(false)

  // Coverage
  const [coverSearch, setCoverSearch] = useState('')
  const [coverFilter, setCoverFilter] = useState('all')

  function notify(text:string,ok=true){setMsg({text,ok});setTimeout(()=>setMsg(null),4000)}

  const loadStats = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/intel?action=stats', { headers: h as any })
    const data = await res.json()
    setStats(data)
    setGroups(Array.isArray(data.groups) ? data.groups : [])
    setLoading(false)
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  async function runScraper() {
    setScLoading(true); setScResults([]); setScLog([]); setSelected(new Set())
    const res = await fetch('/api/intel', { method:'POST', headers: h as any, body: JSON.stringify({ action:'scrape', country:scCountry, keyword:scKeyword.trim()||undefined }) })
    const data = await res.json()
    setScResults(Array.isArray(data.results) ? data.results : [])
    setScLog(Array.isArray(data.log) ? data.log : [])
    setScLoading(false)
  }

  async function importSelected() {
    const toImport = scResults.filter((_,i) => selected.has(i)).map(r => ({
      name: r.name || r.title || '',
      username: r.username || '',
      description: r.description || '',
      photo_url: r.photo_url || null,
      link: r.tgLinks?.[0] || '#',
    })).filter(r => r.name)

    if (!toImport.length) return notify('Selecciona al menos una creadora', false)
    const res = await fetch('/api/intel', { method:'POST', headers: h as any, body: JSON.stringify({ action:'import', items:toImport }) })
    const data = await res.json()
    if (data.ok) { notify(data.message); loadStats() }
    else notify('Error al importar', false)
  }

  async function runDedup() {
    setDedupLoading(true)
    const res = await fetch(`/api/intel?action=dedup&threshold=${threshold/100}`, { headers: h as any })
    const data = await res.json()
    setDedupPairs(Array.isArray(data) ? data : [])
    setDedupLoading(false)
  }

  async function deleteDup(id:string) {
    await fetch('/api/intel', { method:'POST', headers: h as any, body: JSON.stringify({ action:'delete', id }) })
    setDedupPairs(prev => prev.filter(p => p.a.id !== id && p.b.id !== id))
    setGroups(prev => prev.filter(g => g.id !== id))
    loadStats()
    notify('Duplicado eliminado')
  }

  async function generateSEO(group: Group) {
    setSeoGroup(group); setSeoResult(''); setSeoTags([]); setSeoLoading(true)
    const res = await fetch('/api/intel', { method:'POST', headers: h as any, body: JSON.stringify({ action:'generate-seo', name:group.name, groupId:group.id, country:'México', members:0, bio:'' }) })
    const data = await res.json()
    setSeoResult(data.description || ''); setSeoTags(data.tags || [])
    setSeoLoading(false)
    if (data.ok) { notify('SEO generado y guardado'); loadStats() }
  }

  async function runBatchSEO() {
    const noDesc = groups.filter(g => !g.description).slice(0, 20)
    if (!noDesc.length) return notify('Todos tienen descripción')
    setBatchRunning(true); setBatchLog([])
    for (const g of noDesc) {
      setBatchLog(prev => [...prev, `Generando: ${g.name}...`])
      await fetch('/api/intel', { method:'POST', headers: h as any, body: JSON.stringify({ action:'generate-seo', name:g.name, groupId:g.id, country:'LATAM', members:0, bio:'' }) })
      setBatchLog(prev => [...prev.slice(0,-1), `✅ ${g.name}`])
      await new Promise(r => setTimeout(r, 1200))
    }
    setBatchRunning(false); notify(`${noDesc.length} descripciones generadas`); loadStats()
  }

  // Estilos
  const card: React.CSSProperties = { background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20, marginBottom:16 }
  const inp: React.CSSProperties = { background:'#1c1c27', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#f0eff8', ...f, fontSize:13, outline:'none', width:'100%' }
  const tabBtn = (active:boolean): React.CSSProperties => ({ background:active?'#2AABEE':'transparent', color:active?'#000':'#8888aa', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:13, cursor:'pointer', ...f })
  const btnBlue: React.CSSProperties = { background:'#2AABEE', color:'#000', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:'pointer', ...f }
  const btnGhost: React.CSSProperties = { background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'#8888aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer', ...f }
  const btnRed: React.CSSProperties = { background:'rgba(255,95,109,0.12)', border:'1px solid rgba(255,95,109,0.25)', color:'#ff5f6d', borderRadius:8, padding:'6px 14px', fontSize:12, cursor:'pointer', ...f }
  const btnGreen: React.CSSProperties = { background:'#22c55e', color:'#000', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:'pointer', ...f }

  const filteredGroups = groups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(coverSearch.toLowerCase())
    if (!matchSearch) return false
    if (coverFilter === 'nolink') return !g.link || g.link === '#'
    if (coverFilter === 'nophoto') return !g.photo_url
    if (coverFilter === 'nodesc') return !g.description
    if (coverFilter === 'complete') return (g.link && g.link !== '#') && g.photo_url && g.description
    return true
  })

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#f0eff8', ...f }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:'#111118', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontFamily:syne, fontWeight:800, fontSize:18 }}>TG<span style={{color:'#2AABEE'}}>Only</span> <span style={{color:'#8888aa',fontSize:13,fontWeight:400}}>Intelligence</span></span>
          <div style={{ display:'flex', gap:4 }}>
            {(['overview','coverage','scraper','dedup','seo'] as const).map(t => (
              <button key={t} onClick={()=>setTab(t)} style={tabBtn(tab===t)}>
                {t==='overview'?'📊 Overview':t==='coverage'?'🗺️ Cobertura':t==='scraper'?'🔍 Scraper':t==='dedup'?'🔄 Deduplicar':'✍️ SEO'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {stats && <span style={{ fontSize:12, color:'#8888aa' }}>{stats.total} creadoras en DB</span>}
          <button onClick={loadStats} style={btnGhost}>↻ Sync</button>
          <a href="/admin" style={{ ...btnGhost, textDecoration:'none', fontSize:13 }}>← Admin</a>
        </div>
      </div>

      {/* Notificación */}
      {msg && (
        <div style={{ position:'fixed', top:70, right:24, zIndex:200, background:msg.ok?'rgba(34,197,94,0.95)':'rgba(255,95,109,0.95)', color:msg.ok?'#000':'#fff', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, ...f }}>
          {msg.text}
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <>
            {loading ? <p style={{color:'#8888aa'}}>Cargando...</p> : stats && (
              <>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                  {[
                    { n:stats.total, l:'Total en DB', color:'#2AABEE' },
                    { n:`${Math.round(stats.withLink/stats.total*100)}%`, l:'Cobertura links', color:'#22c55e', sub:`${stats.withLink}/${stats.total}` },
                    { n:`${Math.round(stats.withPhoto/stats.total*100)}%`, l:'Con foto', color:'#f5a623', sub:`${stats.noPhoto} sin foto` },
                    { n:`${Math.round(stats.withDesc/stats.total*100)}%`, l:'Con descripción SEO', color:'#a78bfa', sub:`${stats.noDesc} sin desc` },
                  ].map(s => (
                    <div key={s.l} style={card}>
                      <div style={{ fontSize:32, fontWeight:700, color:s.color, marginBottom:4 }}>{s.n}</div>
                      <div style={{ fontSize:11, color:'#8888aa', textTransform:'uppercase', letterSpacing:'.06em' }}>{s.l}</div>
                      {s.sub && <div style={{ fontSize:11, color:'#555', marginTop:4 }}>{s.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Barras de progreso */}
                <div style={card}>
                  <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:16 }}>Estado de la base de datos</p>
                  {[
                    { label:'Links', n:stats.withLink, total:stats.total, color:'#2AABEE' },
                    { label:'Fotos', n:stats.withPhoto, total:stats.total, color:'#22c55e' },
                    { label:'Descripciones SEO', n:stats.withDesc, total:stats.total, color:'#a78bfa' },
                  ].map(b => (
                    <div key={b.label} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                        <span style={{ color:'#8888aa' }}>{b.label}</span>
                        <span style={{ fontWeight:700 }}>{b.n} / {b.total}</span>
                      </div>
                      <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.round(b.n/b.total*100)}%`, background:b.color, borderRadius:4, transition:'width .5s' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Acciones rápidas */}
                <div style={card}>
                  <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:14 }}>Acciones rápidas</p>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <button onClick={()=>setTab('scraper')} style={btnBlue}>🔍 Buscar creadoras nuevas</button>
                    <button onClick={()=>{setTab('dedup');runDedup()}} style={btnGhost}>🔄 Detectar duplicados</button>
                    <button onClick={()=>setTab('seo')} style={btnGhost}>✍️ Generar SEO masivo</button>
                    <button onClick={()=>{setTab('coverage');setCoverFilter('nolink')}} style={btnGhost}>🔗 Ver sin link ({stats.noLink})</button>
                    <button onClick={()=>{setTab('coverage');setCoverFilter('nophoto')}} style={btnGhost}>🖼️ Ver sin foto ({stats.noPhoto})</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ═══ COBERTURA ═══ */}
        {tab === 'coverage' && (
          <div style={card}>
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
              <input value={coverSearch} onChange={e=>setCoverSearch(e.target.value)} placeholder="🔍 Buscar creadora..." style={{...inp, maxWidth:280}} />
              <select value={coverFilter} onChange={e=>setCoverFilter(e.target.value)} style={{...inp, maxWidth:200, color:'#f0eff8'}}>
                <option value="all">Todas ({groups.length})</option>
                <option value="complete">Completas</option>
                <option value="nolink">Sin link ({stats?.noLink})</option>
                <option value="nophoto">Sin foto ({stats?.noPhoto})</option>
                <option value="nodesc">Sin descripción ({stats?.noDesc})</option>
              </select>
              <span style={{ fontSize:12, color:'#8888aa', marginLeft:'auto' }}>{filteredGroups.length} resultados</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Creadora','Link','Foto','Descripción SEO','Acciones'].map(h => (
                    <th key={h} style={{ fontSize:11, color:'#8888aa', textTransform:'uppercase', letterSpacing:'.06em', padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', textAlign:'left', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGroups.slice(0,50).map(g => (
                  <tr key={g.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {g.photo_url
                          ? <img src={`/api/photo?id=${g.id}`} alt={g.name} style={{ width:32, height:32, borderRadius:8, objectFit:'cover' }} />
                          : <div style={{ width:32, height:32, borderRadius:8, background:'rgba(42,171,238,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📱</div>
                        }
                        <span style={{ fontWeight:600, fontSize:13 }}>{g.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      {g.link && g.link !== '#'
                        ? <span style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#22c55e', borderRadius:6, padding:'2px 8px', fontSize:11 }}>✓ Tiene</span>
                        : <span style={{ background:'rgba(255,95,109,0.1)', border:'1px solid rgba(255,95,109,0.2)', color:'#ff5f6d', borderRadius:6, padding:'2px 8px', fontSize:11 }}>✗ Falta</span>}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      {g.photo_url
                        ? <span style={{ color:'#22c55e', fontSize:13 }}>✓</span>
                        : <span style={{ color:'#555', fontSize:13 }}>—</span>}
                    </td>
                    <td style={{ padding:'10px 12px', maxWidth:300 }}>
                      {g.description
                        ? <span style={{ fontSize:12, color:'#8888aa' }}>{g.description.slice(0,60)}...</span>
                        : <span style={{ background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', color:'#f5a623', borderRadius:6, padding:'2px 8px', fontSize:11 }}>Sin SEO</span>}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      {!g.description && (
                        <button onClick={()=>{setTab('seo');setSeoGroup(g);generateSEO(g)}} style={{ ...btnBlue, padding:'4px 10px', fontSize:11 }}>
                          ✍️ Generar SEO
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredGroups.length > 50 && <p style={{ fontSize:12, color:'#8888aa', marginTop:12, textAlign:'center' }}>Mostrando 50 de {filteredGroups.length}</p>}
          </div>
        )}

        {/* ═══ SCRAPER ═══ */}
        {tab === 'scraper' && (
          <>
            <div style={card}>
              <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:14 }}>Configurar búsqueda</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, color:'#8888aa', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>País / Región</label>
                  <select value={scCountry} onChange={e=>setScCountry(e.target.value)} style={{...inp, color:'#f0eff8'}}>
                    <option value="mexico">México</option>
                    <option value="colombia">Colombia</option>
                    <option value="argentina">Argentina</option>
                    <option value="latam">LATAM</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, color:'#8888aa', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>Keyword (opcional)</label>
                  <input value={scKeyword} onChange={e=>setScKeyword(e.target.value)} placeholder="Ej: fitness, modelo, influencer..." style={inp} />
                </div>
                <div style={{ display:'flex', alignItems:'flex-end' }}>
                  <button onClick={runScraper} disabled={scLoading} style={{ ...btnBlue, width:'100%', opacity:scLoading?0.5:1 }}>
                    {scLoading ? '⏳ Buscando...' : '🔍 Iniciar scraping'}
                  </button>
                </div>
              </div>
              {scLog.length > 0 && (
                <div style={{ background:'#0d0d14', borderRadius:8, padding:12 }}>
                  {scLog.map((l,i) => <div key={i} style={{ fontSize:12, color:'#8888aa', padding:'3px 0' }}>→ {l}</div>)}
                </div>
              )}
            </div>

            {scResults.length > 0 && (
              <div style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <p style={{ fontFamily:syne, fontWeight:700, fontSize:14 }}>{scResults.length} resultados encontrados</p>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>setSelected(new Set(scResults.map((_,i)=>i)))} style={btnGhost}>Seleccionar todos</button>
                    <button onClick={importSelected} disabled={selected.size===0} style={{ ...btnGreen, opacity:selected.size===0?0.5:1 }}>
                      ⬇️ Importar ({selected.size}) a DB
                    </button>
                  </div>
                </div>

                {scResults.map((r,i) => (
                  <div key={i} onClick={()=>setSelected(prev=>{const s=new Set(prev);s.has(i)?s.delete(i):s.add(i);return s})}
                    style={{ background: selected.has(i)? 'rgba(42,171,238,0.06)' : '#0d0d14', border:`1px solid ${selected.has(i)?'rgba(42,171,238,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:10, padding:14, marginBottom:8, cursor:'pointer', transition:'all .15s' }}>
                    <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                      <div style={{ width:20, height:20, border:`2px solid ${selected.has(i)?'#2AABEE':'rgba(255,255,255,0.2)'}`, borderRadius:4, background:selected.has(i)?'#2AABEE':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                        {selected.has(i) && <span style={{ color:'#000', fontSize:12, fontWeight:700 }}>✓</span>}
                      </div>
                      {r.photo_url && <img src={r.photo_url} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }} />}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{r.name || r.title}</span>
                          <span style={{ background:'rgba(42,171,238,0.1)', color:'#2AABEE', border:'1px solid rgba(42,171,238,0.2)', borderRadius:6, padding:'2px 8px', fontSize:11 }}>{r.source}</span>
                        </div>
                        {r.description && <p style={{ fontSize:12, color:'#8888aa', marginBottom:6, lineHeight:1.5 }}>{r.description.slice(0,120)}</p>}
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          {r.tgLinks?.map((l,j) => <a key={j} href={l} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:11, color:'#2AABEE', textDecoration:'none' }}>🔗 {l.slice(0,35)}</a>)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ DEDUPLICAR ═══ */}
        {tab === 'dedup' && (
          <div style={card}>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
              <div style={{ flex:1 }}>
                <label style={{ display:'block', fontSize:11, color:'#8888aa', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>
                  Umbral de similitud: <strong style={{ color:'#f5a623' }}>{threshold}%</strong>
                </label>
                <input type="range" min={50} max={99} step={5} value={threshold} onChange={e=>setThreshold(parseInt(e.target.value))} style={{ width:'100%' }} />
              </div>
              <button onClick={runDedup} disabled={dedupLoading} style={{ ...btnBlue, opacity:dedupLoading?0.5:1, whiteSpace:'nowrap' }}>
                {dedupLoading ? '⏳ Analizando...' : '🔄 Detectar duplicados'}
              </button>
            </div>

            {dedupPairs.length === 0 && !dedupLoading && (
              <p style={{ color:'#22c55e', textAlign:'center', padding:'40px 0', fontSize:14 }}>✅ No se detectaron duplicados con ese umbral</p>
            )}

            {dedupPairs.map((pair,i) => (
              <div key={i} style={{ background:'#0d0d14', border:'1px solid rgba(245,166,35,0.2)', borderRadius:10, padding:16, marginBottom:10 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                  <div style={{ flex:1, padding:'8px 12px', background:'#111118', borderRadius:8, fontSize:13, fontWeight:600 }}>{pair.a.name}</div>
                  <span style={{ color:'#f5a623', fontWeight:700, fontSize:12 }}>≈ {pair.similarity}%</span>
                  <div style={{ flex:1, padding:'8px 12px', background:'#111118', borderRadius:8, fontSize:13, fontWeight:600 }}>{pair.b.name}</div>
                </div>
                <div style={{ height:4, background:'rgba(245,166,35,0.12)', borderRadius:2, overflow:'hidden', marginBottom:10 }}>
                  <div style={{ height:'100%', width:`${pair.similarity}%`, background:'#f5a623', borderRadius:2 }} />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>deleteDup(pair.b.id)} style={btnRed}>🗑 Eliminar "{pair.b.name.split(' ')[0]}"</button>
                  <button onClick={()=>deleteDup(pair.a.id)} style={btnRed}>🗑 Eliminar "{pair.a.name.split(' ')[0]}"</button>
                  <button onClick={()=>setDedupPairs(prev=>prev.filter((_,j)=>j!==i))} style={btnGhost}>Ignorar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ SEO ═══ */}
        {tab === 'seo' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <div style={card}>
                <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:14 }}>Generar descripción individual</p>
                <div style={{ marginBottom:10 }}>
                  <label style={{ display:'block', fontSize:11, color:'#8888aa', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>Creadora</label>
                  <select value={seoGroup?.id||''} onChange={e=>{const g=groups.find(x=>x.id===e.target.value)||null;setSeoGroup(g)}} style={{...inp,color:'#f0eff8'}}>
                    <option value="">Selecciona una creadora...</option>
                    {groups.filter(g=>!g.description).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <button onClick={()=>seoGroup&&generateSEO(seoGroup)} disabled={!seoGroup||seoLoading} style={{ ...btnBlue, width:'100%', opacity:(!seoGroup||seoLoading)?0.5:1 }}>
                  {seoLoading?'⏳ Generando...':'✍️ Generar con IA'}
                </button>

                {seoResult && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ background:'#0d0d14', border:'1px solid rgba(42,171,238,0.15)', borderRadius:8, padding:14, fontSize:13, lineHeight:1.8, color:'#f0eff8', marginBottom:10 }}>{seoResult}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                      {seoTags.map(t=><span key={t} style={{ background:'rgba(42,171,238,0.1)', border:'1px solid rgba(42,171,238,0.2)', color:'#2AABEE', borderRadius:20, padding:'2px 10px', fontSize:11 }}>#{t}</span>)}
                    </div>
                    <button onClick={()=>navigator.clipboard.writeText(seoResult)} style={btnGhost}>📋 Copiar descripción</button>
                  </div>
                )}
              </div>

              <div style={card}>
                <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:8 }}>Proceso masivo</p>
                <p style={{ fontSize:12, color:'#8888aa', marginBottom:14 }}>
                  {groups.filter(g=>!g.description).length} creadoras sin descripción SEO
                </p>
                <button onClick={runBatchSEO} disabled={batchRunning} style={{ ...btnGreen, width:'100%', opacity:batchRunning?0.5:1 }}>
                  {batchRunning?'⏳ Procesando...':'⚡ Generar todas (hasta 20)'}
                </button>
                {batchLog.length > 0 && (
                  <div style={{ background:'#0d0d14', borderRadius:8, padding:12, marginTop:12, maxHeight:200, overflowY:'auto' }}>
                    {batchLog.map((l,i)=><div key={i} style={{ fontSize:12, color: l.startsWith('✅')?'#22c55e':'#8888aa', padding:'2px 0' }}>{l}</div>)}
                  </div>
                )}
              </div>
            </div>

            <div style={card}>
              <p style={{ fontFamily:syne, fontWeight:700, fontSize:14, marginBottom:14 }}>Sin descripción SEO — {groups.filter(g=>!g.description).length} grupos</p>
              <div style={{ maxHeight:600, overflowY:'auto' }}>
                {groups.filter(g=>!g.description).map(g=>(
                  <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ flex:1, fontSize:13 }}>{g.name}</span>
                    <button onClick={()=>{setSeoGroup(g);generateSEO(g)}} style={{ ...btnBlue, padding:'4px 10px', fontSize:11 }}>✍️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
