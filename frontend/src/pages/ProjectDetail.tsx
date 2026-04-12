import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, applyToProject } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { ArrowLeft, Building2, Calendar, CheckCircle } from 'lucide-react'
import type { Project } from '../types'

const statusColor = {
  open: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    getProject(Number(id))
      .then(res => setProject(res.data))
      .catch(() => toast.error('Project not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!profile) { navigate('/login'); return }

    const { data: profs } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'professor')
      .limit(1)
      .single()

    if (!profs) { toast.error('No professors available'); return }

    setApplying(true)
    try {
      await applyToProject({
        project_id: Number(id),
        student_id: profile.id,
        professor_id: profs.id,
      })
      toast.success('Application submitted!')
      navigate('/student')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-slate-400">Project not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} /> {project.department} Engineering
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full border capitalize ${statusColor[project.status]}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-6 mb-8">
            <h2 className="font-semibold text-slate-300 mb-3">Project Description</h2>
            <p className="text-slate-400 leading-relaxed">{project.description}</p>
          </div>

          {profile?.role === 'student' && project.status === 'open' && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <CheckCircle size={16} />
              {applying ? 'Applying...' : 'Apply to this project'}
            </button>
          )}

          {!profile && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
              <button onClick={() => navigate('/login')} className="underline">Sign in</button> as a student to apply to this project.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
