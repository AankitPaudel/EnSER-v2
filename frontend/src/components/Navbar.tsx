import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Zap } from 'lucide-react'

export default function Navbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const dashboardPath =
    profile?.role === 'student' ? '/student' :
    profile?.role === 'professor' ? '/professor' :
    profile?.role === 'community' ? '/community' : '/'

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Zap className="text-blue-400" size={22} />
          EnSer
          <span className="text-blue-400 text-sm font-medium">2.0</span>
        </Link>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link to={dashboardPath} className="text-slate-300 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
              <span className="text-slate-500 text-sm">{profile.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white text-sm transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
