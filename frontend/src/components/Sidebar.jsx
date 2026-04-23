import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const nav = [
  {
    to: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    label: 'Dashboard',
  },
  {
    to: '/auto-generate',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: 'Auto Generate ⚡',
    highlight: true,
  },
  {
    to: '/worksheet',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: 'Worksheet Generator',
  },
  {
    to: '/lesson-plan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    label: 'Lesson Plan Generator',
  },
  {
    to: '/mc-assessment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    label: 'MC Quiz / Assessment',
  },
]

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: 'var(--sidebar-w)', height: '100vh',
      background: 'var(--surface)',
      borderRight: '1.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflowY: 'auto',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow)',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>ClassroomAI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500, marginTop: 1 }}>Teacher Tools</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 10px 10px', transition: 'color 0.3s ease' }}>
          Tools
        </div>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              marginBottom: 3,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive
                ? 'var(--accent)'
                : 'var(--text-1)',
              background: isActive
                ? 'var(--accent-soft)'
                : 'transparent',
              border: isActive ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              transition: 'var(--transition)',
            })}
            onMouseEnter={e => {
              const isActive = e.currentTarget.classList.contains('active')
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bg)'
              }
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active')
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ lineHeight: 1.3 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1.5px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-3)',
        fontWeight: 500,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
          Powered by OpenAI
        </div>
      </div>
    </aside>
  )
}
