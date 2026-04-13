import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navy = '#084278'
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const bg = isDark ? '#0f172a' : '#f0f4f8'
  const border = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#f1f5f9' : '#1a202c'
  const muted = isDark ? '#94a3b8' : '#6b7280'
  const inputBg = isDark ? '#0f172a' : '#f8fafc'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      toast.success('Welcome back!')
      navigate(`/${profile?.role ?? ''}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: navy, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="EnSer" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: 'white', fontFamily: "'Ubuntu', sans-serif", fontWeight: 700, fontSize: 18 }}>EnSer <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 400 }}>2.0</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggle} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: 6, borderRadius: 6 }}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/register" style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Register →</Link>
        </div>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Card */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div style={{ backgroundColor: navy, padding: '28px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
              <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Welcome Back</h1>
              <p style={{ color: '#bfdbfe', fontSize: 13, margin: 0 }}>Sign in to your EnSer account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ padding: '28px 32px' }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  style={{ width: '100%', backgroundColor: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: text, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', backgroundColor: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 40px 11px 14px', fontSize: 13, color: text, outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: muted }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: navy, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

              <p style={{ textAlign: 'center', color: muted, fontSize: 13, margin: 0 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: navy, fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
              </p>
            </form>
          </div>

          {/* Demo hint */}
          <p style={{ textAlign: 'center', color: muted, fontSize: 12, marginTop: 16 }}>
            Want to explore? <Link to="/#demo" style={{ color: navy, fontWeight: 600, textDecoration: 'none' }}>Try a live demo →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
