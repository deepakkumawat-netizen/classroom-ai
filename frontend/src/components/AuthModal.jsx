import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function pwStrength(p) {
  if (!p) return { score: 0, label: '', color: 'var(--text-3)' }
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (p.length >= 12) s++
  if (s <= 1) return { score: s, label: 'Weak', color: '#ef4444' }
  if (s <= 3) return { score: s, label: 'Fair', color: '#f59e0b' }
  return { score: s, label: 'Strong', color: 'var(--success)' }
}

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: 10,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text-1)', fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
}
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 5 }

// mode: 'signup' | 'login'
export default function AuthModal({ mode = 'signup', onClose, onSwitch }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ name: '', school: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const strength = pwStrength(form.password)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (isSignup) {
      if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
      localStorage.setItem('classroomai_user', JSON.stringify({
        name: form.name, school: form.school, email: form.email, password: btoa(form.password),
      }))
      onClose?.(); navigate('/dashboard')
    } else {
      const stored = JSON.parse(localStorage.getItem('classroomai_user') || 'null')
      if (!stored) { setError('No account found. Please sign up first.'); return }
      const idMatch = (form.email.trim().toLowerCase() === (stored.email || '').toLowerCase())
        || (form.email.trim().toLowerCase() === (stored.name || '').toLowerCase())
      if (!idMatch) { setError('Account not found. Check your email/name.'); return }
      if (stored.password && atob(stored.password) !== form.password) { setError('Wrong password.'); return }
      onClose?.(); navigate('/dashboard')
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>

        {/* Header */}
        <div style={{ background: 'var(--accent)', padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>{isSignup ? 'Start creating CBSE-aligned content' : 'Log in to continue teaching'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#ef444418', border: '1px solid #ef444455', color: '#ef4444', padding: '9px 12px', borderRadius: 9, fontSize: 13 }}>{error}</div>}

          {isSignup && (
            <>
              <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Your name" /></div>
              <div><label style={labelStyle}>School</label><input style={inputStyle} value={form.school} onChange={set('school')} placeholder="School name" /></div>
            </>
          )}

          <div><label style={labelStyle}>{isSignup ? 'Email' : 'Email or Name'}</label><input style={inputStyle} value={form.email} onChange={set('email')} placeholder={isSignup ? 'you@school.edu' : 'email or name'} /></div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, paddingRight: 44 }} type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>{showPw ? '🙈' : '👁️'}</button>
            </div>
            {isSignup && form.password && (
              <div style={{ marginTop: 7 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(b => <div key={b} style={{ flex: 1, height: 4, borderRadius: 4, background: b <= strength.score ? strength.color : 'var(--border)' }} />)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <button type="submit" style={{ marginTop: 4, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            {isSignup ? 'Create Account' : 'Log In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
