import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const titles = {
  '/dashboard':       { label: 'Dashboard',              sub: 'Welcome back! Choose a tool to get started.' },
  '/worksheet':       { label: 'Worksheet Generator',    sub: 'Generate ready-to-use worksheets for any topic.' },
  '/lesson-plan':     { label: 'Lesson Plan Generator',  sub: 'Create comprehensive lesson plans in seconds.' },
  '/mc-assessment':   { label: 'MC Quiz / Assessment',   sub: 'Build multiple choice quizzes aligned to your standards.' },
  '/quiz-generator':  { label: 'Quiz Generator',         sub: 'Generate interactive quizzes and test student knowledge.' },
  '/auto-generate':   { label: 'Auto Generate',          sub: 'One click — Lesson Plan + Worksheet + MC Assessment + Quiz.' },
  '/teacher-insights':{ label: 'Teacher Insights',       sub: 'Analytics and insights from your classroom activity.' },
  '/history':         { label: 'History',                sub: 'Your saved worksheets, lesson plans, quizzes & assessments.' },
}

function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = (() => { try { return JSON.parse(localStorage.getItem('classroomai_user') || '{}') } catch { return {} } })()
  const initial = (user.name || user.email || 'T').charAt(0).toUpperCase()
  const signOut = () => {
    localStorage.removeItem('classroomai_user')
    navigate('/')
  }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} title={user.name || 'Profile'}
        style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--accent-mid)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
        {initial}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 230, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 999, padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{user.name || 'Teacher'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, wordBreak: 'break-all' }}>{user.email || ''}</div>
            <button onClick={signOut}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const info = titles[pathname] || titles['/dashboard']

  return (
    <header style={{
      height: 'var(--header-h)',
      background: 'var(--surface)',
      borderBottom: '1.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>
          {info.label}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 500, marginTop: 1 }}>
          {info.sub}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ThemeToggle />
        <span className="badge badge-blue">✦ AI Powered</span>
        <ProfileMenu />
      </div>
    </header>
  )
}
