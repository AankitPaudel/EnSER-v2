import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import {
  getProjects,
  getStudentApplications,
  applyToProject,
  getSyllabusByApplication,
  createSubmission,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  Search, Upload, CheckCircle,
  Clock, XCircle, Brain,
} from 'lucide-react'
import type { Project, Application, Syllabus } from '../types'

const departments = ['All', 'Civil', 'Computer Science', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']

const statusIcon = {
  pending: <Clock className="text-yellow-400" size={14} />,
  accepted: <CheckCircle className="text-emerald-400" size={14} />,
  rejected: <XCircle className="text-red-400" size={14} />,
}

const statusColor = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  accepted: 'text-emerald-400 bg-emerald-400/10',
  rejected: 'text-red-400 bg-red-400/10',
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'browse' | 'applications'>('browse')
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [dept, setDept] = useState('All')
  const [search, setSearch] = useState('')
  const [professors, setProfessors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [syllabusModal, setSyllabusModal] = useState<Syllabus | null>(null)
  const [uploadingFor, setUploadingFor] = useState<number | null>(null)

  useEffect(() => {
    if (!profile) return
    fetchAll()
  }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [projRes, appRes] = await Promise.all([
        getProjects(),
        getStudentApplications(profile!.id),
      ])
      setProjects(projRes.data)
      setApplications(appRes.data)

      // Fetch professor names
      const profIds = [...new Set((appRes.data as Application[]).map(a => a.professor_id))]
      if (profIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', profIds)
        const map: Record<string, string> = {}
        profs?.forEach((p: { id: string; full_name: string }) => { map[p.id] = p.full_name })
        setProfessors(map)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (projectId: number) => {
    // For demo, we auto-pick first professor; in production you'd have a professor selector
    const { data: profs } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'professor')
      .limit(1)
      .single()

    if (!profs) { toast.error('No professors available yet'); return }

    setApplying(projectId)
    try {
      await applyToProject({
        project_id: projectId,
        student_id: profile!.id,
        professor_id: profs.id,
      })
      toast.success('Application submitted!')
      fetchAll()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Already applied or error occurred')
    } finally {
      setApplying(null)
    }
  }

  const openSyllabus = async (applicationId: number) => {
    try {
      const res = await getSyllabusByApplication(applicationId)
      setSyllabusModal(res.data)
    } catch {
      toast.error('Syllabus not available yet')
    }
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
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed')
    } finally {
      setUploadingFor(null)
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesDept = dept === 'All' || p.department === dept
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch && p.status === 'open'
  })

  const appliedIds = new Set(applications.map(a => a.project_id))

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="min-h-screen fade-in">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: 'var(--navy)' }} className="text-3xl font-bold">Student Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Welcome, <strong style={{ color: 'var(--text)' }}>{profile?.full_name}</strong> · {profile?.department} Engineering</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {(['browse', 'applications'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={tab === t ? { borderBottomColor: '#084278', color: '#084278' } : {}}
              className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                tab === t ? '' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === 'browse' ? 'Browse Projects' : `My Applications (${applications.length})`}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {tab === 'browse' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={dept}
                onChange={e => setDept(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : `${d} Engineering`}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="text-slate-400 text-sm">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
                No open projects found. Try a different filter.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredProjects.map(project => {
                  const applied = appliedIds.has(project.id)
                  return (
                    <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">{project.department} Engineering</p>
                        </div>
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Open</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="flex-1 text-center text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => handleApply(project.id)}
                          disabled={applied || applying === project.id}
                          className={`flex-1 text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                            applied
                              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          {applying === project.id ? 'Applying...' : applied ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-slate-400 text-sm">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
                No applications yet. Browse projects and apply!
              </div>
            ) : (
              applications.map(app => {
                const project = projects.find(p => p.id === app.project_id)
                return (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{project?.title ?? `Project #${app.project_id}`}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Professor: {professors[app.professor_id] ?? 'Unknown'}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full capitalize ${statusColor[app.status]}`}>
                        {statusIcon[app.status]} {app.status}
                      </span>
                    </div>

                    {app.status === 'accepted' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => openSyllabus(app.id)}
                          className="flex items-center gap-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Brain size={14} /> View AI Syllabus
                        </button>
                        <label className={`flex items-center gap-1.5 text-sm border px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                          uploadingFor === app.id
                            ? 'opacity-60 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}>
                          <Upload size={14} />
                          {uploadingFor === app.id ? 'Uploading...' : 'Upload Submission'}
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            disabled={uploadingFor === app.id}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(app.id, file)
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Syllabus Modal */}
      {syllabusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSyllabusModal(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-blue-400" size={20} />
              <h2 className="font-semibold text-lg">AI-Generated Syllabus</h2>
              <span className="ml-auto text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                Generated by GPT-4o
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Syllabus</h3>
              <pre className="text-slate-400 text-sm whitespace-pre-wrap font-sans leading-relaxed">{syllabusModal.content}</pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Grading Rubric</h3>
              <pre className="text-slate-400 text-sm whitespace-pre-wrap font-sans leading-relaxed">{syllabusModal.rubric}</pre>
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
    </div>
  )
}
