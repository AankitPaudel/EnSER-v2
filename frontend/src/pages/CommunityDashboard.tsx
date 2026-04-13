import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, getProjects } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../lib/theme'
import DashboardLayout from '../components/DashboardLayout'
import toast from 'react-hot-toast'
import type { Project } from '../types'

const ROLE_COLOR = '#f59e0b'
const departments = ['Civil', 'Computer Science', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'propose', label: 'Propose Project', icon: '➕' },
  { id: 'projects', label: 'My Projects', icon: '📁' },
  { id: 'feedback', label: 'Track Progress', icon: '📊' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  open:        { bg: '#d1fae5', color: '#059669', label: '🟢 Open' },
  in_progress: { bg: '#dbeafe', color: '#2563eb', label: '🔵 In Progress' },
  completed:   { bg: '#f3f4f6', color: '#6b7280', label: '✅ Completed' },
}

export default function CommunityDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [tab, setTab] = useState('dashboard')
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: '' })

  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const border = isDark ? '#334155' : '#e2e8f0'
  const muted = isDark ? '#94a3b8' : '#6b7280'
  const navy = '#084278'

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  useEffect(() => { if (profile) fetchProjects() }, [profile])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await getProjects()
      const all: Project[] = res.data
      setAllProjects(all)
      setMyProjects(all.filter(p => p.proposed_by === profile?.id))
    } catch { toast.error('Failed to load projects') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.department) { toast.error('Please select a department'); return }
    setSubmitting(true)
    try {
      await createProject({ ...form, proposed_by: profile!.id })
      toast.success('Project proposed successfully!')
      setForm({ title: '', description: '', department: '' })
      setTab('projects')
      fetchProjects()
    } catch { toast.error('Failed to create project') }
    finally { setSubmitting(false) }
  }

  if (!profile) return null

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`,
    borderRadius: 10, padding: '11px 14px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <DashboardLayout profile={profile} navItems={navItems} activeTab={tab} onTabChange={setTab} roleColor={ROLE_COLOR} roleLabel="Community">

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6 fade-in">
          <div style={{ background: `linear-gradient(135deg, ${ROLE_COLOR} 0%, #d97706 100%)`, borderRadius: 16, padding: '28px 32px' }}>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
              Welcome, {profile.full_name?.split(' ').slice(0, 2).join(' ')}! 🏙️
            </h2>
            <p style={{ color: '#fef3c7', margin: 0, fontSize: 14 }}>Community Member · Engineering Project Portal</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Proposals', value: myProjects.length, icon: '📁', color: navy },
              { label: 'Open', value: myProjects.filter(p => p.status === 'open').length, icon: '🟢', color: '#10b981' },
              { label: 'In Progress', value: myProjects.filter(p => p.status === 'in_progress').length, icon: '🔵', color: '#3b82f6' },
              { label: 'Completed', value: myProjects.filter(p => p.status === 'completed').length, icon: '✅', color: '#6b7280' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 18px', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div style={{ color, fontSize: 28, fontWeight: 700, fontFamily: "'Ubuntu', sans-serif", lineHeight: 1.2, marginTop: 4 }}>{value}</div>
                <div style={{ color: muted, fontSize: 12, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Propose a Project', desc: 'Submit a new engineering challenge for students', icon: '➕', tab: 'propose', color: ROLE_COLOR },
              { label: 'My Projects', desc: 'View and track all your proposals', icon: '📁', tab: 'projects', color: navy },
              { label: 'Track Progress', desc: 'See how students are progressing', icon: '📊', tab: 'feedback', color: '#10b981' },
            ].map(({ label, desc, icon, tab: t, color }) => (
              <button key={label} onClick={() => setTab(t)} style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: 18, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', width: '100%' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ color, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
                <div style={{ color: muted, fontSize: 12 }}>{desc}</div>
              </button>
            ))}
          </div>

          {/* Recent Projects */}
          {myProjects.length > 0 && (
            <Card>
              <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: '0 0 14px', fontSize: 16 }}>Recent Proposals</h3>
              <div className="space-y-3">
                {myProjects.slice(0, 3).map(p => {
                  const st = statusStyle[p.status]
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.title}</div>
                        <div style={{ color: muted, fontSize: 11 }}>{p.department} Engineering</div>
                      </div>
                      <span style={{ backgroundColor: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── PROPOSE PROJECT ── */}
      {tab === 'propose' && (
        <div className="fade-in" style={{ maxWidth: 640 }}>
          <Card>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: '0 0 6px', fontSize: 20 }}>Propose a New Project</h2>
            <p style={{ color: muted, fontSize: 13, margin: '0 0 24px' }}>Describe a real engineering challenge in your community. Students will apply and work on it under professor supervision.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Project Title *</label>
                <input type="text" required value={form.title} onChange={set('title')} placeholder="e.g. Smart Traffic Light Optimization System" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description *</label>
                <textarea required rows={5} value={form.description} onChange={set('description')} placeholder="Describe the problem, the goals, expected deliverables, and any constraints..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Engineering Department *</label>
                <select required value={form.department} onChange={set('department')} style={{ ...inputStyle }}>
                  <option value="">Select the relevant department</option>
                  {departments.map(d => <option key={d} value={d}>{d} Engineering</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, backgroundColor: ROLE_COLOR, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : '🚀 Submit Proposal'}
                </button>
                <button type="button" onClick={() => setTab('dashboard')} style={{ flex: 1, border: `1px solid ${border}`, borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: muted }}>
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── MY PROJECTS ── */}
      {tab === 'projects' && (
        <div className="space-y-4 fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, fontSize: 18, margin: 0 }}>Your Project Proposals</h2>
            <button onClick={() => setTab('propose')} style={{ backgroundColor: ROLE_COLOR, color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              + New Proposal
            </button>
          </div>
          {loading ? <p style={{ color: muted }}>Loading...</p> : myProjects.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 24px', color: muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <p style={{ margin: '0 0 16px', fontSize: 15 }}>No proposals yet.</p>
                <button onClick={() => setTab('propose')} style={{ backgroundColor: ROLE_COLOR, color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Propose Your First Project</button>
              </div>
            </Card>
          ) : myProjects.map(project => {
            const st = statusStyle[project.status]
            return (
              <Card key={project.id} style={{ borderLeft: `4px solid ${st.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{project.title}</h3>
                      <span style={{ backgroundColor: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
                    </div>
                    <p style={{ color: muted, fontSize: 13, margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{project.description}</p>
                    <span style={{ fontSize: 11, color: ROLE_COLOR, backgroundColor: `${ROLE_COLOR}15`, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{project.department} Engineering</span>
                  </div>
                  <button onClick={() => navigate(`/projects/${project.id}`)} style={{ marginLeft: 16, backgroundColor: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: muted, cursor: 'pointer', flexShrink: 0, fontWeight: 500 }}>
                    View →
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── TRACK PROGRESS ── */}
      {tab === 'feedback' && (
        <div className="space-y-4 fade-in">
          <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Project Progress Overview</h2>
          {myProjects.length === 0 ? (
            <Card><div style={{ textAlign: 'center', padding: '40px 24px', color: muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>📊</div><p style={{ margin: 0 }}>No projects to track yet.</p></div></Card>
          ) : myProjects.map(project => {
            const st = statusStyle[project.status]
            const totalStudents = allProjects.filter(p => p.id === project.id).length
            return (
              <Card key={project.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{project.title}</h3>
                  <span style={{ backgroundColor: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{st.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Department', value: project.department },
                    { label: 'Status', value: project.status.replace('_', ' ') },
                    { label: 'Posted', value: new Date(project.created_at).toLocaleDateString() },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ color: muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
