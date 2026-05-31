import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import AuthModal from '../components/AuthModal'

const TOOLS = [
  {
    to: '/auto-generate',
    title: 'Auto Generate',
    desc: 'One click — get a worksheet, lesson plan, overview and assessment together, all CBSE-aligned.',
    color: '#f59e0b',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  {
    to: '/worksheet',
    title: 'Worksheet Generator',
    desc: 'Print-ready worksheets with answer keys, differentiation and Bloom’s-level questions.',
    color: '#399aff',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    to: '/lesson-plan',
    title: 'Lesson Plan Generator',
    desc: 'Full UbD lesson plans with timing, activities, differentiation and a topic overview page.',
    color: '#22c55e',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    to: '/mc-assessment',
    title: 'MC Assessment',
    desc: 'Valid multiple-choice tests with plausible distractors, answer key and explanations.',
    color: '#a855f7',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    to: '/quiz-generator',
    title: 'Interactive Quiz',
    desc: 'Self-scoring quizzes students can take on screen, with instant feedback per question.',
    color: '#ef4444',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    to: '/teacher-insights',
    title: 'Teacher Insights',
    desc: 'Adaptive analytics on student performance to guide what to teach next.',
    color: '#06b6d4',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [authMode, setAuthMode] = useState(null) // 'signup' | 'login' | null
  // Rotate the hero image's Pollinations seed every 5s for fresh variations.
  const [heroSeed, setHeroSeed] = useState(33)
  useEffect(() => {
    const t = setInterval(() => setHeroSeed(s => s + 1), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 6vw', borderBottom: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Classroom<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleTheme} title="Toggle theme"
            style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)', cursor: 'pointer', fontSize: 18 }}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setAuthMode('login')}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Log In
          </button>
          <button onClick={() => setAuthMode('signup')}
            style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            Sign Up Free
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '64px 6vw 40px', maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', minWidth: 280 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 13, marginBottom: 22 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> CBSE-aligned · Grades 1–12
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 18px', letterSpacing: '-0.03em' }}>
            Plan, create &amp; assess<br /><span style={{ color: 'var(--accent)' }}>in seconds</span>, not hours.
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--text-2)', maxWidth: 560, margin: '0 0 30px', lineHeight: 1.6 }}>
            ClassroomAI gives teachers an instant set of worksheets, lesson plans, quizzes and assessments — every one calibrated to your grade and grounded in the official CBSE curriculum.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => setAuthMode('signup')}
              style={{ padding: '14px 30px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}>
              Get Started Free →
            </button>
            <button onClick={() => navigate('/auto-generate')}
              style={{ padding: '14px 30px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              ⚡ Try Auto-Generate
            </button>
          </div>
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 260, display: 'flex', justifyContent: 'center' }}>
          <img
            src={`https://image.pollinations.ai/prompt/3D%20Pixar%20cartoon%20illustration%20of%20a%20friendly%20teacher%20at%20a%20desk%20with%20multiple%20worksheets%2C%20lesson%20plans%20and%20quizzes%20floating%20around%20them%2C%20chalkboard%20in%20background%2C%20bright%20vibrant%20colors%2C%20clean%20white%20background?width=768&height=768&seed=${heroSeed}&nologo=true`}
            alt="Teacher creating worksheets and lesson plans"
            loading="lazy"
            key={heroSeed}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{ width: '100%', maxWidth: 440, height: 'auto', borderRadius: 20, boxShadow: 'var(--shadow-lg)', transition: 'opacity .4s' }}
          />
        </div>
      </section>

      {/* Tool cards */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 6vw 56px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Everything a teacher needs</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-3)', margin: '0 0 36px' }}>Six tools, one click away.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {TOOLS.map(t => (
            <button key={t.to} onClick={() => navigate(t.to)}
              style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease', boxShadow: 'var(--shadow)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = t.color }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, background: t.color + '1a', marginBottom: 16 }}>
                {t.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-1)' }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55, margin: 0 }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1.5px solid var(--border)', padding: '24px 6vw', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
          Powered by Codevidhya
        </div>
        <div style={{ marginTop: 6 }}>© 2025 ClassroomAI — CBSE-aligned teaching tools.</div>
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(m => (m === 'signup' ? 'login' : 'signup'))}
        />
      )}
    </div>
  )
}
