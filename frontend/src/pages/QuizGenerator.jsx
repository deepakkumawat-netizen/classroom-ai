import React, { useState, useRef } from 'react'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin

const grades    = ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','College']
const subjects  = ['Mathematics','Science','English Language Arts','Social Studies','History','Geography','Physics','Chemistry','Biology','Computer Science','Art','Music','Other']
const OPTION_COLORS = { A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444' }

function VoiceBtn({ onResult }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const toggle = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return }
    const rec = new SR(); recRef.current = rec
    rec.continuous = false; rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false) }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
  }
  return (
    <button type="button" onClick={toggle} title="Voice input"
      style={{ padding: '8px 10px', border: `1.5px solid ${listening ? '#ef4444' : 'var(--border)'}`,
        borderRadius: 8, background: listening ? '#fee2e2' : 'var(--surface)', cursor: 'pointer',
        color: listening ? '#ef4444' : 'var(--text-2)', fontSize: 14, transition: 'all .2s' }}>
      {listening ? '⏹' : '🎙'}
    </button>
  )
}

export default function QuizGenerator() {
  const [topic, setTopic]       = useState('')
  const [grade, setGrade]       = useState('Grade 8')
  const [subject, setSubject]   = useState('Science')
  const [numQ, setNumQ]         = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Quiz state
  const [quiz, setQuiz]         = useState(null)  // raw quiz data
  const [mode, setMode]         = useState('setup') // setup | playing | results
  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers]   = useState([]) // {questionId, selected, correct}

  const generateQuiz = async () => {
    if (!topic.trim()) { setError('Please enter a topic'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/quiz`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, grade_level: grade, subject, num_questions: numQ, difficulty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to generate quiz')
      setQuiz(data)
      setCurrent(0); setSelected(null); setAnswered(false); setAnswers([])
      setMode('playing')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSelect = (letter) => {
    if (answered) return
    setSelected(letter)
    setAnswered(true)
    const q = quiz.questions[current]
    setAnswers(prev => [...prev, { questionId: q.id, selected: letter, correct: q.correct }])
  }

  const handleNext = () => {
    if (current + 1 >= quiz.questions.length) {
      setMode('results')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const score = answers.filter(a => a.selected === a.correct).length

  const resetQuiz = () => {
    setCurrent(0); setSelected(null); setAnswered(false); setAnswers([])
    setMode('playing')
  }

  // ── SETUP SCREEN ──
  if (mode === 'setup') return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>🎯 Quiz Generator</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Generate an interactive quiz and test student knowledge instantly</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Topic */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Topic *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              placeholder="e.g. Photosynthesis, World War 2, Algebra..."
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
                fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-1)', background: 'var(--bg)',
                outline: 'none', transition: 'border-color .2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            <VoiceBtn onResult={setTopic} />
          </div>
        </div>

        {/* Grade + Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Grade Level</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
                fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-1)', background: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
                fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-1)', background: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Questions + Difficulty */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Number of Questions</label>
            <select value={numQ} onChange={e => setNumQ(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
                fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-1)', background: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
              {[3,5,8,10,15].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
                fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-1)', background: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.85rem' }}>⚠️ {error}</div>}

        <button onClick={generateQuiz} disabled={loading}
          style={{ padding: '14px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'white', border: 'none', borderRadius: 12, fontFamily: 'inherit',
            fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'all .2s', boxShadow: '0 4px 14px rgba(var(--accent-rgb),.3)' }}>
          {loading ? '⏳ Generating Quiz…' : '🎯 Generate Quiz'}
        </button>
      </div>
    </div>
  )

  // ── PLAYING SCREEN ──
  if (mode === 'playing' && quiz) {
    const q = quiz.questions[current]
    const total = quiz.questions.length
    const progress = ((current) / total) * 100
    const isCorrect = answered && selected === q.correct
    const isWrong   = answered && selected !== q.correct

    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1)' }}>{quiz.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>{grade} · {subject} · {difficulty}</div>
          </div>
          <div style={{ background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', borderRadius: 10,
            padding: '6px 14px', fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem' }}>
            {current + 1} / {total}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
            borderRadius: 99, transition: 'width .4s ease' }} />
        </div>

        {/* Question card */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Question {current + 1}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.5, marginBottom: 24 }}>{q.question}</div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => {
              const letter = ['A','B','C','D'][i]
              const isSelected = selected === letter
              const isThisCorrect = answered && letter === q.correct
              const isThisWrong = answered && isSelected && letter !== q.correct

              let bg = 'var(--bg)', border = 'var(--border)', color = 'var(--text-1)'
              if (isThisCorrect) { bg = '#d1fae5'; border = '#10b981'; color = '#065f46' }
              else if (isThisWrong) { bg = '#fee2e2'; border = '#ef4444'; color = '#991b1b' }
              else if (isSelected && !answered) { bg = 'var(--accent-soft)'; border = 'var(--accent)'; color = 'var(--accent)' }

              return (
                <button key={letter} onClick={() => handleSelect(letter)} disabled={answered}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                    background: bg, border: `1.5px solid ${border}`, borderRadius: 12,
                    cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    color, fontWeight: 600, fontSize: '0.9rem', transition: 'all .15s' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: OPTION_COLORS[letter],
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{letter}</span>
                  {opt.replace(/^[A-D]\)\s*/i, '')}
                  {isThisCorrect && <span style={{ marginLeft: 'auto', fontSize: '1.1rem' }}>✅</span>}
                  {isThisWrong  && <span style={{ marginLeft: 'auto', fontSize: '1.1rem' }}>❌</span>}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 12,
              background: isCorrect ? '#d1fae5' : '#fef3c7', border: `1.5px solid ${isCorrect ? '#10b981' : '#f59e0b'}`,
              animation: 'fadeUp .3s ease' }}>
              <div style={{ fontWeight: 800, marginBottom: 4, color: isCorrect ? '#065f46' : '#92400e', fontSize: '0.85rem' }}>
                {isCorrect ? '🎉 Correct!' : `💡 Correct answer: ${q.correct}`}
              </div>
              <div style={{ fontSize: '0.85rem', color: isCorrect ? '#065f46' : '#78350f', lineHeight: 1.6 }}>{q.explanation}</div>
            </div>
          )}
        </div>

        {/* Next button */}
        {answered && (
          <button onClick={handleNext}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: 'white', border: 'none', borderRadius: 12, fontFamily: 'inherit',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', animation: 'fadeUp .3s ease' }}>
            {current + 1 >= total ? '🏁 See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    )
  }

  // ── RESULTS SCREEN ──
  if (mode === 'results') {
    const pct = Math.round((score / quiz.questions.length) * 100)
    const grade_emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'
    const grade_label = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good Job!' : pct >= 50 ? 'Keep Practicing' : 'Needs Review'

    return (
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{grade_emoji}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>{grade_label}</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>{pct}%</div>
          <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{score} out of {quiz.questions.length} correct</div>

          {/* Score bar */}
          <div style={{ height: 12, background: 'var(--border)', borderRadius: 99, margin: '20px 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, transition: 'width .6s ease',
              background: pct >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : pct >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={resetQuiz}
              style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              🔄 Retry Quiz
            </button>
            <button onClick={() => setMode('setup')}
              style={{ padding: '10px 24px', background: 'var(--bg)', color: 'var(--text-1)', border: '1.5px solid var(--border)',
                borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              📝 New Quiz
            </button>
          </div>
        </div>

        {/* Answer review */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--border)', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }}>
            📋 Answer Review
          </div>
          {quiz.questions.map((q, i) => {
            const a = answers[i]
            const correct = a?.selected === q.correct
            return (
              <div key={q.id} style={{ padding: '14px 20px', borderBottom: i < quiz.questions.length - 1 ? '1px solid var(--border)' : 'none',
                background: correct ? '#f0fdf4' : '#fef2f2' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{correct ? '✅' : '❌'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.87rem', marginBottom: 4 }}>{q.question}</div>
                    {!correct && <div style={{ fontSize: '0.8rem', color: '#dc2626' }}>Your answer: {a?.selected} &nbsp;·&nbsp; Correct: {q.correct}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
