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
  Layers,
  User,
  Calendar,
  MapPin,
  Building,
  Home,
  Navigation
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { getCities, getDistricts, getDistrictTownshipTowns, getNeighbourhoods } from '../services/addressService';
import { getTrelloAuthUrl } from '../services/trelloService';
import { getJiraAuthUrl } from '../services/jiraService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    userName: '',
    userSurname: '',
    userEmail: '',
    userPassword: '',
    userAge: '',
    cityName: '',
    districtName: '',
    districtTownshipTownName: '',
    neighbourhoodName: '',
    addressDetails: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{[key: string]: string}>({});
  // Address data lists
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [townships, setTownships] = useState<string[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>([]);
  const [addressLoading, setAddressLoading] = useState({ cities: false, districts: false, townships: false, neighbourhoods: false });
  
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login, register, loginWithGoogle } = useAuth();

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Google login success:', response);
        const success = await loginWithGoogle(response.access_token);
        
        if (success) {
          navigate('/home');
        } else {
          alert('Google ile giriş başarısız!');
        }
      } catch (error: any) {
        console.error('Google login error:', error);
        alert(error.message || 'Google ile giriş yapılırken bir hata oluştu');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      alert('Google ile giriş yapılırken bir hata oluştu');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    try {
      const success = await login(email.trim(), password);
      
      if (success) {
        navigate('/home');
      } else {
        alert('Giriş başarısız! E-posta veya şifre hatalı.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Address cascading loaders
  React.useEffect(() => {
    const load = async () => {
      try {
        setAddressLoading((s) => ({ ...s, cities: true }));
        const list = await getCities();
        setCities(list);
      } catch (err) {
        console.error('Şehir listesi yüklenemedi', err);
      } finally {
        setAddressLoading((s) => ({ ...s, cities: false }));
      }
    };
    load();
  }, []);

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRegisterData((prev) => ({
      ...prev,
      cityName: value,
      districtName: '',
      districtTownshipTownName: '',
      neighbourhoodName: '',
    }));
    setDistricts([]);
    setTownships([]);
    setNeighbourhoods([]);
    if (!value) return;
    try {
      setAddressLoading((s) => ({ ...s, districts: true }));
      const list = await getDistricts(value);
      setDistricts(list);
    } catch (err) {
      console.error('İlçe listesi yüklenemedi', err);
    } finally {
      setAddressLoading((s) => ({ ...s, districts: false }));
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRegisterData((prev) => ({
      ...prev,
      districtName: value,
      districtTownshipTownName: '',
      neighbourhoodName: '',
    }));
    setTownships([]);
    setNeighbourhoods([]);
    if (!value || !registerData.cityName) return;
    try {
      setAddressLoading((s) => ({ ...s, townships: true }));
      const list = await getDistrictTownshipTowns(registerData.cityName, value);
      setTownships(list);
    } catch (err) {
      console.error('Bucak/Nahiye listesi yüklenemedi', err);
    } finally {
      setAddressLoading((s) => ({ ...s, townships: false }));
    }
  };

  const handleTownshipChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRegisterData((prev) => ({
      ...prev,
      districtTownshipTownName: value,
      neighbourhoodName: '',
    }));
    setNeighbourhoods([]);
    if (!value || !registerData.cityName || !registerData.districtName) return;
    try {
      setAddressLoading((s) => ({ ...s, neighbourhoods: true }));
      const list = await getNeighbourhoods(registerData.cityName, registerData.districtName, value);
      setNeighbourhoods(list);
    } catch (err) {
      console.error('Mahalle listesi yüklenemedi', err);
    } finally {
      setAddressLoading((s) => ({ ...s, neighbourhoods: false }));
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateRegisterForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!registerData.userName.trim()) {
      newErrors.userName = 'Ad alanı zorunludur';
    }

    if (!registerData.userSurname.trim()) {
      newErrors.userSurname = 'Soyad alanı zorunludur';
    }

    if (!registerData.userEmail.trim()) {
      newErrors.userEmail = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(registerData.userEmail)) {
      newErrors.userEmail = 'Geçerli bir e-posta adresi girin';
    }

    if (!registerData.userPassword) {
      newErrors.userPassword = 'Şifre alanı zorunludur';
    } else if (registerData.userPassword.length < 6) {
      newErrors.userPassword = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!registerData.userAge) {
      newErrors.userAge = 'Yaş alanı zorunludur';
    } else {
      const age = parseInt(registerData.userAge);
      if (isNaN(age) || age < 18 || age > 120) {
        newErrors.userAge = 'Geçerli bir yaş girin (18-120)';
      }
    }

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerPayload = {
        ...registerData,
        userAge: parseInt(registerData.userAge)
      };

      const success = await register(registerPayload);

      if (success) {
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        setActiveTab('login');
        setRegisterData({
          userName: '',
          userSurname: '',
          userEmail: '',
          userPassword: '',
          userAge: '',
          cityName: '',
          districtName: '',
          districtTownshipTownName: '',
          neighbourhoodName: '',
          addressDetails: ''
        });
      } else {
        alert('Kayıt başarısız! Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      alert(error.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
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
        className={`w-full ${activeTab === 'signup' ? 'max-w-4xl' : 'max-w-md'} bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-slate-800/90 dark:via-blue-900/90 dark:to-indigo-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 dark:border-white/20 overflow-hidden transition-all duration-500`}
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
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              GİRİŞ YAP
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'signup' 
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
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
                  <div className="w-full border-t border-gray-300/50 dark:border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-slate-800/90 dark:to-blue-900/90 px-2 text-gray-600 dark:text-blue-300">veya</span>
                </div>
              </div>

              {/* Alternative Login Providers */}
              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  type="button"
                  onClick={() => googleLogin()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>GOOGLE İLE GİRİŞ YAP</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => window.location.href = getTrelloAuthUrl()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>TRELLO İLE GİRİŞ YAP</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => window.location.href = getJiraAuthUrl()}
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

          {/* Register Form */}
          {activeTab === 'signup' && (
            <motion.form 
              onSubmit={handleRegisterSubmit}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Kişisel Bilgiler</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={registerData.userName}
                      onChange={handleRegisterInputChange}
                      className={`w-full px-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                        registerErrors.userName ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                      }`}
                      placeholder="Adınızı girin"
                    />
                    {registerErrors.userName && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.userName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userSurname" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      id="userSurname"
                      name="userSurname"
                      value={registerData.userSurname}
                      onChange={handleRegisterInputChange}
                      className={`w-full px-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                        registerErrors.userSurname ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                      }`}
                      placeholder="Soyadınızı girin"
                    />
                    {registerErrors.userSurname && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.userSurname}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      E-posta *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <input
                        type="email"
                        id="userEmail"
                        name="userEmail"
                        value={registerData.userEmail}
                        onChange={handleRegisterInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                          registerErrors.userEmail ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                        }`}
                        placeholder="E-posta adresinizi girin"
                      />
                    </div>
                    {registerErrors.userEmail && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.userEmail}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userAge" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Yaş *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <input
                        type="number"
                        id="userAge"
                        name="userAge"
                        value={registerData.userAge}
                        onChange={handleRegisterInputChange}
                        min="18"
                        max="120"
                        className={`w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                          registerErrors.userAge ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                        }`}
                        placeholder="Yaşınızı girin"
                      />
                    </div>
                    {registerErrors.userAge && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.userAge}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Şifre *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        id="userPassword"
                        name="userPassword"
                        value={registerData.userPassword}
                        onChange={handleRegisterInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                          registerErrors.userPassword ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                        }`}
                        placeholder="Şifrenizi oluşturun"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-blue-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {registerErrors.userPassword && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.userPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Adres Bilgileri</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Şehir
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <select
                        id="cityName"
                        name="cityName"
                        value={registerData.cityName}
                        onChange={handleCityChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white transition-colors duration-300"
                      >
                        <option value="">Şehir seçin</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="districtName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      İlçe
                    </label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <select
                        id="districtName"
                        name="districtName"
                        value={registerData.districtName}
                        onChange={handleDistrictChange}
                        disabled={!registerData.cityName || addressLoading.districts}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-60"
                      >
                        <option value="">İlçe seçin</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="districtTownshipTownName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Bucak/Nahiye
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <select
                        id="districtTownshipTownName"
                        name="districtTownshipTownName"
                        value={registerData.districtTownshipTownName}
                        onChange={handleTownshipChange}
                        disabled={!registerData.districtName || addressLoading.townships}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-60"
                      >
                        <option value="">Bucak/Nahiye seçin</option>
                        {townships.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="neighbourhoodName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Mahalle
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                      <select
                        id="neighbourhoodName"
                        name="neighbourhoodName"
                        value={registerData.neighbourhoodName}
                        onChange={(e) => setRegisterData((p) => ({ ...p, neighbourhoodName: e.target.value }))}
                        disabled={!registerData.districtTownshipTownName || addressLoading.neighbourhoods}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-60"
                      >
                        <option value="">Mahalle seçin</option>
                        {neighbourhoods.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="addressDetails" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                      Detaylı Adres
                    </label>
                    <textarea
                      id="addressDetails"
                      name="addressDetails"
                      value={registerData.addressDetails}
                      onChange={handleRegisterInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 resize-none"
                      placeholder="Sokak, bina no, kat, daire no vb. detayları girin"
                    />
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </motion.form>
          )}

          {/* Bottom Links */}
          <div className="mt-8 text-center space-y-3">
            {activeTab === 'login' ? (
              <p className="text-sm text-gray-600 dark:text-blue-300">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-blue-300">
                Zaten hesabınız var mı?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
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
