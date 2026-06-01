'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const CATEGORIES = [
  {slug:'cripto',name:'Cripto'},{slug:'gaming',name:'Gaming'},{slug:'tech',name:'Tech'},
  {slug:'entretenimiento',name:'Entretenimiento'},{slug:'deportes',name:'Deportes'},
  {slug:'noticias',name:'Noticias'},{slug:'negocios',name:'Negocios'},
  {slug:'salud',name:'Salud y Bienestar'},{slug:'apuestas',name:'Apuestas'},
  {slug:'marketplace',name:'Marketplace'},{slug:'trabajadores',name:'Trabajadores LATAM'},
  {slug:'fans',name:'Fans'},{slug:'gallos',name:'Gallos'},{slug:'otros',name:'Otros'},
]

type GroupPreview = { name:string; username:string|null; description:string; members:number; photo_url:string|null; link:string; type:string }

export default function AgregarPage() {
  const [tab, setTab] = useState<'grupo'|'categoria'>('grupo')
  const [tipo, setTipo] = useState<'publico'|'privado'>('publico')
  const [link, setLink] = useState('')
  const [preview, setPreview] = useState<GroupPreview|null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [privName, setPrivName] = useState('')
  const [privDesc, setPrivDesc] = useState('')
  const [privLink, setPrivLink] = useState('')
  const [privMembers, setPrivMembers] = useState('')
  const [privCategory, setPrivCategory] = useState('')
  const [privTags, setPrivTags] = useState('')
  const [catName, setCatName] = useState('')
  const [catEmoji, setCatEmoji] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catSuccess, setCatSuccess] = useState(false)
  const [catError, setCatError] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)

  async function handlePreview() {
    if (!link.trim()) return
    setLoadingPreview(true); setPreviewError(''); setPreview(null)
    try {
      const res = await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({link:link.trim()})})
      const data = await res.json()
      if (data.ok) setPreview(data.group)
      else setPreviewError(data.error||'No se pudo obtener el grupo')
    } catch { setPreviewError('Error de conexion') }
    finally { setLoadingPreview(false) }
  }

  async function handlePrivateVerify() {
    if (!privLink.trim()) return
    setLoadingPreview(true); setPreview(null)
    try {
      const res = await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({link:privLink.trim()})})
      const data = await res.json()
      if (data.ok) {
        setPreview(data.group)
        if (data.group.name && !privName) setPrivName(data.group.name)
        if (data.group.description && !privDesc) setPrivDesc(data.group.description)
        if (data.group.members && !privMembers) setPrivMembers(String(data.group.members))
      }
    } catch {}
    finally { setLoadingPreview(false) }
  }

  async function handleSubmit() {
    if (!preview || !category) return
    setSubmitting(true); setSubmitError('')
    try {
      const res = await fetch('/api/grupos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...preview,category,tags,submitter_name:submitterName,submitter_email:submitterEmail})})
      const data = await res.json()
      if (data.ok) setSuccess(true)
      else setSubmitError(data.error||'Error al enviar')
    } catch { setSubmitError('Error de conexion') }
    finally { setSubmitting(false) }
  }

  async function handlePrivateSubmit() {
    if (!privName || !privLink || !privCategory) return
    setSubmitting(true); setSubmitError('')
    try {
      const res = await fetch('/api/grupos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:privName,description:privDesc,link:privLink,members:parseInt(privMembers.replace(/[^0-9]/g,''))||0,category:privCategory,tags:privTags,submitter_name:submitterName,submitter_email:submitterEmail,photo_url:preview?.photo_url||null,username:null,type:'private'})})
      const data = await res.json()
      if (data.ok) setSuccess(true)
      else setSubmitError(data.error||'Error al enviar')
    } catch { setSubmitError('Error de conexion') }
    finally { setSubmitting(false) }
  }

  async function handleCategorySubmit() {
    if (!catName || !catEmoji) return
    setCatSubmitting(true); setCatError('')
    try {
      const res = await fetch('/api/categorias',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:catName,emoji:catEmoji,description:catDesc,submitter_name:submitterName,submitter_email:submitterEmail})})
      const data = await res.json()
      if (data.ok) setCatSuccess(true)
      else setCatError(data.error||'Error al enviar')
    } catch { setCatError('Error de conexion') }
    finally { setCatSubmitting(false) }
  }

  const inp = {width:'100%',background:'#1c1c27',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'12px 16px',color:'#f0eff8',fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:'none'} as React.CSSProperties
  const btn = (bg:string,color:string) => ({width:'100%',background:bg,color,border:'none',borderRadius:12,padding:'14px',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:16,cursor:'pointer'}) as React.CSSProperties

  if (success) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center',maxWidth:480,padding:'0 24px'}}>
        <div style={{fontSize:64,marginBottom:24}}>✅</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,color:'#f0eff8',marginBottom:16}}>Enviado</h1>
        <p style={{color:'#8888aa',lineHeight:1.8,marginBottom:32}}>Lo revisaremos en 24-48 horas.</p>
        <Link href="/" style={{background:'#2AABEE',color:'#000',fontWeight:700,padding:'12px 32px',borderRadius:12,textDecoration:'none'}}>Volver al inicio</Link>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#f0eff8',fontFamily:"'DM Sans',sans-serif"}}>
      <Navbar />
      <div style={{maxWidth:640,margin:'0 auto',padding:'80px 24px 80px'}}>
        <div style={{marginBottom:40,textAlign:'center',paddingTop:20}}>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'clamp(28px,5vw,40px)',marginBottom:12}}>
            Agrega tu grupo a <span style={{color:'#2AABEE'}}>TGOnly</span>
          </h1>
          <p style={{color:'#8888aa',fontSize:16,lineHeight:1.7}}>Gratis y sin registro. Revisado en 24-48 horas.</p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:24,background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:4}}>
          {[['grupo','📱 Agregar grupo'],['categoria','📂 Proponer categoria']].map(([t,l]) => (
            <button key={t} onClick={()=>setTab(t as any)} style={{flex:1,padding:'10px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:14,background:tab===t?'#2AABEE':'transparent',color:tab===t?'#000':'#8888aa',fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
          ))}
        </div>

        {/* Categoria form */}
        {tab==='categoria' && (catSuccess ? (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:'#f0eff8',marginBottom:8}}>Categoria enviada</h3>
            <p style={{color:'#8888aa'}}>La revisaremos en 24-48 horas.</p>
          </div>
        ) : (
          <div style={{background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:24}}>
            <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:12,marginBottom:14}}>
              <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Emoji *</label><input value={catEmoji} onChange={e=>setCatEmoji(e.target.value)} placeholder="🎮" style={{...inp,fontSize:22,textAlign:'center'}} /></div>
              <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Nombre *</label><input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Musica, Cocina..." style={inp} /></div>
            </div>
            <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Descripcion</label><input value={catDesc} onChange={e=>setCatDesc(e.target.value)} placeholder="¿De que tratan los grupos?" style={inp} /></div>
            {catError && <p style={{color:'#ff5f6d',fontSize:13,marginBottom:12}}>⚠️ {catError}</p>}
            <button onClick={handleCategorySubmit} disabled={!catName||!catEmoji||catSubmitting} style={{...btn('#2AABEE','#000'),opacity:(!catName||!catEmoji||catSubmitting)?0.5:1}}>
              {catSubmitting?'Enviando...':'📂 Proponer categoria'}
            </button>
          </div>
        ))}

        {/* Grupo form */}
        {tab==='grupo' && (<>
          <div style={{display:'flex',gap:8,marginBottom:20,background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:4}}>
            {[['publico','🌐 Grupo publico'],['privado','🔒 Grupo privado']].map(([t,l]) => (
              <button key={t} onClick={()=>setTipo(t as any)} style={{flex:1,padding:'9px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,background:tipo===t?'rgba(42,171,238,0.15)':'transparent',color:tipo===t?'#2AABEE':'#8888aa',fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>

          {/* Publico */}
          {tipo==='publico' && (<>
            <div style={{background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:24,marginBottom:16}}>
              <p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#8888aa',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Paso 1 — Link del grupo</p>
              <div style={{display:'flex',gap:10}}>
                <input value={link} onChange={e=>setLink(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePreview()} placeholder="https://t.me/tugrupo" style={{...inp,flex:1}} />
                <button onClick={handlePreview} disabled={loadingPreview||!link.trim()} style={{background:'#2AABEE',color:'#000',border:'none',borderRadius:10,padding:'12px 20px',fontWeight:700,fontSize:14,cursor:'pointer',opacity:(!link.trim()||loadingPreview)?0.5:1,fontFamily:"'DM Sans',sans-serif"}}>
                  {loadingPreview?'Cargando...':'Verificar'}
                </button>
              </div>
              {previewError && <p style={{color:'#ff5f6d',fontSize:13,marginTop:8}}>⚠️ {previewError}</p>}
            </div>

            {preview && (
              <div style={{background:'#111118',border:'1px solid rgba(42,171,238,0.3)',borderRadius:16,padding:24,marginBottom:16}}>
                <p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#2AABEE',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:16}}>✅ Grupo encontrado</p>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  {preview.photo_url ? <img src={`/api/photo?url=${encodeURIComponent(preview.photo_url)}`} alt={preview.name} style={{width:64,height:64,borderRadius:16,objectFit:'cover',flexShrink:0}} /> : <div style={{width:64,height:64,borderRadius:16,background:'rgba(42,171,238,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>📱</div>}
                  <div><p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:'#f0eff8',marginBottom:4}}>{preview.name}</p><p style={{fontSize:13,color:'#3dd68c',fontWeight:600}}>{preview.members?.toLocaleString('es')} miembros</p>{preview.description&&<p style={{fontSize:13,color:'#8888aa',lineHeight:1.6,marginTop:4}}>{preview.description}</p>}</div>
                </div>
              </div>
            )}

            {preview && (
              <div style={{background:'#111118',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:24,marginBottom:16}}>
                <p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#8888aa',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:20}}>Paso 2 — Detalles</p>
                <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Categoria *</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} style={{...inp,color:category?'#f0eff8':'#8888aa'}}>
                    <option value="">Selecciona...</option>{CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Tags</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="cripto, bitcoin" style={inp} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                  <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Tu nombre</label><input value={submitterName} onChange={e=>setSubmitterName(e.target.value)} placeholder="Juan" style={inp} /></div>
                  <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Email</label><input value={submitterEmail} onChange={e=>setSubmitterEmail(e.target.value)} placeholder="juan@email.com" type="email" style={inp} /></div>
                </div>
                {submitError&&<p style={{color:'#ff5f6d',fontSize:13,marginBottom:12}}>⚠️ {submitError}</p>}
                <button onClick={handleSubmit} disabled={!category||submitting} style={{...btn('#2AABEE','#000'),opacity:(!category||submitting)?0.5:1}}>
                  {submitting?'Enviando...':'Enviar grupo para revision'}
                </button>
              </div>
            )}
          </>)}

          {/* Privado */}
          {tipo==='privado' && (
            <div style={{background:'#111118',border:'1px solid rgba(245,166,35,0.2)',borderRadius:16,padding:24,marginBottom:16}}>
              <div style={{background:'rgba(42,171,238,0.06)',border:'1px solid rgba(42,171,238,0.2)',borderRadius:12,padding:16,marginBottom:20}}>
                <p style={{fontSize:14,color:'#f0eff8',fontWeight:600,marginBottom:8}}>📋 Para obtener la foto automaticamente</p>
                <p style={{fontSize:13,color:'#8888aa',lineHeight:1.8,marginBottom:10}}>Agrega <strong style={{color:'#2AABEE'}}>@tgonlybot</strong> como miembro de tu grupo antes de verificar.</p>
                <a href="https://t.me/tgonlybot" target="_blank" rel="noopener noreferrer" style={{background:'#2AABEE',color:'#000',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer',textDecoration:'none',fontFamily:"'DM Sans',sans-serif"}}>Abrir bot →</a>
              </div>

              <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Link de invitacion *</label>
                <div style={{display:'flex',gap:10}}>
                  <input value={privLink} onChange={e=>setPrivLink(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePrivateVerify()} placeholder="https://t.me/+xxxxxxxxxx" style={{...inp,flex:1}} />
                  <button onClick={handlePrivateVerify} disabled={!privLink.trim()||loadingPreview} style={{background:'#f5a623',color:'#000',border:'none',borderRadius:10,padding:'12px 20px',fontWeight:700,fontSize:14,cursor:'pointer',opacity:(!privLink.trim()||loadingPreview)?0.5:1,fontFamily:"'DM Sans',sans-serif"}}>{loadingPreview?'Cargando...':'Obtener foto'}</button>
                </div>
              </div>

              {preview?.photo_url && (
                <div style={{display:'flex',gap:12,alignItems:'center',background:'rgba(245,166,35,0.06)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:12,padding:12,marginBottom:14}}>
                  <img src={`/api/photo?url=${encodeURIComponent(preview.photo_url)}`} alt="foto" style={{width:48,height:48,borderRadius:12,objectFit:'cover'}} />
                  <p style={{fontSize:13,color:'#f5a623',fontWeight:600}}>✅ Foto obtenida automaticamente</p>
                </div>
              )}

              <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Nombre del grupo *</label><input value={privName} onChange={e=>setPrivName(e.target.value)} placeholder="Nombre" style={inp} /></div>
              <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Descripcion</label><input value={privDesc} onChange={e=>setPrivDesc(e.target.value)} placeholder="¿De que trata?" style={inp} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Miembros aprox</label><input value={privMembers} onChange={e=>setPrivMembers(e.target.value)} placeholder="1500" style={inp} /></div>
                <div><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Categoria *</label>
                  <select value={privCategory} onChange={e=>setPrivCategory(e.target.value)} style={{...inp,color:privCategory?'#f0eff8':'#8888aa'}}>
                    <option value="">Selecciona...</option>{CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}><label style={{display:'block',fontSize:13,color:'#8888aa',marginBottom:8}}>Tags</label><input value={privTags} onChange={e=>setPrivTags(e.target.value)} placeholder="privado, latam" style={inp} /></div>
              {submitError&&<p style={{color:'#ff5f6d',fontSize:13,marginBottom:12}}>⚠️ {submitError}</p>}
              <button onClick={handlePrivateSubmit} disabled={!privName||!privLink||!privCategory||submitting} style={{...btn('#f5a623','#000'),opacity:(!privName||!privLink||!privCategory||submitting)?0.5:1}}>
                {submitting?'Enviando...':'🔒 Enviar grupo privado'}
              </button>
            </div>
          )}
        </>)}

        <div style={{background:'rgba(42,171,238,0.06)',border:'1px solid rgba(42,171,238,0.15)',borderRadius:12,padding:'16px 20px',marginTop:16}}>
          <p style={{fontSize:13,color:'#8888aa',lineHeight:1.8}}><strong style={{color:'#2AABEE'}}>¿Como funciona?</strong><br/>1. Pega el link → verificamos automaticamente → elige categoria → enviamos a revision → publicamos en 24-48h</p>
        </div>
      </div>
    </div>
  )
}
