import React, { useState, useEffect } from 'react'
import CustomSelect from './CustomSelect'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin

let _cache = null
let _pending = null
async function loadTree() {
  if (_cache) return _cache
  if (_pending) return _pending
  _pending = fetch(`${API}/api/curriculum`)
    .then(r => r.json())
    .then(d => {
      _cache = d && d.available ? d : { available: false, tree: {}, grades: [] }
      _pending = null
      return _cache
    })
    .catch(() => {
      _cache = { available: false, tree: {}, grades: [] }
      _pending = null
      return _cache
    })
  return _pending
}

const LABEL_STYLE = { display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }

/**
 * CurriculumPicker — three cascading dropdowns sourced from the official
 * CBSE GRADE Wise TOC: Grade → Subject → Chapter.
 *
 * Selecting a chapter calls `onChange({ grade, subject, topic, chapter })`
 * where `topic` is the chapter title (so existing generator forms continue
 * to work unchanged) and `chapter` is the full chapter object.
 */
export default function CurriculumPicker({
  grade = '',
  subject = '',
  topic = '',
  onChange,
  compact = false,
  showHeading = true,
}) {
  const [tree, setTree] = useState({})
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadTree().then(d => {
      if (cancelled) return
      setTree(d.tree || {})
      setAvailable(!!d.available)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const grades = Object.keys(tree).sort(
    (a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0)
  )
  const subjects = grade && tree[grade] ? Object.keys(tree[grade]) : []
  const chapters = grade && subject && tree[grade]?.[subject] ? tree[grade][subject] : []

  const fire = (patch) => {
    const next = { grade, subject, topic, chapter: null, ...patch }
    onChange && onChange(next)
  }

  const onGrade = (e) => {
    const g = e.target.value
    fire({ grade: g, subject: '', topic: '', chapter: null })
  }
  const onSubject = (e) => {
    const s = e.target.value
    fire({ grade, subject: s, topic: '', chapter: null })
  }
  const onChapter = (e) => {
    const idx = e.target.value
    const ch = chapters[Number(idx)] || null
    fire({
      grade,
      subject,
      topic: ch ? ch.title : '',
      chapter: ch,
    })
  }

  if (loading) {
    return (
      <div style={{ padding: 12, fontSize: 13, color: 'var(--text-3)' }}>
        Loading CBSE curriculum…
      </div>
    )
  }

  if (!available) {
    return null
  }

  const cols = compact ? '1fr' : 'repeat(3, 1fr)'
  const selectedChapterIdx = chapters.findIndex(c => c.title === topic)

  return (
    <div style={{
      background: 'var(--accent-soft)',
      border: '1.5px solid var(--accent-mid)',
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    }}>
      {showHeading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>📚</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
              CBSE Curriculum (Official Grade-wise TOC)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Pick a grade → subject → chapter to ground the generation in the CBSE syllabus.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>CBSE Grade</label>
          <CustomSelect value={grade} onChange={onGrade} placeholder="Select Grade">
            <option value="">Select Grade</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </CustomSelect>
        </div>
        <div>
          <label style={LABEL_STYLE}>Subject</label>
          <CustomSelect
            value={subject}
            onChange={onSubject}
            disabled={!grade}
            placeholder={grade ? 'Select Subject' : 'Pick a grade first'}
          >
            <option value="">{grade ? 'Select Subject' : 'Pick a grade first'}</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </CustomSelect>
        </div>
        <div>
          <label style={LABEL_STYLE}>Chapter / Topic</label>
          <CustomSelect
            value={selectedChapterIdx >= 0 ? String(selectedChapterIdx) : ''}
            onChange={onChapter}
            disabled={!subject}
            placeholder={subject ? 'Select Chapter' : 'Pick a subject first'}
          >
            <option value="">{subject ? 'Select Chapter' : 'Pick a subject first'}</option>
            {chapters.map((ch, i) => (
              <option key={i} value={String(i)}>
                {ch.ch ? `${ch.ch}. ${ch.title}` : ch.title}
              </option>
            ))}
          </CustomSelect>
        </div>
      </div>

      {topic && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>
          ✓ Grounded on: <strong>{grade}</strong> · <strong>{subject}</strong> · {topic}
        </div>
      )}
    </div>
  )
}
