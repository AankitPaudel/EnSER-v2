import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, getProjects } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Folder, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import type { Project } from '../types'

const departments = ['Civil', 'Computer Science', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']

const statusColor = {
  open: 'text-emerald-400 bg-emerald-400/10',
  in_progress: 'text-blue-400 bg-blue-400/10',
  completed: 'text-slate-400 bg-slate-400/10',
}

export default function CommunityDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: '' })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  useEffect(() => {
    if (!profile) return
    fetchProjects()
  }, [profile])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await getProjects()
      const all: Project[] = res.data
      setMyProjects(all.filter(p => p.proposed_by === profile?.id))
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.department) { toast.error('Please select a department'); return }
    setSubmitting(true)
    try {
      await createProject({ ...form, proposed_by: profile!.id })
      toast.success('Project proposed!')
      setForm({ title: '', description: '', department: '' })
      setShowForm(false)
      fetchProjects()
    } catch {
      toast.error('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="min-h-screen fade-in">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: '#084278' }} className="text-3xl font-bold">Community Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, <strong>{profile?.full_name}</strong></p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ backgroundColor: '#084278' }}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Propose Project
          </button>
        </div>

        {/* Project Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
            <h2 className="font-semibold text-lg mb-4">New Project Proposal</h2>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Project Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Smart Traffic Light System"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the problem, goals, and expected deliverables..."
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Department</label>
              <select
                value={form.department}
                onChange={set('department')}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d} Engineering</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white px-6 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Proposals', value: myProjects.length, icon: Folder },
            { label: 'In Progress', value: myProjects.filter(p => p.status === 'in_progress').length, icon: Clock },
            { label: 'Completed', value: myProjects.filter(p => p.status === 'completed').length, icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <Icon className="text-slate-500 mb-2" size={20} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Projects List */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Your Proposals</h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : myProjects.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
              No proposals yet. Click "Propose Project" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[project.status]}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm truncate">{project.description}</p>
                    <p className="text-slate-500 text-xs mt-1">{project.department} Engineering</p>
                  </div>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="ml-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
