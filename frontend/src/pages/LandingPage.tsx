import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Zap, Users, GraduationCap, Building2, Brain, ArrowRight, GitBranch } from 'lucide-react'

const demoLogins = [
  { role: 'Student', email: 'demo-student@enser.dev', password: 'demo1234', color: 'bg-emerald-600 hover:bg-emerald-500' },
  { role: 'Professor', email: 'demo-professor@enser.dev', password: 'demo1234', color: 'bg-purple-600 hover:bg-purple-500' },
  { role: 'Community', email: 'demo-community@enser.dev', password: 'demo1234', color: 'bg-orange-600 hover:bg-orange-500' },
]

const roles = [
  {
    icon: Building2,
    title: 'Community Members',
    description: 'Propose real-world engineering projects that matter. Connect with universities to get them built.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Apply to projects in your department. Receive an AI-generated syllabus and build your portfolio.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: Users,
    title: 'Professors',
    description: 'Manage student applications, review AI-generated syllabuses, and grade submissions with ease.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
]

const features = [
  { icon: Brain, title: 'AI Syllabus Generation', desc: 'GPT-4o generates a full syllabus and grading rubric the moment a student is accepted.' },
  { icon: Zap, title: 'Real-time Applications', desc: 'Students apply, professors respond, and everyone stays in sync instantly.' },
  { icon: GraduationCap, title: 'PDF Submissions', desc: 'Students upload final reports. Professors review and grade with structured feedback.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  const handleDemoLogin = async (email: string, password: string) => {
    const toastId = toast.loading('Logging in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      toast.error('Demo account not set up yet. See README.', { id: toastId })
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    toast.success('Welcome to EnSer!', { id: toastId })
    navigate(`/${profile?.role ?? ''}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Zap className="text-blue-400" size={22} />
            EnSer <span className="text-blue-400 text-sm font-medium">2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white text-sm transition-colors">
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6">
          <Brain size={14} />
          Powered by GPT-4o
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Engineering meets <br /> real-world impact
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          EnSer connects communities, students, and professors around meaningful engineering projects — with AI-powered syllabuses generated on demand.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get started free <ArrowRight size={16} />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 px-6 py-3 rounded-lg transition-colors"
          >
            <GitBranch size={16} /> View on GitHub
          </a>
        </div>

        {/* Demo Logins */}
        <div className="mt-10 p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg mx-auto">
          <p className="text-slate-400 text-sm mb-4 font-medium">Try a live demo — no sign-up needed</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {demoLogins.map(({ role, email, password, color }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(email, password)}
                className={`flex-1 ${color} text-white text-sm px-4 py-2.5 rounded-lg font-medium transition-colors`}
              >
                Try as {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Built for everyone in the loop</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ icon: Icon, title, description, color, bg }) => (
            <div key={title} className={`${bg} border rounded-2xl p-6`}>
              <Icon className={`${color} mb-4`} size={28} />
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need, built in</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
                <Icon className="text-blue-400" size={22} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="text-blue-400" size={16} />
          <span className="text-white font-medium">EnSer 2.0</span>
        </div>
        Built with React, FastAPI, Supabase &amp; OpenAI GPT-4o
      </footer>
    </div>
  )
}
