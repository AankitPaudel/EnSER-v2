import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useTheme } from '../lib/theme'
import { Sun, Moon } from 'lucide-react'

const demoLogins = [
  { role: 'Student', email: 'demo-student@enser.dev', password: 'demo1234', color: '#10b981', icon: '🎓' },
  { role: 'Professor', email: 'demo-professor@enser.dev', password: 'demo1234', color: '#7c3aed', icon: '👨‍🏫' },
  { role: 'Community', email: 'demo-community@enser.dev', password: 'demo1234', color: '#f59e0b', icon: '🏙️' },
]

const roleMap: Record<string, string> = {
  'demo-student@enser.dev': 'student',
  'demo-professor@enser.dev': 'professor',
  'demo-community@enser.dev': 'community',
}
const nameMap: Record<string, string> = {
  student: 'Henry Thompson',
  professor: 'Dr. Richard Chen',
  community: 'City Planning Department',
}
const deptMap: Record<string, string | null> = {
  student: 'Computer Science',
  professor: 'Computer Science',
  community: null,
}

const workflowRoles = [
  { icon: '🏙️', role: 'Community', color: '#f59e0b', blurb: 'Shares real-world engineering problems.' },
  { icon: '🎓', role: 'Students', color: '#10b981', blurb: 'Apply → get AI syllabus → build & submit projects/reports.' },
  { icon: '👨‍🏫', role: 'Professors', color: '#7c3aed', blurb: 'Review → evaluate → grade with feedback.' },
] as const

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const handleDemoLogin = async (email: string, password: string) => {
    const toastId = toast.loading('Logging in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      toast.error('Demo account not set up yet. Create it in Supabase Auth first.', { id: toastId })
      return
    }
    let { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (!profile) {
      const role = roleMap[email]
      await supabase.from('profiles').insert({
        id: data.user.id, full_name: nameMap[role], role, department: deptMap[role],
      })
      profile = { role } as any
    }
    toast.success(`Welcome! Exploring as ${profile?.role}`, { id: toastId })
    navigate(`/${profile?.role ?? ''}`)
  }

  const navy = '#084278'
  const isDark = theme === 'dark'

  return (
    <div className="antialiased" style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1a202c' }}>

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#084278]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[#084278]/88 px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80">
            <img src="/logo.png" alt="EnSer" style={{ height: 42, width: 42, borderRadius: '50%', objectFit: 'cover' }} />
            <span className="text-white font-bold text-xl" style={{ fontFamily: "'Ubuntu', sans-serif" }}>
              EnSer <span className="text-blue-300 text-sm font-normal">2.0</span>
            </span>
          </a>
          <div className="flex items-center gap-6">
            {['Home', 'Workflow', 'About', 'Contact'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-blue-200 hover:text-white text-sm font-medium transition-colors hidden md:block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
              >
                {item}
              </a>
            ))}
            <button onClick={toggle} className="text-blue-200 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              {isDark ? <Sun size={17}/> : <Moon size={17}/>}
            </button>
            <button onClick={() => navigate('/login')} className="text-blue-200 hover:text-white text-sm font-medium transition-colors hidden sm:block">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-white text-blue-900 text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-50 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="home" style={{ background: `linear-gradient(135deg, ${navy} 0%, #0a5299 50%, #1a3a6b 100%)` }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-20 md:pt-14 md:pb-24 lg:pt-12 grid md:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start relative z-10">
          <div className="md:pr-2 lg:pr-4 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full mb-5 font-medium tracking-wide">
              ⚡ React 18 · TypeScript · FastAPI · PostgreSQL · Supabase
            </div>
            <h1 style={{ fontFamily: "'Ubuntu', sans-serif" }} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.08] mb-5">
              Engineering<br />
              <span style={{ color: '#60a5fa' }}>Meets</span> Real<br />
              World Impact
            </h1>
            <p className="text-blue-100/95 text-base md:text-lg leading-relaxed mb-8 max-w-xl text-pretty">
              <strong className="text-white">Real partners, real deliverables.</strong> Cities and organizations post real engineering challenges; students choose projects, follow AI-guided syllabuses, and deliver real solutions; professors evaluate with structured, AI-powered rubrics and provide clear feedback; and communities validate outcomes and suggest improvements—creating a seamless, end-to-end ecosystem that turns real-world problems into impactful, career-ready experience.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button onClick={() => navigate('/register')} className="bg-white font-bold px-7 sm:px-8 py-3.5 rounded-full hover:bg-blue-50 transition-all shadow-lg text-sm" style={{ color: navy }}>
                Join for Free →
              </button>
              <a href="#demo" className="border-2 border-white/40 text-white font-semibold px-7 sm:px-8 py-3.5 rounded-full hover:bg-white/10 transition-all text-sm inline-flex items-center justify-center">
                Live Demo
              </a>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-8 sm:mt-9">
              {['React 18','TypeScript','FastAPI','Supabase','GPT-4o','Tailwind'].map(tech => (
                <span key={tech} className="bg-white/10 border border-white/20 text-blue-100/95 text-xs px-3 py-1.5 rounded-full font-medium">{tech}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center md:justify-end w-full mt-8 md:mt-10 lg:mt-12">
            <div className="relative w-full max-w-md lg:max-w-lg shrink-0">
              <div className="absolute -inset-3 sm:-inset-4 bg-blue-400/25 rounded-3xl blur-2xl" />
              <img
                src="/hero-banner.png"
                alt="Engineering collaboration"
                className="relative w-full h-auto rounded-2xl shadow-2xl border-2 border-white/25 ring-1 ring-black/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderTop: `4px solid ${navy}` }} className="py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '3', label: 'User Roles', icon: '👥' },
            { num: 'AI', label: 'Syllabus Generation', icon: '🤖' },
            { num: '∞', label: 'Real Projects', icon: '🏗️' },
            { num: '100%', label: 'Free to Use', icon: '✅' },
          ].map(({ num, label, icon }) => (
            <div key={label}>
              <div className="text-3xl mb-1">{icon}</div>
              <div style={{ color: navy, fontFamily: "'Ubuntu', sans-serif" }} className="text-3xl font-bold">{num}</div>
              <div style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKFLOW ──────────────────────────────────────── */}
      <section
        id="workflow"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        }}
        className="py-16"
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 leading-tight px-2">
            EnSer (Engineering Service) – Workflow
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {workflowRoles.map(({ icon, role, color, blurb }) => (
              <div
                key={role}
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderTop: `3px solid ${color}`,
                }}
                className="rounded-2xl p-5 text-left shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl" aria-hidden>{icon}</span>
                  <span style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="font-bold text-lg">
                    {role}
                  </span>
                </div>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-sm leading-relaxed">
                  {blurb}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              backgroundColor: isDark ? '#172554' : '#eff6ff',
              border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`,
            }}
            className="mt-10 rounded-2xl px-5 py-4 sm:px-8 text-center max-w-3xl mx-auto"
          >
            <p className="text-base sm:text-lg leading-relaxed m-0" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <span className="mr-1.5" aria-hidden>👉</span>
              <strong style={{ color: navy }}>Simple workflow:</strong>{' '}
              <span style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Problem → Student builds → Professor evaluates</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────────────── */}
      <section id="demo" style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            className={`inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider border ${
              isDark ? 'bg-blue-950/50 text-blue-200 border-blue-800/60' : 'bg-blue-100 text-blue-800 border-transparent'
            }`}
          >
            No Sign-up Required
          </div>
          <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-4xl font-bold mb-4">
            Try a Live Demo
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-lg mb-10">
            Click any role to instantly explore a fully pre-loaded dashboard with real projects, syllabuses, and grades.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {demoLogins.map(({ role, email, password, color, icon }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(email, password)}
                style={{ borderTop: `4px solid ${color}`, backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderTopColor: color, borderTopWidth: 4 }}
                className="rounded-2xl p-7 text-left hover:shadow-xl transition-all group hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-xl font-bold mb-2">Try as {role}</h3>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-sm leading-relaxed mb-4">
                  {role === 'Student' && 'Browse real projects, submit applications, view your AI-generated syllabus and grades.'}
                  {role === 'Professor' && 'Review student applications, generate AI syllabuses, grade submissions with rubrics.'}
                  {role === 'Community' && 'Propose engineering challenges, track project status, give feedback on submissions.'}
                </p>
                <span style={{ backgroundColor: color }} className="inline-block text-white text-xs font-bold px-4 py-2 rounded-full group-hover:opacity-90 transition-opacity">
                  Enter as {role} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-4xl font-bold mb-4">How EnSer Works</h2>
            <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-lg max-w-xl mx-auto">One platform, three roles, zero friction — from community need to graded engineering solution.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🏙️', title: 'Community Proposes', color: '#f59e0b', desc: 'City departments and local organizations submit real engineering challenges — traffic systems, bridges, energy, and more. Each project specifies department and deliverables.' },
              { step: '02', icon: '🎓', title: 'Students Apply', color: '#10b981', desc: 'Engineering students browse projects, filter by department, and submit applications. The moment a professor accepts, GPT-4o auto-generates a full syllabus and grading rubric.' },
              { step: '03', icon: '👨‍🏫', title: 'Professors Guide & Grade', color: '#7c3aed', desc: 'Professors review applications, oversee project milestones, receive PDF submissions, and grade with AI-generated structured rubrics. Fully paperless workflow.' },
            ].map(({ step, icon, title, color, desc }) => (
              <div key={step} style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderLeft: `4px solid ${color}` }} className="rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{icon}</span>
                  <span style={{ color, fontFamily: "'Ubuntu', sans-serif" }} className="text-sm font-bold tracking-widest">{step}</span>
                </div>
                <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-xl font-bold mb-3">{title}</h3>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff' }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-4xl font-bold mb-4">Everything Built In</h2>
            <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-lg">Every feature a modern engineering service platform needs — out of the box.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Syllabus Generation', desc: 'Professors can use their own AI API key to instantly generate a complete syllabus — weekly milestones, learning objectives, and a structured grading rubric.', color: '#084278' },
              { icon: '🔐', title: 'Role-Based Auth', desc: 'Three distinct roles — Community, Student, Professor — each with their own dashboard, permissions, and workflow powered by Supabase Auth.', color: '#7c3aed' },
              { icon: '📄', title: 'PDF Submission System', desc: 'Students upload final project reports as PDFs directly to Supabase Storage. Professors can view and download them for review.', color: '#10b981' },
              { icon: '⭐', title: 'Structured Grading', desc: 'Professors grade submissions with a score and detailed rubric-aligned feedback. Students receive transparent, structured evaluations.', color: '#f59e0b' },
              { icon: '🔔', title: 'Real-time Notifications', desc: 'Students know instantly when applications are accepted or rejected. Professors are alerted when new applications arrive for their review.', color: '#ef4444' },
              { icon: '🔑', title: 'Bring Your Own API Key', desc: 'Professors enter their own AI key — stored only in their browser, never on the server. Full control, no shared costs, no lock-in.', color: '#06b6d4' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }} className="rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div style={{ backgroundColor: `${color}18`, width: 48, height: 48 }} className="rounded-xl flex items-center justify-center text-2xl mb-4">{icon}</div>
                <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="font-bold text-lg mb-2">{title}</h3>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <section id="about" style={{ backgroundColor: navy }} className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div className="md:pt-1">
            <img src="/community.jpg" alt="Community engineering" className="rounded-2xl shadow-2xl w-full" />
          </div>
          <div>
            <div className="inline-block bg-white/15 text-blue-100 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">About EnSer</div>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif" }} className="text-4xl font-bold text-white mb-6">
              Redefining Engineering Education
            </h2>
            <p className="text-blue-100 leading-relaxed mb-8">
              <strong className="text-white">EnSer (Engineering Service)</strong> is where university engineering meets community impact: departments take on live infrastructure, environmental, and tech challenges from real partners—not textbook drills. Faculty still run the course, but can use an AI key to <strong className="text-white">generate a professional syllabus and grading rubric in one step</strong>, cutting hours of admin before the work even starts.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🤖', label: 'AI Syllabus', sub: 'Generated in seconds' },
                { icon: '🏗️', label: 'Real Projects', sub: 'From real communities' },
                { icon: '☁️', label: 'Cloud Storage', sub: 'PDF submissions' },
                { icon: '📊', label: 'Smart Grading', sub: 'Rubric-based feedback' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────── */}
      <section id="contact" style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: isDark ? '#f1f5f9' : navy }} className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Have questions or want to bring EnSer to your institution? We'd love to connect.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {[
                { placeholder: 'Your Name', type: 'text' },
                { placeholder: 'Email Address', type: 'email' },
                { placeholder: 'Subject', type: 'text' },
              ].map(({ placeholder, type }) => (
                <input
                  key={placeholder}
                  type={type}
                  placeholder={placeholder}
                  style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: isDark ? '#f1f5f9' : '#1a202c' }}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              ))}
              <textarea
                placeholder="Your message..."
                rows={5}
                style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: isDark ? '#f1f5f9' : '#1a202c' }}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
              />
              <button type="submit" style={{ backgroundColor: navy }} className="w-full text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#062f5a' }} className="text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="EnSer" style={{ height: 42, width: 42, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: "'Ubuntu', sans-serif" }} className="font-bold text-xl">EnSer 2.0</div>
                <div className="text-blue-300 text-xs">Engineering Service Platform</div>
              </div>
            </div>
            <div className="flex gap-6">
              {['Home', 'Workflow', 'About', 'Contact', 'Sign In', 'Register'].map(item => (
                <a key={item} href={item === 'Sign In' ? '#' : item === 'Register' ? '#' : `#${item.toLowerCase()}`}
                  onClick={item === 'Sign In' ? () => navigate('/login') : item === 'Register' ? () => navigate('/register') : undefined}
                  className="text-blue-200 hover:text-white text-sm transition-colors">{item}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-300">
            <span>Built with React 18, TypeScript, FastAPI & Supabase</span>
            <span>© 2026 Built by Ankit Paudel</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
