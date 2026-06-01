import React, { useState, useEffect, useMemo } from 'react'
import CustomSelect from './CustomSelect'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin

// Cache the CBSE TOC tree so repeated mounts don't refetch.
let _cache = null
let _pending = null
async function loadTree() {
  if (_cache) return _cache
  if (_pending) return _pending
  _pending = fetch(`${API}/api/curriculum`)
    .then(r => r.json())
    .then(d => { _cache = d && d.available ? d : { available: false, tree: {}, grades: [] }; _pending = null; return _cache })
    .catch(() => { _cache = { available: false, tree: {}, grades: [] }; _pending = null; return _cache })
  return _pending
}

// 12 CBSE grade labels used for both CBSE and Other modes so the Grade
// dropdown is identical regardless of which mode is selected.
const ALL_GRADES = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
]

// Generic subject list shown when the teacher picks "Other".
const GENERIC_SUBJECTS = [
  'Mathematics', 'Science', 'English Language Arts', 'Social Studies',
  'History', 'Geography', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Art', 'Music', 'Physical Education',
  'Foreign Language',
]

const LABEL = { display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }
const PILL = (active) => ({
  padding: '8px 18px',
  borderRadius: 10,
  border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
  background: active ? 'var(--accent-soft)' : 'var(--surface)',
  color: active ? 'var(--accent)' : 'var(--text-1)',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
})

/**
 * SubjectSelector — single source of truth for Grade + Subject across every
 * ClassroomAI generator. Replaces the previous CurriculumPicker plus the
 * duplicate native dropdowns that teachers found confusing.
 *
 *   1. CBSE / Other toggle pills
 *   2. Grade dropdown (always shown — same 13 grades for either mode)
 *   3. Subject dropdown — CBSE-aligned subjects when mode === 'cbse',
 *      generic subjects when mode === 'other'
 *   4. CBSE mode also shows Chapter / Topic dropdown derived from the TOC
 *   5. Below the buttons, an always-visible "Or type a custom subject"
 *      text input that overrides the dropdown when filled
 *
 * onChange fires with { grade, subject, topic, chapter, mode } whenever
 * any field changes.
 */
export default function SubjectSelector({
  grade = '',
  subject = '',
  topic = '',
  customSubject = '',
  mode: modeProp,
  onChange,
}) {
  const [mode, setMode] = useState(modeProp || 'cbse')
  const [tree, setTree] = useState({})
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadTree().then(d => { if (cancelled) return; setTree(d.tree || {}); setAvailable(!!d.available); setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const cbseSubjects = useMemo(
    () => (grade && tree[grade] ? Object.keys(tree[grade]) : []),
    [tree, grade]
  )
  const chapters = useMemo(
    () => (mode === 'cbse' && grade && subject && tree[grade]?.[subject] ? tree[grade][subject] : []),
    [mode, grade, subject, tree]
  )
  const selectedChapterIdx = chapters.findIndex(c => c.title === topic)

  const fire = (patch) => {
    const next = { grade, subject, topic, chapter: null, customSubject, mode, ...patch }
    onChange && onChange(next)
  }

  const handleMode = (next) => {
    if (next === mode) return
    setMode(next)
    // Switching modes wipes subject/topic — they're mode-specific.
    fire({ mode: next, subject: '', topic: '', chapter: null })
  }

  const handleGrade   = (e) => fire({ grade: e.target.value, subject: '', topic: '', chapter: null })
  const handleSubject = (e) => fire({ subject: e.target.value, topic: '', chapter: null })
  const handleChapter = (e) => {
    const idx = e.target.value
    const ch = chapters[Number(idx)] || null
    fire({ topic: ch ? ch.title : '', chapter: ch })
  }
  const handleCustom = (e) => fire({ customSubject: e.target.value })

  const subjectOptions = mode === 'cbse' ? cbseSubjects : GENERIC_SUBJECTS

  return (
    <div style={{ background: 'var(--accent-soft)', border: '1.5px solid var(--accent-mid)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={() => handleMode('cbse')}  style={PILL(mode === 'cbse')}>🇮🇳 CBSE</button>
        <button type="button" onClick={() => handleMode('other')} style={PILL(mode === 'other')}>🌍 Other</button>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
          {mode === 'cbse' ? 'CBSE Grade-wise TOC' : 'Generic subject list'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mode === 'cbse' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 10 }}>
        <div>
          <label style={LABEL}>Grade</label>
          <CustomSelect value={grade} onChange={handleGrade} placeholder="Select Grade">
            <option value="">Select Grade</option>
            {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </CustomSelect>
        </div>
        <div>
          <label style={LABEL}>Subject</label>
          <CustomSelect
            value={subject}
            onChange={handleSubject}
            disabled={mode === 'cbse' && !grade}
            placeholder={mode === 'cbse' && !grade ? 'Pick a grade first' : 'Select Subject'}
          >
            <option value="">{mode === 'cbse' && !grade ? 'Pick a grade first' : 'Select Subject'}</option>
            {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </CustomSelect>
        </div>
        {mode === 'cbse' && (
          <div>
            <label style={LABEL}>Chapter / Topic</label>
            <CustomSelect
              value={selectedChapterIdx >= 0 ? String(selectedChapterIdx) : ''}
              onChange={handleChapter}
              disabled={!subject}
              placeholder={subject ? 'Select Chapter' : 'Pick a subject first'}
            >
              <option value="">{subject ? 'Select Chapter' : 'Pick a subject first'}</option>
              {chapters.map((ch, i) => (
                <option key={i} value={String(i)}>{ch.ch ? `${ch.ch}. ${ch.title}` : ch.title}</option>
              ))}
            </CustomSelect>
          </div>
        )}
      </div>

      <input
        type="text"
        value={customSubject}
        onChange={handleCustom}
        placeholder="Or type a custom subject (overrides dropdown when filled)…"
        style={{
          width: '100%', marginTop: 10, padding: '7px 12px', borderRadius: 8,
          border: '1.5px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text-1)', fontSize: '0.8rem', fontFamily: 'var(--font)',
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      {(grade && (subject || customSubject)) && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>
          ✓ <strong>{grade}</strong> · <strong>{customSubject || subject}</strong>
          {topic ? <> · {topic}</> : null}
          {mode === 'cbse' && !customSubject && <> · CBSE-aligned</>}
        </div>
      )}
    </div>
  )
}
