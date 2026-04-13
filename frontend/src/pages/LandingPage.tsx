import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const demoLogins = [
  { role: 'Student', email: 'demo-student@enser.dev', password: 'demo1234' },
  { role: 'Professor', email: 'demo-professor@enser.dev', password: 'demo1234' },
  { role: 'Community', email: 'demo-community@enser.dev', password: 'demo1234' },
]

const roleMap: Record<string, string> = {
  'demo-student@enser.dev': 'student',
  'demo-professor@enser.dev': 'professor',
  'demo-community@enser.dev': 'community',
}

export default function LandingPage() {
  const navigate = useNavigate()

  const handleDemoLogin = async (email: string, password: string) => {
    const toastId = toast.loading('Logging in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      toast.error('Demo account not set up yet. See README.', { id: toastId })
      return
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    // Auto-create profile for demo accounts if missing
    if (!profile) {
      const role = roleMap[email]
      const names: Record<string, string> = {
        student: 'Alex Johnson',
        professor: 'Dr. Maria Rodriguez',
        community: 'City Planning Department',
      }
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: names[role],
        role,
        department: role === 'student' ? 'Computer Science' : null,
      })
      profile = { role } as any
    }

    toast.success(`Welcome to EnSer! Logged in as ${profile?.role}`, { id: toastId })
    navigate(`/${profile?.role ?? ''}`)
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif" }} className="min-h-screen bg-white text-gray-800">

      {/* ── NAVBAR ── */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }} className="fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="EnSer Logo" className="h-10 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" style={{ color: '#084278' }} className="text-sm font-medium hover:text-red-600 transition-colors">Home</a>
            <a href="#about" style={{ color: '#084278' }} className="text-sm font-medium hover:text-red-600 transition-colors">About</a>
            <a href="#contact" style={{ color: '#084278' }} className="text-sm font-medium hover:text-red-600 transition-colors">Contact</a>
            <button
              onClick={() => navigate('/login')}
              style={{ color: '#084278', border: '2px solid #084278' }}
              className="text-sm font-medium px-5 py-2 rounded-full hover:bg-blue-900 hover:text-white transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ backgroundColor: '#084278' }}
              className="text-sm font-medium text-white px-5 py-2 rounded-full hover:opacity-90 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="pt-24">
        <div className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 style={{ fontFamily: "'Ubuntu', sans-serif", color: '#084278' }} className="text-5xl font-bold leading-tight mb-4">
              Real Projects.<br />
              <span className="text-gray-800">Real Impact.</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              EnSer is a service-learning platform connecting <strong>community members</strong>, <strong>students</strong>, and <strong>professors</strong> around real-world engineering challenges. Students gain hands-on experience while communities get solutions that matter.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                style={{ backgroundColor: '#084278' }}
                className="text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-md"
              >
                Join the Platform
              </button>
              <a
                href="#about"
                style={{ color: '#084278', border: '2px solid #084278' }}
                className="px-8 py-3 rounded-full font-semibold hover:bg-blue-900 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/hero-banner.png"
              alt="Engineering collaboration"
              className="w-full max-w-md rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ── DEMO LOGIN ── */}
      <section style={{ backgroundColor: '#f0f4f8' }} className="py-12">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <p style={{ color: '#084278', fontFamily: "'Ubuntu', sans-serif" }} className="text-xl font-bold mb-2">
            Try a Live Demo
          </p>
          <p className="text-gray-500 text-sm mb-6">No sign-up needed — click any role to explore</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {demoLogins.map(({ role, email, password }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(email, password)}
                style={{ backgroundColor: '#084278' }}
                className="text-white px-8 py-3 rounded-full font-semibold hover:opacity-80 transition-all shadow"
              >
                Try as {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 max-w-7xl mx-auto px-8">
        <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: '#084278' }} className="text-4xl font-bold text-center mb-4">
          How EnSer Works
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          Three roles, one platform — working together to turn community needs into engineering solutions.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'Community Proposes',
              desc: 'Local organizations and city departments submit real engineering challenges — traffic systems, water, infrastructure, and more.',
              icon: '🏙️',
            },
            {
              num: '02',
              title: 'Students Apply',
              desc: 'Engineering students browse projects by department, apply, and get an AI-generated syllabus the moment they are accepted.',
              icon: '🎓',
            },
            {
              num: '03',
              title: 'Professors Guide',
              desc: 'Professors review applications, oversee project work, and grade submissions with AI-assisted rubrics.',
              icon: '👨‍🏫',
            },
          ].map(({ num, title, desc, icon }) => (
            <div key={num} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{icon}</div>
              <div style={{ color: '#084278' }} className="text-sm font-bold mb-2 tracking-widest">{num}</div>
              <h3 style={{ fontFamily: "'Ubuntu', sans-serif", color: '#084278' }} className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ backgroundColor: '#084278' }} className="py-20 text-white">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/community.jpg"
              alt="Community collaboration"
              className="rounded-2xl shadow-xl w-full max-w-md"
            />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Ubuntu', sans-serif" }} className="text-4xl font-bold mb-6">
              About EnSer
            </h2>
            <p className="text-blue-100 leading-relaxed mb-4">
              EnSer (Engineering Service) is a service-learning platform that redefines how engineering education and community participation come together. We bridge the gap between universities and local communities.
            </p>
            <p className="text-blue-100 leading-relaxed mb-6">
              When a professor accepts a student for a project, <strong className="text-white">GPT-4o automatically generates a full syllabus and grading rubric</strong> — saving hours of administrative work and giving students a clear roadmap from day one.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'AI Syllabus', desc: 'Auto-generated on acceptance' },
                { label: 'Real Projects', desc: 'From real communities' },
                { label: 'PDF Submissions', desc: 'Stored securely in cloud' },
                { label: 'Structured Grading', desc: 'Rubric-based feedback' },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-white/10 rounded-xl p-4">
                  <div className="font-semibold text-white text-sm mb-1">{label}</div>
                  <div className="text-blue-200 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-8">
        <h2 style={{ fontFamily: "'Ubuntu', sans-serif", color: '#084278' }} className="text-4xl font-bold text-center mb-4">
          Contact Us
        </h2>
        <p className="text-gray-500 text-center mb-12">Have questions? We'd love to hear from you.</p>
        <div className="grid md:grid-cols-2 gap-12">
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              style={{ border: '1px solid #d1d5db' }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
            />
            <input
              type="email"
              placeholder="Your Email"
              style={{ border: '1px solid #d1d5db' }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
            />
            <input
              type="text"
              placeholder="Subject"
              style={{ border: '1px solid #d1d5db' }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
            />
            <textarea
              placeholder="Your message..."
              rows={5}
              style={{ border: '1px solid #d1d5db' }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none"
            />
            <button
              type="submit"
              style={{ backgroundColor: '#084278' }}
              className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Send Message
            </button>
          </form>
          <div className="space-y-6">
            <div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2744.4!2d-116.9!3d46.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDbCsDQy!5e0!3m2!1sen!2sus!4v1"
                width="100%"
                height="220"
                className="rounded-xl border-0"
                allowFullScreen
                loading="lazy"
                title="Location map"
              />
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span style={{ color: '#084278' }}>📍</span>
                <span>875 Perimeter Dr, Moscow, ID 83844</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: '#084278' }}>✉️</span>
                <span>contact@enser.dev</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: '#084278' }}>📞</span>
                <span>+1 (208) 555-0100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#084278' }} className="text-white py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="EnSer" className="h-8 w-auto brightness-0 invert" />
            <span style={{ fontFamily: "'Ubuntu', sans-serif" }} className="font-bold text-lg">EnSer 2.0</span>
          </div>
          <p className="text-blue-200 text-sm text-center">
            Built with React, FastAPI, Supabase & OpenAI GPT-4o
          </p>
          <p className="text-blue-300 text-xs">© 2024 Designed by Sohan, Ankit & Kushal</p>
        </div>
      </footer>
    </div>
  )
}
