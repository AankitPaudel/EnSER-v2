import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      toast.success('Welcome back!')
      navigate(`/${profile?.role ?? ''}`)
    }

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
              <h1 style={{ fontFamily: "'Ubuntu', sans-serif" }} className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-blue-200 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ border: '1px solid #d1d5db' }}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ border: '1px solid #d1d5db' }}
                    className="w-full px-4 py-3 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#084278' }}
                className="w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#084278' }} className="font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
