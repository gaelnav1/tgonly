'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'

const CATEGORIES = ['cripto','gaming','apuestas','entretenimiento','tech','salud','negocios','deportes','noticias','fans','gallos','marketplace','trabajos-latam','grupos-militares-en-mexico','trabajadores']

type Group = { id:string;name:string;username?:string;description?:string;members:number;category:string;link:string;photo_url?:string;verified:boolean;trending:boolean;score:number;tags?:string[];emoji?:string;created_at:string }
type PendingGroup = { id:string;name:string;description?:string;members:number;category:string;link:string;photo_url?:string;submitter_name?:string;submitter_email?:string;created_at:string;tags?:string[] }
type PendingCat = { id:string;name:string;slug:string;emoji:string;description?:string;submitter_email?:string;created_at:string }
type SyncEntry = { name:string;link:string;status:string;method:string;photo:string }

const f: React.CSSProperties = { fontFamily:"'DM Sans',sans-serif" }
const syne = "'Syne',sans-serif"

export default function AdminPage() {
  const [password, setPassword]     = useState('')
  const [authed, setAuthed]         = useState(false)
  const [authError, setAuthError]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [tab, setTab]               = useState<'grupos'|'pendientes'|'categorias'>('grupos')
  const [message, setMessage]       = useState<{text:string;ok:boolean}|null>(null)
  const [groups, setGroups]         = useState<Group[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [filterCat, setFilterCat]   = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [editingId, setEditingId]   = useState<string|null>(null)
  const [editData, setEditData]     = useState<Partial<Group>>({})
  const [pending, setPending]       = useState<PendingGroup[]>([])
  const [pendingCats, setPendingCats] = useState<PendingCat[]>([])
  const [syncing, setSyncing]       = useState(false)
  const [syncCat, setSyncCat]         = useState('')
  const [fetchingPhoto, setFetchingPhoto] = useState<string|null>(null)
  const [syncLog, setSyncLog]       = useState<SyncEntry[]>([])
  const [showLog, setShowLog]       = useState(false)

  function notify(text:string, ok=true) { setMessage({text,ok}); setTimeout(()=>setMessage(null),3000) }

  async function handleLogin() {
    setLoading(true); setAuthError('')
    try {
      const [gRes,pRes,cRes] = await Promise.all([
        fetch('/api/admin/grupos',{headers:{'x-admin-password':password}}),
        fetch('/api/admin',{headers:{'x-admin-password':password}}),
        fetch('/api/categorias',{headers:{'x-admin-password':password}}),
      ])
      if (gRes.status===401) { setAuthError('Contrasena incorrecta'); setLoading(false); return }
      const [gData,pData,cData] = await Promise.all([gRes.json(),pRes.json(),cRes.json()])
      setGroups(Array.isArray(gData)?gData:[])
      setPending(Array.isArray(pData)?pData:[])
      setPendingCats(Array.isArray(cData)?cData:[])
      setAuthed(true)
    } catch { setAuthError('Error de conexion') }
    finally { setLoading(false) }
  }

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true)
    let url = `/api/admin/grupos?`
    if (filterCat) url += `category=${filterCat}&`
    if (filterSearch) url += `search=${encodeURIComponent(filterSearch)}`
    const res = await fetch(url,{headers:{'x-admin-password':password}})
    const data = await res.json()
    setGroups(Array.isArray(data)?data:[])
    setGroupsLoading(false)
  }, [filterCat,filterSearch,password])

  async function fetchOnePhoto(id: string, name: string, link: string) {
    setFetchingPhoto(id)
    try {
      const res = await fetch('/api/admin/sync-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ single: true, id, name, link })
      })
      const d = await res.json()
      if (d.log?.[0]?.photo) {
        notify(`✅ ${name} — foto obtenida`)
        // Si estamos editando este grupo, actualizar el preview
        if (editingId === id) {
          setEditData(p => ({...p, photo_url: d.log[0].photo}))
        }
        fetchGroups()
      } else {
        notify(`❌ ${name} — ${d.log?.[0]?.method || 'sin foto disponible'}`, false)
      }
    } catch { notify('Error', false) }
    finally { setFetchingPhoto(null) }
  }

  async function syncPhotos() {
    setSyncing(true); setSyncLog([]); setShowLog(false)
    try {
      const res = await fetch('/api/admin/sync-photos',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({category:syncCat})})
      const d = await res.json()
      notify(d.message||'Sincronizacion completada')
      if (d.log) { setSyncLog(d.log); setShowLog(true) }
      fetchGroups()
    } catch { notify('Error al sincronizar',false) }
    finally { setSyncing(false) }
  }

  async function quickToggle(id:string, field:'verified'|'trending', value:boolean) {
    setGroups(prev=>prev.map(g=>g.id===id?{...g,[field]:value}:g))
    const res = await fetch('/api/admin/grupos',{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({id,[field]:value})})
    const d = await res.json()
    if (d.ok) notify(field==='verified'?(value?'✓ Verificado':'Verificacion removida'):(value?'🔥 Trending activado':'Trending removido'))
    else notify('Error',false)
  }

  function startEdit(g:Group) {
    setEditingId(g.id)
    setEditData({name:g.name,description:g.description||'',members:g.members,link:g.link,category:g.category,tags:g.tags||[],photo_url:g.photo_url||'',score:g.score,emoji:g.emoji||'📱'})
  }

  async function saveEdit() {
    if (!editingId) return
    const tagsVal = typeof editData.tags==='string'?(editData.tags as string).split(',').map((t:string)=>t.trim()).filter(Boolean):editData.tags
    const res = await fetch('/api/admin/grupos',{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({id:editingId,...editData,tags:tagsVal})})
    const d = await res.json()
    if (d.ok) { notify('Grupo actualizado'); setEditingId(null); fetchGroups() }
    else notify('Error al guardar',false)
  }

  async function deleteGroup(id:string,name:string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    const res = await fetch('/api/admin/grupos',{method:'DELETE',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({id})})
    const d = await res.json()
    if (d.ok) { notify('Grupo eliminado'); setGroups(prev=>prev.filter(g=>g.id!==id)) }
    else notify('Error',false)
  }

  async function handlePending(id:string,action:'aprobar'|'rechazar') {
    const res = await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({id,action})})
    const d = await res.json()
    if (d.ok) { notify(d.message); setPending(prev=>prev.filter(g=>g.id!==id)) }
  }

  async function handleCat(id:string,action:'aprobar'|'rechazar') {
    const res = await fetch('/api/categorias',{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({id,action})})
    const d = await res.json()
    if (d.ok) { notify(d.message); setPendingCats(prev=>prev.filter(c=>c.id!==id)) }
  }

  const card:    React.CSSProperties = {background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:18,marginBottom:12}
  const inp:     React.CSSProperties = {background:'#1c1c27',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'9px 12px',color:'#f0eff8',...f,fontSize:14,outline:'none',width:'100%'}
  const btnBlue: React.CSSProperties = {background:'#2AABEE',color:'#000',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:13,cursor:'pointer',...f}
  const btnGreen:React.CSSProperties = {background:'#22c55e',color:'#000',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:13,cursor:'pointer',...f}
  const btnRed:  React.CSSProperties = {background:'#ff5f6d',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:13,cursor:'pointer',...f}
  const btnGray: React.CSSProperties = {background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'#8888aa',borderRadius:8,padding:'7px 16px',fontSize:13,cursor:'pointer',...f}

  if (!authed) {
    return (
      <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#f0eff8',...f,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,padding:40,width:'100%',maxWidth:400}}>
          <h1 style={{fontFamily:syne,fontWeight:800,fontSize:24,marginBottom:8,textAlign:'center'}}>TG<span style={{color:'#2AABEE'}}>Only</span> Admin</h1>
          <p style={{color:'#8888aa',fontSize:13,textAlign:'center',marginBottom:28}}>Panel de administracion</p>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Contrasena" style={{...inp,marginBottom:12}} />
          {authError && <p style={{color:'#ff5f6d',fontSize:13,marginBottom:12}}>{authError}</p>}
          <button onClick={handleLogin} disabled={loading} style={{...btnBlue,width:'100%',padding:'12px',fontSize:15}}>
            {loading?'Verificando...':'Entrar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#f0eff8',...f}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',height:60,background:'rgba(10,10,15,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <span style={{fontFamily:syne,fontWeight:800,fontSize:18}}>TG<span style={{color:'#2AABEE'}}>Only</span> <span style={{color:'#8888aa',fontSize:13,fontWeight:400}}>Admin</span></span>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{color:'#8888aa',fontSize:13}}>{groups.length} grupos · {pending.length+pendingCats.length} pendientes</span>
          <Link href="/" style={{color:'#8888aa',textDecoration:'none',fontSize:13}}>← Sitio</Link>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'72px 24px 60px'}}>

        {message && (
          <div style={{position:'fixed',top:72,right:24,zIndex:200,background:message.ok?'rgba(34,197,94,0.95)':'rgba(255,95,109,0.95)',color:message.ok?'#000':'#fff',borderRadius:10,padding:'10px 20px',fontSize:14,fontWeight:600,...f}}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:6,marginBottom:28,background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:4,maxWidth:520}}>
          {([
            {key:'grupos',    label:`📋 Todos (${groups.length})`},
            {key:'pendientes',label:`⏳ Pendientes (${pending.length})`},
            {key:'categorias',label:`📂 Categorias (${pendingCats.length})`},
          ] as const).map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,padding:'9px 8px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:tab===t.key?'#2AABEE':'transparent',color:tab===t.key?'#000':'#8888aa',...f,whiteSpace:'nowrap'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── GRUPOS ── */}
        {tab === 'grupos' && (
          <div>
            {/* Filtros */}
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <input value={filterSearch} onChange={e=>setFilterSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inp,maxWidth:280}} />
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...inp,maxWidth:200,color:filterCat?'#f0eff8':'#8888aa'}}>
                <option value="">Todas las categorias</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={fetchGroups} style={btnGray}>Actualizar</button>
              <select value={syncCat} onChange={e=>setSyncCat(e.target.value)} style={{...inp,maxWidth:180,color:syncCat?'#f0eff8':'#8888aa'}}>
                <option value="">Todas las categorias</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={syncPhotos} disabled={syncing} style={{...btnBlue,opacity:syncing?0.6:1}}>
                {syncing?'⏳ Sincronizando...':'📸 Sincronizar fotos'}
              </button>
              {(filterCat||filterSearch) && <button onClick={()=>{setFilterCat('');setFilterSearch('')}} style={btnGray}>Limpiar</button>}
            </div>

            {/* Log de sync */}
            {showLog && syncLog.length > 0 && (
              <div style={{background:'#0d0d14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:16,marginBottom:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontFamily:syne,fontWeight:700,fontSize:14,color:'#f0eff8'}}>📋 Log ({syncLog.length} grupos)</span>
                  <button onClick={()=>setShowLog(false)} style={btnGray}>Cerrar</button>
                </div>
                <div style={{maxHeight:400,overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>
                  {syncLog.map((l,i) => (
                    <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 10px',background:'rgba(255,255,255,0.03)',borderRadius:8,fontSize:12}}>
                      {l.photo
                        ? <img src={`/api/photo?url=${encodeURIComponent(l.photo)}`} alt={l.name} style={{width:32,height:32,borderRadius:8,objectFit:'cover',flexShrink:0}} />
                        : <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.05)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>📱</div>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{color:'#f0eff8',fontWeight:600,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</p>
                        <p style={{color:'#8888aa',marginBottom:2}}>{l.status} · <span style={{color:'#555'}}>{l.method}</span></p>
                        {l.link && l.link!=='#'
                          ? <a href={l.link} target="_blank" rel="noopener noreferrer" style={{color:'#2AABEE',textDecoration:'none',fontSize:11}}>{l.link.slice(0,50)}</a>
                          : <span style={{color:'#ff5f6d',fontSize:11}}>⚠️ Sin link de Telegram</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de grupos */}
            {groupsLoading
              ? <div style={{textAlign:'center',padding:'40px 0',color:'#8888aa'}}>Cargando...</div>
              : groups.length === 0
                ? <div style={{textAlign:'center',padding:'60px 0',color:'#8888aa'}}><p style={{fontSize:40,marginBottom:12}}>🔍</p><p>No se encontraron grupos</p></div>
                : groups.map(g => (
                  <div key={g.id} style={card}>
                    {editingId === g.id ? (
                      <div>
                        <p style={{fontFamily:syne,fontWeight:700,fontSize:15,color:'#2AABEE',marginBottom:16}}>Editando: {g.name}</p>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Nombre</label><input value={editData.name||''} onChange={e=>setEditData(p=>({...p,name:e.target.value}))} style={inp} /></div>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Miembros</label><input type="number" value={editData.members||0} onChange={e=>setEditData(p=>({...p,members:parseInt(e.target.value)||0}))} style={inp} /></div>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Link</label><input value={editData.link||''} onChange={e=>setEditData(p=>({...p,link:e.target.value}))} style={inp} /></div>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Categoria</label>
                            <select value={editData.category||''} onChange={e=>setEditData(p=>({...p,category:e.target.value}))} style={{...inp,color:'#f0eff8'}}>
                              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Emoji</label><input value={editData.emoji||''} onChange={e=>setEditData(p=>({...p,emoji:e.target.value}))} style={{...inp,fontSize:20}} /></div>
                          <div><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Score</label><input type="number" min="1" max="100" value={editData.score||50} onChange={e=>setEditData(p=>({...p,score:parseInt(e.target.value)||50}))} style={inp} /></div>
                        </div>
                        <div style={{marginBottom:12}}><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Descripcion</label><textarea value={editData.description||''} onChange={e=>setEditData(p=>({...p,description:e.target.value}))} rows={2} style={{...inp,resize:'vertical'}} /></div>
                        <div style={{marginBottom:12}}><label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:4}}>Tags (coma separados)</label><input value={Array.isArray(editData.tags)?editData.tags.join(', '):editData.tags||''} onChange={e=>setEditData(p=>({...p,tags:e.target.value as any}))} style={inp} /></div>
                        <div style={{marginBottom:16}}>
                          <label style={{fontSize:12,color:'#8888aa',display:'block',marginBottom:6}}>Foto de perfil</label>
                          <div style={{display:'flex',gap:8,marginBottom:8}}>
                            <input value={editData.photo_url||''} onChange={e=>setEditData(p=>({...p,photo_url:e.target.value}))} style={{...inp,flex:1}} placeholder="https://..." />
                            <button onClick={()=>fetchOnePhoto(editingId!,editData.name||'',editData.link||'')} disabled={fetchingPhoto===editingId}
                              style={{...btnBlue,whiteSpace:'nowrap',opacity:fetchingPhoto===editingId?0.5:1,flexShrink:0}}>
                              {fetchingPhoto===editingId?'⏳':'📸'} Obtener
                            </button>
                          </div>
                          {editData.photo_url && (
                            <div style={{display:'flex',gap:10,alignItems:'center',background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'8px 12px'}}>
                              <img src={`/api/photo?url=${encodeURIComponent(editData.photo_url)}`} alt="preview" style={{width:48,height:48,borderRadius:10,objectFit:'cover',flexShrink:0}} />
                              <div>
                                <p style={{fontSize:12,color:'#8888aa',marginBottom:4}}>Preview foto actual</p>
                                <button onClick={()=>setEditData(p=>({...p,photo_url:''}))} style={{fontSize:11,color:'#ff5f6d',background:'none',border:'none',cursor:'pointer',padding:0,...f}}>✕ Quitar foto</button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={saveEdit} style={btnGreen}>💾 Guardar</button>
                          <button onClick={()=>setEditingId(null)} style={btnGray}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                          <div style={{position:'relative',width:52,height:52,flexShrink:0}}>
                            <div style={{position:'absolute',inset:0,borderRadius:12,background:'rgba(42,171,238,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{g.emoji||'📱'}</div>
                            {g.photo_url && <img src={`/api/photo?url=${encodeURIComponent(g.photo_url)}`} alt={g.name} style={{position:'absolute',inset:0,width:52,height:52,borderRadius:12,objectFit:'cover',zIndex:1}} />}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                              <span style={{fontFamily:syne,fontWeight:700,fontSize:15,color:'#f0eff8'}}>{g.name}</span>
                              {g.verified && <span style={{background:'#2AABEE',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#000'}}>✓</span>}
                              {g.trending && <span>🔥</span>}
                              <span style={{background:'rgba(42,171,238,0.1)',border:'1px solid rgba(42,171,238,0.2)',borderRadius:6,padding:'2px 8px',fontSize:11,color:'#2AABEE'}}>{g.category}</span>
                              <span style={{fontSize:11,color:'#8888aa'}}>score:{g.score}</span>
                            </div>
                            <div style={{fontSize:12,color:'#3dd68c',fontWeight:600,marginBottom:4}}>{g.members?.toLocaleString('es')} miembros</div>
                            {g.description && <p style={{fontSize:12,color:'#8888aa',margin:'0 0 4px',lineHeight:1.5}}>{g.description.slice(0,100)}{g.description.length>100?'...':''}</p>}
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                            <button onClick={()=>quickToggle(g.id,'verified',!g.verified)} style={{...g.verified?btnBlue:btnGray,padding:'5px 12px',fontSize:12}}>
                              {g.verified?'✓ Verificado':'○ Verificar'}
                            </button>
                            <button onClick={()=>quickToggle(g.id,'trending',!g.trending)} style={{background:g.trending?'rgba(245,166,35,0.15)':'transparent',color:g.trending?'#f5a623':'#8888aa',border:`1px solid ${g.trending?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.12)'}`,borderRadius:8,padding:'5px 12px',fontSize:12,cursor:'pointer',...f}}>
                              {g.trending?'🔥 Trending':'○ Trending'}
                            </button>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8,marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)',flexWrap:'wrap'}}>
                          <button onClick={()=>startEdit(g)} style={btnBlue}>✏️ Editar</button>
                          <a href={g.link} target="_blank" rel="noopener noreferrer" style={{...btnGray,textDecoration:'none'}}>🔗 Telegram</a>
                          {!g.photo_url && (
                            <button
                              onClick={()=>fetchOnePhoto(g.id, g.name, g.link||'')}
                              disabled={fetchingPhoto===g.id}
                              style={{...btnGray, color:'#2AABEE', borderColor:'rgba(42,171,238,0.3)', opacity:fetchingPhoto===g.id?0.5:1}}>
                              {fetchingPhoto===g.id ? '⏳ Buscando...' : '📸 Obtener foto'}
                            </button>
                          )}
                          <button onClick={()=>deleteGroup(g.id,g.name)} style={{...btnRed,marginLeft:'auto'}}>🗑 Eliminar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        )}

        {/* ── PENDIENTES ── */}
        {tab === 'pendientes' && (
          pending.length === 0
            ? <div style={{textAlign:'center',padding:'60px 0',color:'#8888aa'}}><p style={{fontSize:40,marginBottom:12}}>🎉</p><p>No hay grupos pendientes</p></div>
            : <div>
                {pending.map(g => (
                  <div key={g.id} style={card}>
                    <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
                      <div style={{position:'relative',width:52,height:52,flexShrink:0}}>
                        <div style={{position:'absolute',inset:0,borderRadius:12,background:'rgba(42,171,238,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>📱</div>
                        {g.photo_url && <img src={`/api/photo?url=${encodeURIComponent(g.photo_url)}`} alt={g.name} style={{position:'absolute',inset:0,width:52,height:52,borderRadius:12,objectFit:'cover',zIndex:1}} />}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <span style={{fontFamily:syne,fontWeight:700,fontSize:15,color:'#f0eff8'}}>{g.name}</span>
                          <span style={{background:'rgba(42,171,238,0.1)',border:'1px solid rgba(42,171,238,0.2)',borderRadius:6,padding:'2px 8px',fontSize:11,color:'#2AABEE'}}>{g.category}</span>
                        </div>
                        <p style={{fontSize:12,color:'#3dd68c',fontWeight:600,marginBottom:4}}>{g.members?.toLocaleString('es')} miembros</p>
                        {g.description && <p style={{fontSize:12,color:'#8888aa',lineHeight:1.5,marginBottom:6}}>{g.description}</p>}
                        <div style={{display:'flex',gap:12,fontSize:11,color:'#8888aa',flexWrap:'wrap'}}>
                          <a href={g.link} target="_blank" rel="noopener noreferrer" style={{color:'#2AABEE',textDecoration:'none'}}>🔗 {g.link}</a>
                          {g.submitter_email && <span>📧 {g.submitter_email}</span>}
                          <span>🕐 {new Date(g.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:12}}>
                      <button onClick={()=>handlePending(g.id,'aprobar')} style={btnGreen}>✅ Aprobar</button>
                      <button onClick={()=>handlePending(g.id,'rechazar')} style={btnRed}>❌ Rechazar</button>
                      <a href={g.link} target="_blank" rel="noopener noreferrer" style={{...btnGray,textDecoration:'none'}}>Ver en Telegram →</a>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* ── CATEGORIAS ── */}
        {tab === 'categorias' && (
          pendingCats.length === 0
            ? <div style={{textAlign:'center',padding:'60px 0',color:'#8888aa'}}><p style={{fontSize:40,marginBottom:12}}>🎉</p><p>No hay categorias pendientes</p></div>
            : <div>
                {pendingCats.map(cat => (
                  <div key={cat.id} style={card}>
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
                      <div style={{width:52,height:52,borderRadius:12,background:'rgba(42,171,238,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{cat.emoji}</div>
                      <div style={{flex:1}}>
                        <p style={{fontFamily:syne,fontWeight:700,fontSize:16,color:'#f0eff8',marginBottom:3}}>{cat.name}</p>
                        <p style={{fontSize:12,color:'#8888aa',marginBottom:3}}>URL: /grupos/{cat.slug}</p>
                        {cat.description && <p style={{fontSize:12,color:'#8888aa'}}>{cat.description}</p>}
                        <div style={{display:'flex',gap:12,fontSize:11,color:'#8888aa',marginTop:4}}>
                          {cat.submitter_email && <span>📧 {cat.submitter_email}</span>}
                          <span>🕐 {new Date(cat.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:12}}>
                      <button onClick={()=>handleCat(cat.id,'aprobar')} style={btnGreen}>✅ Aprobar</button>
                      <button onClick={()=>handleCat(cat.id,'rechazar')} style={btnRed}>❌ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
        )}

      </div>
    </div>
  )
}
