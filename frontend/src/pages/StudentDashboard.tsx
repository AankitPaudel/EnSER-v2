import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../lib/theme'
import DashboardLayout from '../components/DashboardLayout'
import { getProjects, getStudentApplications, applyToProject, getSyllabusByApplication, createSubmission } from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Search, Upload, Brain, X } from 'lucide-react'
import type { Project, Application, Syllabus } from '../types'

const ROLE_COLOR = '#10b981'
const departments = ['All', 'Civil', 'Computer Science', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'browse', label: 'Browse Projects', icon: '🔍' },
  { id: 'applications', label: 'My Applications', icon: '📋' },
  { id: 'syllabus', label: 'My Syllabus', icon: '📚' },
  { id: 'submissions', label: 'Submissions', icon: '📤' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#fef3c7', color: '#d97706', label: '⏳ Pending' },
  accepted: { bg: '#d1fae5', color: '#059669', label: '✅ Accepted' },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: '❌ Rejected' },
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [tab, setTab] = useState('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [dept, setDept] = useState('All')
  const [search, setSearch] = useState('')
  const [professors, setProfessors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [syllabusModal, setSyllabusModal] = useState<Syllabus | null>(null)
  const [uploadingFor, setUploadingFor] = useState<number | null>(null)

  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const border = isDark ? '#334155' : '#e2e8f0'
  const muted = isDark ? '#94a3b8' : '#6b7280'
  const navy = '#084278'

  useEffect(() => { if (profile) fetchAll() }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [projRes, appRes] = await Promise.all([getProjects(), getStudentApplications(profile!.id)])
      setProjects(projRes.data)
      setApplications(appRes.data)
      const profIds = [...new Set((appRes.data as Application[]).map(a => a.professor_id))]
      if (profIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', profIds)
        const map: Record<string, string> = {}
        profs?.forEach((p: any) => { map[p.id] = p.full_name })
        setProfessors(map)
      }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleApply = async (projectId: number) => {
    const { data: profs } = await supabase.from('profiles').select('id').eq('role', 'professor').limit(1).single()
    if (!profs) { toast.error('No professors available yet'); return }
    setApplying(projectId)
    try {
      await applyToProject({ project_id: projectId, student_id: profile!.id, professor_id: profs.id })
      toast.success('Application submitted!')
      fetchAll()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Already applied or error occurred')
    } finally { setApplying(null) }
  }

  const openSyllabus = async (applicationId: number) => {
    try {
      const res = await getSyllabusByApplication(applicationId)
      setSyllabusModal(res.data)
    } catch { toast.error('Syllabus not available yet') }
  }

  const handleFileUpload = async (applicationId: number, file: File) => {
    setUploadingFor(applicationId)
    try {
      const path = `submissions/${profile!.id}/${applicationId}/${file.name}`
      const { error } = await supabase.storage.from('submissions').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path)
      await createSubmission({ application_id: applicationId, file_url: urlData.publicUrl })
      toast.success('Submission uploaded!')
    } catch (err: any) { toast.error(err?.message ?? 'Upload failed') }
    finally { setUploadingFor(null) }
  }

  const filteredProjects = projects.filter(p => {
    const matchesDept = dept === 'All' || p.department === dept
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch && p.status === 'open'
  })
  const appliedIds = new Set(applications.map(a => a.project_id))
  const acceptedApps = applications.filter(a => a.status === 'accepted')

  if (!profile) return null

  return (
    <DashboardLayout profile={profile} navItems={navItems} activeTab={tab} onTabChange={setTab} roleColor={ROLE_COLOR} roleLabel="Student">

      {/* ── DASHBOARD HOME ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6 fade-in">
          {/* Welcome */}
          <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #0a5299 100%)`, borderRadius: 16, padding: '28px 32px' }}>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
              Welcome back, {profile.full_name?.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: '#bfdbfe', margin: 0, fontSize: 14 }}>{profile.department} Engineering · Student Dashboard</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Open Projects', value: projects.filter(p => p.status === 'open').length, icon: '🏗️', color: navy },
              { label: 'My Applications', value: applications.length, icon: '📋', color: '#7c3aed' },
              { label: 'Accepted', value: acceptedApps.length, icon: '✅', color: ROLE_COLOR },
              { label: 'Pending Review', value: applications.filter(a => a.status === 'pending').length, icon: '⏳', color: '#f59e0b' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 18px', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div style={{ color, fontSize: 28, fontWeight: 700, fontFamily: "'Ubuntu', sans-serif", lineHeight: 1.2, marginTop: 4 }}>{value}</div>
                <div style={{ color: muted, fontSize: 12, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Browse Projects', desc: 'Find real-world engineering projects', icon: '🔍', tab: 'browse', color: navy },
                { label: 'My Applications', desc: 'Track your application status', icon: '📋', tab: 'applications', color: '#7c3aed' },
                { label: 'View Syllabus', desc: 'See your AI-generated learning plan', icon: '📚', tab: 'syllabus', color: ROLE_COLOR },
              ].map(({ label, desc, icon, tab: t, color }) => (
                <button key={label} onClick={() => setTab(t)} style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: 18, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}20`)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${color}10`)}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ color, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: muted, fontSize: 12 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BROWSE PROJECTS ── */}
      {tab === 'browse' && (
        <div className="fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: muted }} size={16} />
              <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 16px 10px 38px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={dept} onChange={e => setDept(e.target.value)}
              style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c' }}>
              {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : `${d}`}</option>)}
            </select>
          </div>
          {loading ? <p style={{ color: muted }}>Loading...</p> : filteredProjects.length === 0 ? (
            <div style={{ backgroundColor: cardBg, border: `2px dashed ${border}`, borderRadius: 14, padding: '60px 24px', textAlign: 'center', color: muted }}>No open projects found.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredProjects.map(project => {
                const applied = appliedIds.has(project.id)
                return (
                  <div key={project.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: isDark ? '#f1f5f9' : '#1a202c' }}>{project.title}</h3>
                        <span style={{ fontSize: 11, color: ROLE_COLOR, backgroundColor: `${ROLE_COLOR}15`, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{project.department}</span>
                      </div>
                      <span style={{ fontSize: 11, color: ROLE_COLOR, backgroundColor: `${ROLE_COLOR}15`, padding: '3px 10px', borderRadius: 10, fontWeight: 600, height: 'fit-content' }}>Open</span>
                    </div>
                    <p style={{ color: muted, fontSize: 13, lineHeight: 1.5, margin: '8px 0 14px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{project.description}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/projects/${project.id}`)} style={{ flex: 1, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, backgroundColor: 'transparent', color: muted, cursor: 'pointer', fontWeight: 500 }}>
                        View Details
                      </button>
                      <button onClick={() => handleApply(project.id)} disabled={applied || applying === project.id}
                        style={{ flex: 1, border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, backgroundColor: applied ? '#6b7280' : navy, color: 'white', cursor: applied ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: applying === project.id ? 0.7 : 1 }}>
                        {applying === project.id ? 'Applying...' : applied ? '✓ Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── APPLICATIONS ── */}
      {tab === 'applications' && (
        <div className="space-y-4 fade-in">
          {loading ? <p style={{ color: muted }}>Loading...</p> : applications.length === 0 ? (
            <div style={{ backgroundColor: cardBg, border: `2px dashed ${border}`, borderRadius: 14, padding: '60px 24px', textAlign: 'center', color: muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              No applications yet. Browse projects and apply!
            </div>
          ) : applications.map(app => {
            const project = projects.find(p => p.id === app.project_id)
            const st = statusStyle[app.status]
            return (
              <div key={app.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, borderLeft: `4px solid ${st.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{project?.title ?? `Project #${app.project_id}`}</h3>
                    <p style={{ color: muted, fontSize: 12, margin: 0 }}>Professor: {professors[app.professor_id] ?? 'Unknown'}</p>
                  </div>
                  <span style={{ backgroundColor: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{st.label}</span>
                </div>
                {app.status === 'accepted' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => openSyllabus(app.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#084278', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <Brain size={13} /> View AI Syllabus
                    </button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: `${ROLE_COLOR}15`, color: ROLE_COLOR, border: `1px solid ${ROLE_COLOR}30`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <Upload size={13} />
                      {uploadingFor === app.id ? 'Uploading...' : 'Upload PDF Submission'}
                      <input type="file" accept=".pdf" style={{ display: 'none' }} disabled={uploadingFor === app.id} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(app.id, f) }} />
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── SYLLABUS ── */}
      {tab === 'syllabus' && (
        <div className="space-y-4 fade-in">
          {acceptedApps.length === 0 ? (
            <div style={{ backgroundColor: cardBg, border: `2px dashed ${border}`, borderRadius: 14, padding: '60px 24px', textAlign: 'center', color: muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              No accepted applications yet. Apply to a project first!
            </div>
          ) : acceptedApps.map(app => {
            const project = projects.find(p => p.id === app.project_id)
            return (
              <div key={app.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{project?.title ?? `Project #${app.project_id}`}</h3>
                    <p style={{ color: muted, fontSize: 12, margin: 0 }}>AI syllabus generated by GPT-4o</p>
                  </div>
                  <button onClick={() => openSyllabus(app.id)} style={{ backgroundColor: navy, color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Brain size={14} /> View Syllabus
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── SUBMISSIONS ── */}
      {tab === 'submissions' && (
        <div className="space-y-4 fade-in">
          {acceptedApps.length === 0 ? (
            <div style={{ backgroundColor: cardBg, border: `2px dashed ${border}`, borderRadius: 14, padding: '60px 24px', textAlign: 'center', color: muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
              No accepted projects yet to submit work for.
            </div>
          ) : acceptedApps.map(app => {
            const project = projects.find(p => p.id === app.project_id)
            return (
              <div key={app.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{project?.title ?? `Project #${app.project_id}`}</h3>
                    <p style={{ color: muted, fontSize: 12, margin: 0 }}>Upload your final PDF report</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: navy, color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Upload size={14} />
                    {uploadingFor === app.id ? 'Uploading...' : 'Upload PDF'}
                    <input type="file" accept=".pdf" style={{ display: 'none' }} disabled={uploadingFor === app.id} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(app.id, f) }} />
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Syllabus Modal */}
      {syllabusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setSyllabusModal(null)}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 20, maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={20} color={navy} />
                <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: 0, fontSize: 20 }}>AI-Generated Syllabus</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ backgroundColor: '#084278', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 10 }}>GPT-4o</span>
                <button onClick={() => setSyllabusModal(null)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: muted }}><X size={18} /></button>
              </div>
            </div>
            <div style={{ marginBottom: 20, padding: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 12 }}>
              <h3 style={{ color: navy, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: 0 }}>Syllabus</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', margin: 0 }}>{syllabusModal.content}</pre>
            </div>
            <div style={{ padding: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 12 }}>
              <h3 style={{ color: navy, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: 0 }}>Grading Rubric</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', margin: 0 }}>{syllabusModal.rubric}</pre>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
