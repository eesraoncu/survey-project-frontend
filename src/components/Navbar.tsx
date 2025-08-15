import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileText, Plus, BarChart3, Settings, LogIn, LogOut, User, Search, Grid, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const navItems = [
    { path: '/home', label: 'Ana Sayfa', icon: <FileText className="w-5 h-5" /> },
    { path: '/forms', label: 'Anketlerim', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/forms/new', label: 'Yeni Anket', icon: <Plus className="w-5 h-5" /> }
  ]

  return (
    <nav className="bg-[#1A2B6B] shadow-sm border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Sol Taraf - Logo ve Navigasyon */}
          <div className="flex items-center space-x-6">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Formlar</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Orta - Arama Çubuğu */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="AI destekli arama..."
                className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-colors duration-300"
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
            </div>
          </div>
          
          {/* Sağ Taraf - Kullanıcı Menüsü ve Araçlar */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                                 <div className="flex items-center space-x-2 text-sm text-white">
                  <User className="w-4 h-4" />
                  <span>{user?.userName} {user?.userSurname}</span>
                </div>
                                 <button
                   onClick={() => {
                     logout()
                     navigate('/login')
                   }}
                   className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                 >
                   <LogOut className="w-4 h-4" />
                   <span>Çıkış Yap</span>
                 </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </Link>
              </div>
            )}
            
                         <button className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-white">
               <Grid className="w-5 h-5" />
             </button>
             
             <button className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-white">
               <Settings className="w-5 h-5" />
             </button>
            
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{user?.userName?.charAt(0) || 'E'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


