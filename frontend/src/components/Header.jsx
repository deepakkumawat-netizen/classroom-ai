import React from 'react'
import { useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const titles = {
  '/':               { label: 'Dashboard',              sub: 'Welcome back! Choose a tool to get started.' },
  '/worksheet':      { label: 'Worksheet Generator',    sub: 'Generate ready-to-use worksheets for any topic.' },
  '/lesson-plan':    { label: 'Lesson Plan Generator',  sub: 'Create comprehensive lesson plans in seconds.' },
  '/mc-assessment':  { label: 'MC Quiz / Assessment',   sub: 'Build multiple choice quizzes aligned to your standards.' },
  '/quiz-generator': { label: 'Quiz Generator',         sub: 'Generate interactive quizzes and test student knowledge.' },
  '/auto-generate':  { label: 'Auto Generate',          sub: 'One click — Lesson Plan + Worksheet + MC Assessment + Quiz.' },
  '/teacher-insights':{ label: 'Teacher Insights',      sub: 'Analytics and insights from your classroom activity.' },
}

export default function Header() {
  const { pathname } = useLocation()
  const info = titles[pathname] || titles['/']

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
        <div style={{
          width: 36, height: 36,
          background: 'var(--accent-soft)',
          border: '1.5px solid var(--accent-mid)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)',
        }}>T</div>
      </div>
    </header>
  )
}
