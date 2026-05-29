import React, { useEffect, useState } from 'react'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin
const TEACHER_ID = 'teacher-demo-123'

const TOOL_META = {
  worksheet:     { icon: '📝', label: 'Worksheet' },
  lesson_plan:   { icon: '📚', label: 'Lesson Plan' },
  'lesson-plan': { icon: '📚', label: 'Lesson Plan' },
  assessment:    { icon: '✅', label: 'Assessment' },
  'mc-assessment': { icon: '✅', label: 'MC Assessment' },
  auto_generate: { icon: '⚡', label: 'Auto Generate' },
  'auto-generate': { icon: '⚡', label: 'Auto Generate' },
  quiz:          { icon: '🎯', label: 'Quiz' },
}

function meta(tool) {
  return TOOL_META[tool] || { icon: '💬', label: tool || 'Item' }
}

function fmtDate(s) {
  try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return s }
}

export default function HistoryPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`${API}/api/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_id: TEACHER_ID, limit: 50 }),
    })
      .then(r => r.json())
      .then(d => { if (active) { setChats(d.chats || []); setSelected((d.chats || [])[0] || null) } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const copyContent = () => {
    if (!selected) return
    navigator.clipboard.writeText(selected.content || selected.preview || '')
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ padding: '24px clamp(16px, 4vw, 40px)', color: 'var(--text-1)' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>📋 History</h1>
      <p style={{ color: 'var(--text-3)', margin: '0 0 22px' }}>Your saved worksheets, lesson plans, assessments and quizzes. Click any item to open its full content.</p>

      {loading ? (
        <div style={{ color: 'var(--text-3)', padding: 40, textAlign: 'center' }}>Loading history…</div>
      ) : chats.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
          No history yet. Generate something and it will appear here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: 20, alignItems: 'start' }}>

          {/* List of tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '72vh', overflowY: 'auto' }}>
            {chats.map(c => {
              const m = meta(c.tool_name)
              const isSel = selected && selected.id === c.id
              return (
                <button key={c.id} onClick={() => setSelected(c)}
                  style={{
                    textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: isSel ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1.5px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '12px 14px', transition: 'all 0.15s ease',
                  }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{m.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.topic || 'Untitled'}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{m.label} · {c.grade_level}{c.subject ? ' · ' + c.subject : ''}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{fmtDate(c.created_at)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Full content detail */}
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', minHeight: '60vh' }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, borderBottom: '1.5px solid var(--border)', paddingBottom: 14, marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{meta(selected.tool_name).icon} {selected.topic}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-3)' }}>{meta(selected.tool_name).label} · {selected.grade_level}{selected.subject ? ' · ' + selected.subject : ''} · {fmtDate(selected.created_at)}</p>
                  </div>
                  <button onClick={copyContent}
                    style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-1)', margin: 0 }}>
                  {selected.content || selected.preview || '(No content saved for this item.)'}
                </pre>
              </>
            ) : (
              <div style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 60 }}>Select an item to open it.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
