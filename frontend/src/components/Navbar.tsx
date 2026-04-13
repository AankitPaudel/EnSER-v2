import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'

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
    <nav style={{ backgroundColor: '#084278', fontFamily: "'Poppins', sans-serif" }} className="px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="EnSer" className="h-9 w-auto brightness-0 invert" />
          <span className="text-white font-bold text-lg">EnSer <span className="text-blue-300 text-sm font-medium">2.0</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link to={dashboardPath} className="text-blue-200 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
              <span className="text-blue-300 text-sm">{profile.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-blue-200 hover:text-red-400 text-sm transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-200 hover:text-white text-sm transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-900 text-sm px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition-colors"
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
