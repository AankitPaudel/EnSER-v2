import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import {
  getProfessorApplications,
  acceptApplication,
  rejectApplication,
  getSyllabus,
  getSyllabusByApplication,
  getSubmissions,
  assignGrade,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  CheckCircle, XCircle, Brain,
  Star, ExternalLink
} from 'lucide-react'
import type { Application, Syllabus, Submission } from '../types'


export default function ProfessorDashboard() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})
  const [projectTitles, setProjectTitles] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'accepted' | 'grading'>('pending')

  // AI syllabus modal
  const [generatingFor, setGeneratingFor] = useState<number | null>(null)
  const [syllabusModal, setSyllabusModal] = useState<Syllabus | null>(null)

  // Grading modal
  const [gradingApp, setGradingApp] = useState<Application | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [gradeForm, setGradeForm] = useState({ submission_id: 0, score: '', feedback: '' })
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchAll()
  }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getProfessorApplications(profile!.id)
      const apps: Application[] = res.data
      setApplications(apps)

      // Fetch student names
      const studentIds = [...new Set(apps.map(a => a.student_id))]
      if (studentIds.length > 0) {
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds)
        const map: Record<string, string> = {}
        students?.forEach((s: { id: string; full_name: string }) => { map[s.id] = s.full_name })
        setStudentNames(map)
      }

      // Fetch project titles
      const projectIds = [...new Set(apps.map(a => a.project_id))]
      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds)
        const map: Record<number, string> = {}
        projects?.forEach((p: { id: number; title: string }) => { map[p.id] = p.title })
        setProjectTitles(map)
      }
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (app: Application) => {
    setGeneratingFor(app.id)
    try {
      const res = await acceptApplication(app.id)
      const syllabusRes = await getSyllabus(res.data.syllabus_id)
      setSyllabusModal(syllabusRes.data)
      toast.success('Application accepted! AI syllabus generated.')
      fetchAll()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to accept application')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectApplication(id)
      toast.success('Application rejected')
      fetchAll()
    } catch {
      toast.error('Failed to reject')
    }
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
      await assignGrade({
        submission_id: gradeForm.submission_id,
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
      })
      toast.success('Grade submitted!')
      setGradingApp(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to submit grade')
    } finally {
      setGrading(false)
    }
  }

  const pending = applications.filter(a => a.status === 'pending')
  const accepted = applications.filter(a => a.status === 'accepted')

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Professor Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome, {profile?.full_name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', value: pending.length, color: 'text-yellow-400' },
            { label: 'Active Students', value: accepted.length, color: 'text-emerald-400' },
            { label: 'Total Applications', value: applications.length, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          {(['pending', 'accepted', 'grading'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                tab === t ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t === 'pending' ? `Pending (${pending.length})` : t === 'accepted' ? `Active (${accepted.length})` : 'Grade Submissions'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          <>
            {/* Pending */}
            {tab === 'pending' && (
              <div className="space-y-4">
                {pending.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
                    No pending applications.
                  </div>
                ) : pending.map(app => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{studentNames[app.student_id] ?? 'Student'}</h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                          Applied to: <span className="text-white">{projectTitles[app.project_id] ?? `Project #${app.project_id}`}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(app.id)}
                          className="flex items-center gap-1.5 text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => handleAccept(app)}
                          disabled={generatingFor === app.id}
                          className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {generatingFor === app.id ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating syllabus...
                            </>
                          ) : (
                            <><CheckCircle size={14} /> Accept</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active */}
            {tab === 'accepted' && (
              <div className="space-y-4">
                {accepted.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
                    No active students yet.
                  </div>
                ) : accepted.map(app => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{studentNames[app.student_id] ?? 'Student'}</h3>
                        <p className="text-slate-400 text-sm">{projectTitles[app.project_id] ?? `Project #${app.project_id}`}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const { data } = await getSyllabusByApplication(app.id)
                              setSyllabusModal(data)
                            } catch { toast.error('Syllabus not found') }
                          }}
                          className="flex items-center gap-1.5 text-sm text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Brain size={14} /> View Syllabus
                        </button>
                        <button
                          onClick={() => openGrading(app)}
                          className="flex items-center gap-1.5 text-sm text-purple-400 border border-purple-400/20 hover:bg-purple-400/10 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Star size={14} /> Grade
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grading tab — redirects user to click Grade from active tab */}
            {tab === 'grading' && (
              <div className="text-slate-400 text-sm text-center py-10">
                Go to the <button onClick={() => setTab('accepted')} className="text-purple-400 underline">Active tab</button> and click "Grade" on a student to open the grading panel.
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Syllabus Modal */}
      {syllabusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSyllabusModal(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <Brain className="text-blue-400" size={20} />
              <h2 className="font-semibold text-lg">AI-Generated Syllabus</h2>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-full">
                <Brain size={11} /> Generated by GPT-4o
              </span>
            </div>

            <div className="mb-6 p-4 bg-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">📋 Syllabus</h3>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{syllabusModal.content}</pre>
            </div>

            <div className="p-4 bg-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">📊 Grading Rubric</h3>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{syllabusModal.rubric}</pre>
            </div>

            <button
              onClick={() => setSyllabusModal(null)}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setGradingApp(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-semibold text-lg mb-1">Grade Submission</h2>
            <p className="text-slate-400 text-sm mb-6">
              Student: {studentNames[gradingApp.student_id]} · {projectTitles[gradingApp.project_id]}
            </p>

            {submissions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No submissions uploaded yet.</p>
            ) : (
              <form onSubmit={submitGrade} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Submission</label>
                  <select
                    value={gradeForm.submission_id}
                    onChange={e => setGradeForm(f => ({ ...f, submission_id: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {submissions.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        Submission {i + 1} — {new Date(s.submitted_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  {gradeForm.submission_id && (
                    <a
                      href={submissions.find(s => s.id === gradeForm.submission_id)?.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-400 text-xs mt-2 hover:underline"
                    >
                      <ExternalLink size={12} /> Open PDF
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Score (0–100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeForm.score}
                    onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Feedback</label>
                  <textarea
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                    placeholder="Detailed feedback for the student..."
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={grading}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {grading ? 'Submitting...' : 'Submit Grade'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradingApp(null)}
                    className="text-slate-400 hover:text-white px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
