import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import toast from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

const departments = ['Civil', 'Computer Science', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']
const roles = [
  { value: 'community', label: '🏙️ Community Member', desc: 'Propose real-world engineering projects' },
  { value: 'student',   label: '🎓 Student',          desc: 'Apply for projects and get AI-guided learning' },
  { value: 'professor', label: '👨‍🏫 Professor',       desc: 'Oversee students and generate AI syllabuses' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student', department: '' })

  const navy = '#084278'
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const bg = isDark ? '#0f172a' : '#f0f4f8'
  const border = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#f1f5f9' : '#1a202c'
  const muted = isDark ? '#94a3b8' : '#6b7280'
  const inputBg = isDark ? '#0f172a' : '#f8fafc'

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: inputBg, border: `1px solid ${border}`, borderRadius: 10,
    padding: '11px 14px', fontSize: 13, color: text, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 700, color: muted,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error || !data.user) { toast.error(error?.message ?? 'Registration failed'); setLoading(false); return }
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, full_name: form.full_name, role: form.role, department: form.department || null,
    })
    if (profileError) { toast.error('Account created but profile setup failed.'); setLoading(false); return }
    toast.success('Account created! Welcome to EnSer.')
    navigate(`/${form.role}`)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: navy, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="EnSer" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ color: 'white', fontFamily: "'Ubuntu', sans-serif", fontWeight: 700, fontSize: 18 }}>EnSer <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 400 }}>2.0</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggle} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: 6, borderRadius: 6 }}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/login" style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Sign In →</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div style={{ backgroundColor: navy, padding: '28px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🚀</div>
              <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Join EnSer</h1>
              <p style={{ color: '#bfdbfe', fontSize: 13, margin: 0 }}>Create your account in under a minute</p>
            </div>

            <form onSubmit={handleRegister} style={{ padding: '28px 32px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" required value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>I am a...</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {roles.map(r => (
                    <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `2px solid ${form.role === r.value ? navy : border}`, backgroundColor: form.role === r.value ? `${navy}10` : inputBg, cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} style={{ accentColor: navy }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: form.role === r.value ? navy : text }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: muted }}>{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {(form.role === 'student' || form.role === 'professor') && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Department</label>
                  <select value={form.department} onChange={set('department')} style={{ ...inputStyle }}>
                    <option value="">Select your department</option>
                    {departments.map(d => <option key={d} value={d}>{d} Engineering</option>)}
                  </select>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: navy, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 14 }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
              <p style={{ textAlign: 'center', color: muted, fontSize: 13, margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: navy, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
