import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../lib/theme'
import DashboardLayout from '../components/DashboardLayout'
import { getProfessorApplications, acceptApplication, rejectApplication, getSyllabus, getSyllabusByApplication, getSubmissions, assignGrade, getStoredApiKey, setStoredApiKey } from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Brain, X, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { Application, Syllabus, Submission } from '../types'

const ROLE_COLOR = '#7c3aed'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'active', label: 'Active Students', icon: '🎓' },
  { id: 'grading', label: 'Grade Submissions', icon: '⭐' },
  { id: 'settings', label: 'API Settings', icon: '🔑' },
]

export default function ProfessorDashboard() {
  const { profile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [tab, setTab] = useState('dashboard')
  const [applications, setApplications] = useState<Application[]>([])
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})
  const [projectTitles, setProjectTitles] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<number | null>(null)
  const [syllabusModal, setSyllabusModal] = useState<Syllabus | null>(null)
  const [gradingApp, setGradingApp] = useState<Application | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [gradeForm, setGradeForm] = useState({ submission_id: 0, score: '', feedback: '' })
  const [grading, setGrading] = useState(false)
  const [apiKey, setApiKey] = useState(getStoredApiKey())
  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState(getStoredApiKey())

  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const border = isDark ? '#334155' : '#e2e8f0'
  const muted = isDark ? '#94a3b8' : '#6b7280'
  const navy = '#084278'

  useEffect(() => { if (profile) fetchAll() }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getProfessorApplications(profile!.id)
      const apps: Application[] = res.data
      setApplications(apps)
      const studentIds = [...new Set(apps.map(a => a.student_id))]
      if (studentIds.length > 0) {
        const { data: students } = await supabase.from('profiles').select('id, full_name').in('id', studentIds)
        const map: Record<string, string> = {}
        students?.forEach((s: any) => { map[s.id] = s.full_name })
        setStudentNames(map)
      }
      const projectIds = [...new Set(apps.map(a => a.project_id))]
      if (projectIds.length > 0) {
        const { data: projects } = await supabase.from('projects').select('id, title').in('id', projectIds)
        const map: Record<number, string> = {}
        projects?.forEach((p: any) => { map[p.id] = p.title })
        setProjectTitles(map)
      }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const saveApiKey = () => { setStoredApiKey(keyInput); setApiKey(keyInput); toast.success('API key saved!') }

  const handleAccept = async (app: Application) => {
    if (!apiKey) { toast.error('Enter your OpenAI API key in Settings first.'); setTab('settings'); return }
    setGeneratingFor(app.id)
    try {
      const res = await acceptApplication(app.id, apiKey)
      const syllabusRes = await getSyllabus(res.data.syllabus_id)
      setSyllabusModal(syllabusRes.data)
      toast.success('Accepted! AI syllabus generated.')
      fetchAll()
    } catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Failed') }
    finally { setGeneratingFor(null) }
  }

  const handleReject = async (id: number) => {
    try { await rejectApplication(id); toast.success('Application rejected'); fetchAll() }
    catch { toast.error('Failed') }
  }

  const openGrading = async (app: Application) => {
    setGradingApp(app)
    const res = await getSubmissions(app.id)
    setSubmissions(res.data)
    if (res.data.length > 0) setGradeForm(f => ({ ...f, submission_id: res.data[0].id }))
  }

  const submitGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeForm.score) { toast.error('Enter a score'); return }
    setGrading(true)
    try {
      await assignGrade({ submission_id: gradeForm.submission_id, score: Number(gradeForm.score), feedback: gradeForm.feedback })
      toast.success('Grade submitted!')
      setGradingApp(null)
    } catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Failed') }
    finally { setGrading(false) }
  }

  const pending = applications.filter(a => a.status === 'pending')
  const accepted = applications.filter(a => a.status === 'accepted')

  if (!profile) return null

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>
  )

  return (
    <DashboardLayout profile={profile} navItems={navItems} activeTab={tab} onTabChange={setTab} roleColor={ROLE_COLOR} roleLabel="Professor">

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6 fade-in">
          <div style={{ background: `linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)`, borderRadius: 16, padding: '28px 32px' }}>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
              Welcome, {profile.full_name?.split(' ').slice(0, 2).join(' ')}! 👨‍🏫
            </h2>
            <p style={{ color: '#ddd6fe', margin: 0, fontSize: 14 }}>{profile.department} · Professor Dashboard</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending Review', value: pending.length, icon: '🔔', color: '#f59e0b' },
              { label: 'Active Students', value: accepted.length, icon: '🎓', color: ROLE_COLOR },
              { label: 'Total Applications', value: applications.length, icon: '📋', color: navy },
              { label: 'API Key', value: apiKey ? '✓ Set' : '✗ Missing', icon: '🔑', color: apiKey ? '#10b981' : '#ef4444' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 18px', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div style={{ color, fontSize: 22, fontWeight: 700, fontFamily: "'Ubuntu', sans-serif", lineHeight: 1.2, marginTop: 4 }}>{value}</div>
                <div style={{ color: muted, fontSize: 12, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          {!apiKey && (
            <Card style={{ borderLeft: '4px solid #f59e0b', backgroundColor: isDark ? '#1e1a0e' : '#fffbeb' }}>
              <p style={{ color: '#d97706', fontWeight: 600, margin: '0 0 6px', fontSize: 14 }}>⚠️ OpenAI API Key Required</p>
              <p style={{ color: muted, fontSize: 13, margin: '0 0 12px' }}>You need to add your API key before you can accept students and generate AI syllabuses.</p>
              <button onClick={() => setTab('settings')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Add API Key →
              </button>
            </Card>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Review Applications', desc: 'Accept or reject pending student applications', icon: '🔔', tab: 'notifications', color: '#f59e0b' },
              { label: 'Active Students', desc: 'View syllabuses and track active projects', icon: '🎓', tab: 'active', color: ROLE_COLOR },
              { label: 'Grade Submissions', desc: 'Review PDFs and submit structured grades', icon: '⭐', tab: 'grading', color: navy },
            ].map(({ label, desc, icon, tab: t, color }) => (
              <button key={label} onClick={() => setTab(t)} style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: 18, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', width: '100%' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ color, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
                <div style={{ color: muted, fontSize: 12 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <div className="space-y-4 fade-in">
          {loading ? <p style={{ color: muted }}>Loading...</p> : pending.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 24px', color: muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                <p style={{ margin: 0 }}>No pending applications. You're all caught up!</p>
              </div>
            </Card>
          ) : pending.map(app => (
            <Card key={app.id} style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{studentNames[app.student_id] ?? 'Student'}</h3>
                  <p style={{ color: muted, fontSize: 13, margin: '0 0 2px' }}>
                    Applied to: <strong style={{ color: navy }}>{projectTitles[app.project_id] ?? `Project #${app.project_id}`}</strong>
                  </p>
                  <p style={{ color: muted, fontSize: 11, margin: 0 }}>{new Date(app.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleReject(app.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✕ Reject
                  </button>
                  <button onClick={() => handleAccept(app)} disabled={generatingFor === app.id} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: generatingFor === app.id ? 'not-allowed' : 'pointer', opacity: generatingFor === app.id ? 0.7 : 1 }}>
                    {generatingFor === app.id ? '⏳ Generating...' : '✓ Accept + Generate Syllabus'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── ACTIVE STUDENTS ── */}
      {tab === 'active' && (
        <div className="space-y-4 fade-in">
          {loading ? <p style={{ color: muted }}>Loading...</p> : accepted.length === 0 ? (
            <Card><div style={{ textAlign: 'center', padding: '40px 24px', color: muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div><p style={{ margin: 0 }}>No active students yet.</p></div></Card>
          ) : accepted.map(app => (
            <Card key={app.id} style={{ borderLeft: `4px solid ${ROLE_COLOR}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{studentNames[app.student_id] ?? 'Student'}</h3>
                  <p style={{ color: muted, fontSize: 13, margin: 0 }}>{projectTitles[app.project_id] ?? `Project #${app.project_id}`}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => { try { const r = await getSyllabusByApplication(app.id); setSyllabusModal(r.data) } catch { toast.error('Syllabus not found') } }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: `${navy}15`, color: navy, border: `1px solid ${navy}30`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Brain size={13} /> Syllabus
                  </button>
                  <button onClick={() => openGrading(app)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: `${ROLE_COLOR}15`, color: ROLE_COLOR, border: `1px solid ${ROLE_COLOR}30`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ⭐ Grade
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── GRADING ── */}
      {tab === 'grading' && (
        <div className="space-y-4 fade-in">
          {accepted.length === 0 ? (
            <Card><div style={{ textAlign: 'center', padding: '40px 24px', color: muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div><p style={{ margin: 0 }}>No active students to grade yet.</p></div></Card>
          ) : accepted.map(app => (
            <Card key={app.id} style={{ borderLeft: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{studentNames[app.student_id] ?? 'Student'}</h3>
                  <p style={{ color: muted, fontSize: 13, margin: 0 }}>{projectTitles[app.project_id] ?? `Project #${app.project_id}`}</p>
                </div>
                <button onClick={() => openGrading(app)} style={{ backgroundColor: ROLE_COLOR, color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Open Grading Panel
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── API SETTINGS ── */}
      {tab === 'settings' && (
        <div className="fade-in">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🔑</span>
              <div>
                <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: '0 0 2px', fontSize: 18 }}>OpenAI API Key</h2>
                {apiKey && <span style={{ backgroundColor: '#d1fae5', color: '#059669', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>✓ Key saved</span>}
              </div>
            </div>
            <p style={{ color: muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Your API key is stored <strong>only in your browser (localStorage)</strong> — it never touches our server logs. It's sent directly to OpenAI when you accept a student application to generate the AI syllabus.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type={showKey ? 'text' : 'password'} value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="sk-proj-..."
                  style={{ width: '100%', backgroundColor: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: 10, padding: '11px 40px 11px 16px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: muted }}>
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button onClick={saveApiKey} style={{ backgroundColor: navy, color: 'white', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Key</button>
            </div>
            <p style={{ color: muted, fontSize: 11, marginTop: 10 }}>
              Don't have a key? Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: navy }}>platform.openai.com/api-keys</a>
            </p>
          </Card>
        </div>
      )}

      {/* Syllabus Modal */}
      {syllabusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setSyllabusModal(null)}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 20, maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={20} color={navy} />
                <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: 0, fontSize: 20 }}>AI Syllabus</h2>
                <span style={{ backgroundColor: navy, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>GPT-4o</span>
              </div>
              <button onClick={() => setSyllabusModal(null)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: muted }}><X size={18} /></button>
            </div>
            <div style={{ padding: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
              <h3 style={{ color: navy, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: 0 }}>📋 Syllabus</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', margin: 0 }}>{syllabusModal.content}</pre>
            </div>
            <div style={{ padding: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 12 }}>
              <h3 style={{ color: navy, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: 0 }}>📊 Grading Rubric</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', margin: 0 }}>{syllabusModal.rubric}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setGradingApp(null)}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 20, maxWidth: 520, width: '100%', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: navy, fontWeight: 700, margin: '0 0 4px', fontSize: 20 }}>Grade Submission</h2>
                <p style={{ color: muted, fontSize: 13, margin: 0 }}>{studentNames[gradingApp.student_id]} · {projectTitles[gradingApp.project_id]}</p>
              </div>
              <button onClick={() => setGradingApp(null)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: muted }}><X size={18} /></button>
            </div>
            {submissions.length === 0 ? (
              <p style={{ color: muted, textAlign: 'center', padding: '24px 0' }}>No submissions uploaded yet.</p>
            ) : (
              <form onSubmit={submitGrade} className="space-y-4">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Submission</label>
                  <select value={gradeForm.submission_id} onChange={e => setGradeForm(f => ({ ...f, submission_id: Number(e.target.value) }))}
                    style={{ width: '100%', backgroundColor: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c' }}>
                    {submissions.map((s, i) => <option key={s.id} value={s.id}>Submission {i + 1} — {new Date(s.submitted_at).toLocaleDateString()}</option>)}
                  </select>
                  {gradeForm.submission_id && (
                    <a href={submissions.find(s => s.id === gradeForm.submission_id)?.file_url} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: navy, fontSize: 12, marginTop: 6, textDecoration: 'none' }}>
                      <ExternalLink size={12} /> View PDF submission
                    </a>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Score (0–100)</label>
                  <input type="number" min="0" max="100" required value={gradeForm.score} onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))} placeholder="87"
                    style={{ width: '100%', backgroundColor: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Feedback</label>
                  <textarea rows={4} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Provide detailed, rubric-aligned feedback..."
                    style={{ width: '100%', backgroundColor: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: isDark ? '#f1f5f9' : '#1a202c', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={grading} style={{ width: '100%', backgroundColor: ROLE_COLOR, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: grading ? 'not-allowed' : 'pointer', opacity: grading ? 0.7 : 1 }}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
