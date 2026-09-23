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

  const inputClass = "w-full rounded-2xl border border-[#dfe5ef] bg-white px-4 py-3.5 text-[15px] text-[#11182d] placeholder:text-[#9aa3b8] outline-none transition focus:border-[#1769ff] focus:ring-4 focus:ring-[#1769ff]/10"
  const labelClass = "mb-2 block text-[13px] font-semibold text-[#66718d]"
  const cardClass = "rounded-3xl border border-[#e6eaf2] bg-white p-5 sm:p-6 shadow-[0_12px_30px_rgba(39,56,95,.05)]"

  if (success) return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 pt-24">
        <div className="tg-surface w-full max-w-xl p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f8ee] text-3xl">✓</div>
          <h1 className="font-syne text-3xl font-extrabold">Grupo enviado</h1>
          <p className="mt-3 text-[#6f7894]">Lo revisaremos antes de publicarlo en TGOnly.</p>
          <Link href="/" className="tg-primary mt-7 inline-flex px-6 py-3 font-bold">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#11182d]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <section className="tg-surface mb-5 overflow-hidden p-6 sm:p-8">
          <div className="grid items-center gap-7 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-[#fff4cf] px-3 py-1.5 text-xs font-bold text-[#735b00]">＋ Publica tu comunidad</div>
              <h1 className="font-syne text-[clamp(34px,6vw,54px)] font-extrabold leading-[1.03] tracking-[-1.5px]">
                Agrega tu grupo a <span className="text-[#1769ff]">TGOnly</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6f7894]">
                Comparte tu grupo o canal de Telegram. Revisamos la información antes de publicarla.
              </p>
            </div>
            <div className="hidden min-h-[180px] rounded-[30px] bg-[#fff4cf] p-7 md:block">
              <p className="font-syne text-2xl font-extrabold leading-tight">Más personas.<br/>Mejores comunidades.</p>
              <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf3ff] text-4xl text-[#1769ff]">➤</div>
            </div>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-[#e6eaf2] bg-white p-1.5 shadow-[0_8px_24px_rgba(39,56,95,.04)]">
          {[['grupo','Agregar grupo'],['categoria','Proponer categoría']].map(([t,l]) => (
            <button key={t} onClick={()=>setTab(t as any)}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tab===t?'bg-[#1769ff] text-white shadow-sm':'text-[#6f7894] hover:bg-[#f5f7fb]'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab==='categoria' && (
          catSuccess ? (
            <div className="tg-surface p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f8ee] text-2xl">✓</div>
              <h2 className="font-syne text-2xl font-extrabold">Categoría enviada</h2>
              <p className="mt-2 text-[#6f7894]">La revisaremos antes de agregarla al directorio.</p>
            </div>
          ) : (
            <section className={cardClass}>
              <div className="mb-6">
                <h2 className="font-syne text-xl font-extrabold">Proponer una categoría</h2>
                <p className="mt-1 text-sm text-[#7b86a1]">Sugiere una temática que todavía no exista en TGOnly.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
                <div>
                  <label className={labelClass}>Emoji *</label>
                  <input value={catEmoji} onChange={e=>setCatEmoji(e.target.value)} placeholder="🎮" className={inputClass+" text-center text-xl"} />
                </div>
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Música, Cocina..." className={inputClass} />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Descripción</label>
                <input value={catDesc} onChange={e=>setCatDesc(e.target.value)} placeholder="¿De qué tratan estos grupos?" className={inputClass} />
              </div>

              {catError && <p className="mt-4 rounded-xl bg-[#fff0f2] px-4 py-3 text-sm font-semibold text-[#c53b50]">⚠ {catError}</p>}
              <button onClick={handleCategorySubmit} disabled={!catName||!catEmoji||catSubmitting}
                className="tg-primary mt-6 w-full py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-45">
                {catSubmitting?'Enviando...':'Proponer categoría'}
              </button>
            </section>
          )
        )}

        {tab==='grupo' && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-[#e6eaf2] bg-white p-1.5">
              {[['publico','🌐 Grupo público'],['privado','🔒 Grupo privado']].map(([t,l]) => (
                <button key={t} onClick={()=>setTipo(t as any)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tipo===t?'bg-[#edf4ff] text-[#1769ff]':'text-[#6f7894] hover:bg-[#f7f9fc]'}`}>
                  {l}
                </button>
              ))}
            </div>

            {tipo==='publico' && (
              <div className="space-y-5">
                <section className={cardClass}>
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#edf4ff] font-bold text-[#1769ff]">1</div>
                    <div>
                      <h2 className="font-syne text-xl font-extrabold">Pega el enlace</h2>
                      <p className="mt-1 text-sm text-[#7b86a1]">Intentaremos leer automáticamente la información pública del grupo.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input value={link} onChange={e=>setLink(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePreview()}
                      placeholder="https://t.me/tugrupo" className={inputClass+" flex-1"} />
                    <button onClick={handlePreview} disabled={loadingPreview||!link.trim()}
                      className="tg-primary min-w-[130px] px-5 py-3 font-bold disabled:opacity-45">
                      {loadingPreview?'Buscando...':'Verificar'}
                    </button>
                  </div>
                  {previewError && <p className="mt-3 rounded-xl bg-[#fff0f2] px-4 py-3 text-sm font-semibold text-[#c53b50]">⚠ {previewError}</p>}
                </section>

                {preview && (
                  <section className="rounded-3xl border border-[#bfd3ff] bg-[#f8fbff] p-5 sm:p-6">
                    <div className="mb-4 text-xs font-extrabold uppercase tracking-[.08em] text-[#1769ff]">✓ Grupo encontrado</div>
                    <div className="flex gap-4">
                      {preview.photo_url ? (
                        <img src={`/api/photo?url=${encodeURIComponent(preview.photo_url)}`} alt={preview.name} className="h-16 w-16 flex-none rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-[#edf4ff] text-3xl">📱</div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-syne text-lg font-extrabold">{preview.name}</h3>
                        <p className="mt-1 text-sm font-bold text-[#1769ff]">{preview.members?.toLocaleString('es')} miembros</p>
                        {preview.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6f7894]">{preview.description}</p>}
                      </div>
                    </div>
                  </section>
                )}

                {preview && (
                  <section className={cardClass}>
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#fff4cf] font-bold text-[#795f00]">2</div>
                      <div>
                        <h2 className="font-syne text-xl font-extrabold">Completa los detalles</h2>
                        <p className="mt-1 text-sm text-[#7b86a1]">Ayúdanos a clasificar la comunidad correctamente.</p>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Categoría *</label>
                      <select value={category} onChange={e=>setCategory(e.target.value)} className={inputClass}>
                        <option value="">Selecciona una categoría</option>
                        {CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>Tags</label>
                      <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="cripto, bitcoin, trading" className={inputClass} />
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Tu nombre</label>
                        <input value={submitterName} onChange={e=>setSubmitterName(e.target.value)} placeholder="Juan" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input value={submitterEmail} onChange={e=>setSubmitterEmail(e.target.value)} placeholder="juan@email.com" type="email" className={inputClass} />
                      </div>
                    </div>
                    {submitError&&<p className="mt-4 rounded-xl bg-[#fff0f2] px-4 py-3 text-sm font-semibold text-[#c53b50]">⚠ {submitError}</p>}
                    <button onClick={handleSubmit} disabled={!category||submitting}
                      className="tg-primary mt-6 w-full py-3.5 font-bold disabled:opacity-45">
                      {submitting?'Enviando...':'Enviar para revisión'}
                    </button>
                  </section>
                )}
              </div>
            )}

            {tipo==='privado' && (
              <section className={cardClass}>
                <div className="mb-5 rounded-2xl border border-[#d9e6ff] bg-[#f5f9ff] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#edf4ff] text-xl">🤖</div>
                    <div>
                      <h3 className="font-bold">Obtener la foto automáticamente</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#6f7894]">Agrega <strong className="text-[#1769ff]">@tgonlybot</strong> como miembro antes de verificar el enlace.</p>
                      <a href="https://t.me/tgonlybot" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-xl bg-[#1769ff] px-4 py-2 text-xs font-bold text-white">Abrir bot →</a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Link de invitación *</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input value={privLink} onChange={e=>setPrivLink(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePrivateVerify()} placeholder="https://t.me/+xxxxxxxxxx" className={inputClass+" flex-1"} />
                    <button onClick={handlePrivateVerify} disabled={!privLink.trim()||loadingPreview} className="rounded-2xl bg-[#ffd91a] px-5 py-3 font-bold text-[#3b3100] disabled:opacity-45">
                      {loadingPreview?'Buscando...':'Obtener foto'}
                    </button>
                  </div>
                </div>

                {preview?.photo_url && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#fff9df] p-3">
                    <img src={`/api/photo?url=${encodeURIComponent(preview.photo_url)}`} alt="foto" className="h-12 w-12 rounded-xl object-cover" />
                    <p className="text-sm font-bold text-[#735b00]">✓ Foto obtenida automáticamente</p>
                  </div>
                )}

                <div className="mt-4">
                  <label className={labelClass}>Nombre del grupo *</label>
                  <input value={privName} onChange={e=>setPrivName(e.target.value)} placeholder="Nombre del grupo" className={inputClass} />
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Descripción</label>
                  <input value={privDesc} onChange={e=>setPrivDesc(e.target.value)} placeholder="¿De qué trata?" className={inputClass} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Miembros aprox.</label>
                    <input value={privMembers} onChange={e=>setPrivMembers(e.target.value)} placeholder="1500" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Categoría *</label>
                    <select value={privCategory} onChange={e=>setPrivCategory(e.target.value)} className={inputClass}>
                      <option value="">Selecciona...</option>
                      {CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Tags</label>
                  <input value={privTags} onChange={e=>setPrivTags(e.target.value)} placeholder="privado, latam" className={inputClass} />
                </div>
                {submitError&&<p className="mt-4 rounded-xl bg-[#fff0f2] px-4 py-3 text-sm font-semibold text-[#c53b50]">⚠ {submitError}</p>}
                <button onClick={handlePrivateSubmit} disabled={!privName||!privLink||!privCategory||submitting}
                  className="mt-6 w-full rounded-2xl bg-[#ffd91a] py-3.5 font-bold text-[#3b3100] transition hover:bg-[#f3cd00] disabled:opacity-45">
                  {submitting?'Enviando...':'Enviar grupo privado'}
                </button>
              </section>
            )}
          </>
        )}

        <section className="mt-5 rounded-3xl border border-[#dce8ff] bg-[#f5f9ff] p-5 sm:p-6">
          <p className="text-sm leading-7 text-[#66718d]"><strong className="text-[#1769ff]">¿Cómo funciona?</strong><br/>Pega el enlace → verificamos la información → eliges una categoría → enviamos a revisión → publicamos cuando esté aprobado.</p>
        </section>
      </main>
    </div>
  )
}
