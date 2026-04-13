import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const departments = ['Civil', 'Computer Science', 'Computer Science Engineering', 'Electrical', 'Mechanical', 'Chemical', 'Environmental', 'Industrial']
const roles = [
  { value: 'community', label: 'Community Member' },
  { value: 'student', label: 'Student' },
  { value: 'professor', label: 'Professor' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error || !data.user) {
      toast.error(error?.message ?? 'Registration failed')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: form.full_name,
      role: form.role,
      department: form.department || null,
    })

    if (profileError) {
      toast.error('Account created but profile setup failed. Please contact support.')
      setLoading(false)
      return
    }

    toast.success('Account created! Welcome to EnSer.')
    navigate(`/${form.role}`)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: '#f0f4f8' }} className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }} className="px-8 py-3">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <img src="/logo.png" alt="EnSer" className="h-10 w-auto" />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div style={{ backgroundColor: '#084278' }} className="px-8 py-6 text-center">
              <h1 style={{ fontFamily: "'Ubuntu', sans-serif" }} className="text-2xl font-bold text-white">Create Your Account</h1>
              <p className="text-blue-200 text-sm mt-1">Join the EnSer platform</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="px-8 py-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={set('full_name')}
                  placeholder="Jane Smith"
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={set('role')}
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-gray-400 font-normal">(optional for community)</span>
                </label>
                <select
                  value={form.department}
                  onChange={set('department')}
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  <option value="">Select department</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d} Engineering</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#084278' }}
                className="w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#084278' }} className="font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
