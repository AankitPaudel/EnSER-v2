import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import { Sun, Moon, Menu, X, LogOut } from 'lucide-react'
import type { Profile } from '../types'

interface NavItem {
  id: string
  label: string
  icon: string
  onClick?: () => void
}

interface Props {
  profile: Profile
  navItems: NavItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
  roleColor: string
  roleLabel: string
}

export default function DashboardLayout({ profile, navItems, activeTab, onTabChange, children, roleColor, roleLabel }: Props) {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isDark = theme === 'dark'

  const navy = '#084278'
  const bg = isDark ? '#0f172a' : '#f0f4f8'
  const sidebarBg = navy
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const border = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#f1f5f9' : '#1a202c'
  const muted = isDark ? '#94a3b8' : '#6b7280'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: bg, color: text, minHeight: '100vh', display: 'flex' }}>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside
        style={{
          backgroundColor: sidebarBg,
          width: sidebarOpen ? 240 : 64,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="EnSer" style={{ height: 40, width: 40, flexShrink: 0, borderRadius: '50%', objectFit: 'cover' }} />
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>EnSer</div>
              <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 500 }}>2.0</div>
            </div>
          )}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ backgroundColor: `${roleColor}25`, border: `1px solid ${roleColor}50`, borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ color: roleColor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{roleLabel}</div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name}</div>
              {profile.department && <div style={{ color: '#93c5fd', fontSize: 11, marginTop: 1 }}>{profile.department}</div>}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); item.onClick?.() }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: 4,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                backgroundColor: activeTab === item.id ? `${roleColor}25` : 'transparent',
                borderLeft: activeTab === item.id ? `3px solid ${roleColor}` : '3px solid transparent',
              }}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ color: activeTab === item.id ? 'white' : '#bfdbfe', fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400 }}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', justifyContent: sidebarOpen ? 'flex-start' : 'center', color: '#bfdbfe' }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {sidebarOpen && <span style={{ fontSize: 13 }}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setSidebarOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', justifyContent: sidebarOpen ? 'flex-start' : 'center', color: '#bfdbfe' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            {sidebarOpen && <span style={{ fontSize: 13 }}>Collapse</span>}
          </button>
          <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', justifyContent: sidebarOpen ? 'flex-start' : 'center', color: '#fca5a5' }}>
            <LogOut size={16} />
            {sidebarOpen && <span style={{ fontSize: 13 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ backgroundColor: cardBg, borderBottom: `1px solid ${border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontSize: 20, fontWeight: 700, margin: 0 }}>
              {navItems.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
            <p style={{ color: muted, fontSize: 12, margin: '2px 0 0' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ backgroundColor: `${roleColor}15`, color: roleColor, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: `1px solid ${roleColor}30` }}>
              {profile.full_name}
            </span>
            <Link to="/" style={{ color: muted, fontSize: 12, textDecoration: 'none' }} className="hover:underline">← Home</Link>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }} className="fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
