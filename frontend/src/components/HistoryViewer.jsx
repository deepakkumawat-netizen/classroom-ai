import React, { useEffect, useRef, useState } from 'react'

/**
 * HistoryViewer — opens a saved chat from history inside a modal
 * with an MS Word-style edit toolbar. Teachers can read, edit,
 * download (txt / pdf) or print without touching the generator.
 */
export default function HistoryViewer({ chat, onClose, onSave }) {
  const editorRef = useRef(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Build initial HTML from the plain-text chat content
  useEffect(() => {
    if (!editorRef.current || !chat) return
    const text = chat.content || chat.preview || ''
    editorRef.current.innerHTML = textToHtml(text)
    setDirty(false)
  }, [chat])

  if (!chat) return null

  const exec = (cmd, arg = null) => {
    editorRef.current?.focus()
    try { document.execCommand(cmd, false, arg) } catch (_) {}
    setDirty(true)
  }

  const onInput = () => setDirty(true)

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleCopy = async () => {
    const text = editorRef.current?.innerText || ''
    try { await navigator.clipboard.writeText(text); flash('Copied to clipboard') }
    catch { flash('Could not copy') }
  }

  const handleDownloadTxt = () => {
    const text = editorRef.current?.innerText || ''
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chat.topic || chat.tool_name || 'history'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    flash('Downloaded as TXT')
  }

  const handleDownloadPdf = () => {
    flash('Preparing PDF…')
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 15
      const maxW = pageW - margin * 2
      let y = margin

      const text = editorRef.current?.innerText || ''
      const lines = text.split('\n')
      lines.forEach(line => {
        if (y > pageH - margin) { doc.addPage(); y = margin }
        const trimmed = line.trim()
        if (!trimmed) { y += 4; return }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(11, 27, 45)
        const wrapped = doc.splitTextToSize(trimmed, maxW)
        if (y + wrapped.length * 5.5 > pageH - margin) { doc.addPage(); y = margin }
        doc.text(wrapped, margin, y)
        y += wrapped.length * 5.5 + 2
      })
      doc.save(`${(chat.topic || chat.tool_name || 'history').replace(/\s+/g, '-')}.pdf`)
      flash('Downloaded as PDF')
    }
    document.head.appendChild(script)
  }

  const handleSave = async () => {
    if (!onSave) { flash('Save handler missing'); return }
    setSaving(true)
    const text = editorRef.current?.innerText || ''
    const ok = await onSave(chat, text)
    setSaving(false)
    if (ok) { setDirty(false); flash('Saved to history') }
    else flash('Could not save — try again')
  }

  const handlePrint = () => {
    const html = editorRef.current?.innerHTML || ''
    const w = window.open('', '_blank')
    if (!w) { flash('Pop-up blocked'); return }
    w.document.write(`
      <!doctype html><html><head><title>${chat.topic || 'Document'}</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; padding: 24mm; line-height: 1.6; color: #111; }
        h1, h2, h3 { color: #0b1b2d; }
        ul, ol { padding-left: 24px; }
      </style></head><body>${html}</body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
        zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(900px, 100%)', height: 'min(90vh, 900px)',
          background: 'var(--surface)', borderRadius: 14, boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1.5px solid var(--border)',
        }}
      >
        {/* Title bar */}
        <div style={{
          padding: '12px 18px', borderBottom: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', color: 'white',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📄 {chat.topic || 'Untitled'} {dirty && <span style={{ opacity: 0.85, fontWeight: 500 }}>(edited)</span>}
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
              {chat.tool_name?.replace('_', ' ')} · {chat.grade_level} · {chat.subject}
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            title="Download as PDF"
            style={{
              background: 'white', color: '#dc2626',
              border: 'none', borderRadius: 8, padding: '6px 14px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            }}
          >
            ⬇ PDF
          </button>
          <button
            onClick={handleDownloadTxt}
            title="Download as TXT"
            style={{
              background: 'rgba(255,255,255,0.95)', color: '#16a34a',
              border: 'none', borderRadius: 8, padding: '6px 12px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            TXT
          </button>
          <button
            onClick={handlePrint}
            title="Print"
            style={{
              background: 'rgba(255,255,255,0.18)', color: 'white',
              border: 'none', borderRadius: 8, padding: '6px 10px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            🖨
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            title="Save edits to history"
            style={{
              background: dirty ? 'white' : 'rgba(255,255,255,0.25)',
              color: dirty ? 'var(--accent)' : 'rgba(255,255,255,0.8)',
              border: 'none', borderRadius: 8, padding: '6px 14px',
              fontWeight: 700, fontSize: 13, cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1, transition: 'all .15s',
            }}
          >
            {saving ? 'Saving…' : '💾 Save'}
          </button>
          <button onClick={onClose} title="Close"
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white',
              width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>
            ✕
          </button>
        </div>

        {/* MS Word-style toolbar */}
        <Toolbar
          exec={exec}
          onCopy={handleCopy}
          onDownloadTxt={handleDownloadTxt}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrint}
        />

        {/* Editor */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--bg)', padding: '20px 0' }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            spellCheck
            style={{
              maxWidth: 780, margin: '0 auto', minHeight: '100%',
              background: 'white', color: '#111',
              padding: '40px 56px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 4,
              fontFamily: '"Calibri","Segoe UI","Helvetica Neue",Arial,sans-serif',
              fontSize: 15, lineHeight: 1.7, outline: 'none',
            }}
          />
        </div>

        {/* Status bar */}
        <div style={{
          padding: '8px 16px', borderTop: '1.5px solid var(--border)',
          fontSize: 11, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <span>Edits save to your SQLite history · also Download / Print to keep a copy</span>
          {toast && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{toast}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── TOOLBAR ─────────────────────────────────────────────
function Toolbar({ exec, onCopy, onDownloadTxt, onDownloadPdf, onPrint }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4,
      padding: '8px 12px', borderBottom: '1.5px solid var(--border)',
      background: 'var(--surface)',
    }}>
      {/* Style */}
      <select
        onChange={e => { const v = e.target.value; if (v) exec('formatBlock', v); e.target.value = '' }}
        style={selStyle} defaultValue=""
        title="Paragraph style"
      >
        <option value="">Style</option>
        <option value="H1">Heading 1</option>
        <option value="H2">Heading 2</option>
        <option value="H3">Heading 3</option>
        <option value="P">Paragraph</option>
        <option value="BLOCKQUOTE">Quote</option>
        <option value="PRE">Code</option>
      </select>

      {/* Font family */}
      <select
        onChange={e => { exec('fontName', e.target.value); e.target.value = '' }}
        style={selStyle} defaultValue=""
        title="Font"
      >
        <option value="">Font</option>
        <option value="Calibri">Calibri</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
        <option value="Courier New">Courier New</option>
      </select>

      {/* Font size */}
      <select
        onChange={e => { exec('fontSize', e.target.value); e.target.value = '' }}
        style={selStyle} defaultValue=""
        title="Font size"
      >
        <option value="">Size</option>
        <option value="1">8</option>
        <option value="2">10</option>
        <option value="3">12</option>
        <option value="4">14</option>
        <option value="5">18</option>
        <option value="6">24</option>
        <option value="7">36</option>
      </select>

      <Divider />

      <TBtn title="Bold (Ctrl+B)" onClick={() => exec('bold')}><b>B</b></TBtn>
      <TBtn title="Italic (Ctrl+I)" onClick={() => exec('italic')}><i>I</i></TBtn>
      <TBtn title="Underline (Ctrl+U)" onClick={() => exec('underline')}><u>U</u></TBtn>
      <TBtn title="Strikethrough" onClick={() => exec('strikeThrough')}><s>S</s></TBtn>

      <Divider />

      {/* Text color */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} title="Text color">
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>A</span>
        <input type="color" defaultValue="#111111"
          onChange={e => exec('foreColor', e.target.value)}
          style={{ width: 22, height: 18, border: '1px solid var(--border)', padding: 0, cursor: 'pointer' }} />
      </label>
      {/* Highlight */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} title="Highlight">
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>🖍</span>
        <input type="color" defaultValue="#fff59d"
          onChange={e => exec('hiliteColor', e.target.value)}
          style={{ width: 22, height: 18, border: '1px solid var(--border)', padding: 0, cursor: 'pointer' }} />
      </label>

      <Divider />

      <TBtn title="Align left" onClick={() => exec('justifyLeft')}>⇤</TBtn>
      <TBtn title="Align center" onClick={() => exec('justifyCenter')}>≡</TBtn>
      <TBtn title="Align right" onClick={() => exec('justifyRight')}>⇥</TBtn>
      <TBtn title="Justify" onClick={() => exec('justifyFull')}>☰</TBtn>

      <Divider />

      <TBtn title="Bulleted list" onClick={() => exec('insertUnorderedList')}>•≡</TBtn>
      <TBtn title="Numbered list" onClick={() => exec('insertOrderedList')}>1≡</TBtn>
      <TBtn title="Decrease indent" onClick={() => exec('outdent')}>⇤|</TBtn>
      <TBtn title="Increase indent" onClick={() => exec('indent')}>|⇥</TBtn>

      <Divider />

      <TBtn title="Undo (Ctrl+Z)" onClick={() => exec('undo')}>↶</TBtn>
      <TBtn title="Redo (Ctrl+Y)" onClick={() => exec('redo')}>↷</TBtn>
      <TBtn title="Clear formatting" onClick={() => exec('removeFormat')}>⌫</TBtn>

      <Divider />

      <TBtn title="Copy" onClick={onCopy}>📋</TBtn>
      <TBtn title="Download TXT" onClick={onDownloadTxt} color="#16a34a">TXT</TBtn>
      <TBtn title="Download PDF" onClick={onDownloadPdf} color="#dc2626">PDF</TBtn>
      <TBtn title="Print" onClick={onPrint}>🖨</TBtn>
    </div>
  )
}

const selStyle = {
  height: 28, padding: '0 6px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'var(--bg)', color: 'var(--text-1)', fontSize: 12, cursor: 'pointer',
}

const Divider = () => (
  <span style={{ display: 'inline-block', width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
)

function TBtn({ children, onClick, title, color }) {
  return (
    <button
      type="button" onClick={onClick} title={title}
      style={{
        minWidth: 30, height: 28, padding: '0 7px', borderRadius: 6,
        border: '1px solid transparent', background: 'transparent',
        color: color || 'var(--text-1)', fontSize: 13, fontFamily: 'inherit',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s, border-color .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.borderColor = 'var(--accent-mid)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
    >
      {children}
    </button>
  )
}

// ─── plain-text → simple HTML so headings & lists render in the editor ───
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function textToHtml(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let inList = null // 'ul' | 'ol' | null

  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null } }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()
    if (!t) { closeList(); out.push('<br/>'); continue }

    // Markdown-ish heading
    const hm = t.match(/^(#{1,4})\s+(.+)/)
    if (hm) {
      closeList()
      const lvl = Math.min(hm[1].length, 4)
      out.push(`<h${lvl}>${escapeHtml(hm[2])}</h${lvl}>`)
      continue
    }

    // ALL-CAPS line as heading
    if (/^[A-Z0-9][A-Z0-9\s\-:&,]{4,}$/.test(t) && t === t.toUpperCase() && t.length < 80) {
      closeList()
      out.push(`<h2>${escapeHtml(t)}</h2>`)
      continue
    }

    // Numbered list / question
    const nm = t.match(/^(\d+)[.)]\s+(.+)/)
    if (nm) {
      if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol' }
      out.push(`<li>${escapeHtml(nm[2])}</li>`)
      continue
    }

    // Bullet
    if (/^[-•*]\s+/.test(t)) {
      if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul' }
      out.push(`<li>${escapeHtml(t.replace(/^[-•*]\s+/, ''))}</li>`)
      continue
    }

    closeList()
    // Bold **x** + italic *x* → <strong>/<em>
    let html = escapeHtml(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    out.push(`<p>${html}</p>`)
  }
  closeList()
  return out.join('\n')
}
