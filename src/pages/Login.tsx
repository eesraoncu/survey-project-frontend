import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Moon,
  Sun,
  LayoutDashboard,
  Layers
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    // Login işlemi simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      // Başarılı giriş sonrası ana sayfaya yönlendir
      navigate('/home');
    }, 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    // Kayıt işlemi simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      // Başarılı kayıt sonrası giriş sekmesine geç
      setActiveTab('login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden flex items-center justify-center p-4 transition-colors duration-300">
              {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 dark:bg-blue-400/20 rounded-full"
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{ duration: Math.random() * 15 + 15, repeat: Infinity }}
            />
          ))}
        </div>

              {/* Main Card */}
        <motion.div 
          className="w-full max-w-md bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-slate-800/90 dark:via-blue-900/90 dark:to-indigo-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 dark:border-white/20 overflow-hidden transition-colors duration-300"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
                  {/* Header with Logo and Landscape */}
          <div className="relative h-48 bg-gradient-to-br from-slate-200 to-blue-300 dark:from-slate-700 dark:to-blue-800 overflow-hidden transition-colors duration-300">
          {/* Landscape Illustration */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-full h-full">
              {/* Mountains */}
              <div className="absolute bottom-0 left-0 w-full h-32">
                <div className="absolute bottom-0 left-1/4 w-16 h-16 bg-slate-600 transform rotate-45"></div>
                <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-slate-500 transform rotate-45"></div>
                <div className="absolute bottom-0 right-1/4 w-14 h-14 bg-slate-700 transform rotate-45"></div>
              </div>
              {/* Trees */}
              <div className="absolute bottom-0 left-0 w-full h-20">
                <div className="absolute bottom-0 left-1/3 w-8 h-8 bg-green-800 transform rotate-45"></div>
                <div className="absolute bottom-0 left-1/2 w-6 h-6 bg-green-700 transform rotate-45"></div>
                <div className="absolute bottom-0 right-1/3 w-10 h-10 bg-green-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
          
          {/* Logo and Theme Toggle */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={toggleTheme}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-6 h-6 text-white" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-white">SURVEY APP</h1>
                <p className="text-xs text-white">START YOUR JOURNEY. TODAY.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-8 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'login' 
                  ? 'text-white border-b-2 border-green-400 pb-1' 
                  : 'text-blue-300 hover:text-white'
              }`}
            >
              GİRİŞ YAP
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'signup' 
                  ? 'text-white border-b-2 border-green-400 pb-1' 
                  : 'text-blue-300 hover:text-white'
              }`}
            >
              KAYIT OL
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Email Field */}
              <div className="space-y-2">
                                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-blue-200">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 backdrop-blur-xl transition-colors duration-300"
                      placeholder="E-posta adresinizi girin"
                      required
                    />
                  </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-blue-200">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 backdrop-blur-xl transition-colors duration-300"
                    placeholder="Şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-blue-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02, y: -1 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    </motion.div>
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>GİRİŞ YAP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-slate-800 to-blue-900 px-2 text-blue-300">veya</span>
                </div>
              </div>

              {/* Alternative Login Providers */}
              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  type="button"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>GOOGLE İLE GİRİŞ YAP</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>TRELLO İLE GİRİŞ YAP</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-700 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Layers className="w-5 h-5" />
                  <span>JIRA İLE GİRİŞ YAP</span>
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <motion.form 
              onSubmit={handleSignup}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-sm font-medium text-blue-200">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type="email"
                    id="signup-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 backdrop-blur-xl"
                    placeholder="E-posta adresinizi girin"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-medium text-blue-200">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-blue-300 backdrop-blur-xl"
                    placeholder="Şifrenizi oluşturun"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Signup Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02, y: -1 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    </motion.div>
                    <span>Hesap Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <span>HESAP OLUŞTUR</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-slate-800 to-blue-900 px-2 text-blue-300">veya</span>
                </div>
              </div>

              {/* Alternative Signup */}
              <motion.button
                type="button"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>GOOGLE İLE KAYIT OL</span>
              </motion.button>
            </motion.form>
          )}

          {/* Bottom Links */}
          <div className="mt-8 text-center space-y-3">
            {activeTab === 'login' ? (
              <p className="text-sm text-gray-600 dark:text-blue-300">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-blue-300">
                Zaten hesabınız var mı?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                >
                  Giriş yapın
                </button>
              </p>
            )}


          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
