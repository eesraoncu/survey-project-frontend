import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  MapPin,
  Calendar,
  Building,
  Home,
  Navigation
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
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
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Ad alanı zorunludur';
    }

    if (!formData.userSurname.trim()) {
      newErrors.userSurname = 'Soyad alanı zorunludur';
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.userPassword) {
      newErrors.userPassword = 'Şifre alanı zorunludur';
    } else if (formData.userPassword.length < 6) {
      newErrors.userPassword = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.userAge) {
      newErrors.userAge = 'Yaş alanı zorunludur';
    } else {
      const age = parseInt(formData.userAge);
      if (isNaN(age) || age < 18 || age > 120) {
        newErrors.userAge = 'Geçerli bir yaş girin (18-120)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        ...formData,
        userAge: parseInt(formData.userAge)
      };

      const success = await register(registerData);

      if (success) {
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        navigate('/login');
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
        className="w-full max-w-2xl bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-slate-800/90 dark:via-blue-900/90 dark:to-indigo-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 dark:border-white/20 overflow-hidden transition-colors duration-300"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header with Logo and Theme Toggle */}
        <div className="relative h-48 bg-gradient-to-br from-slate-200 to-blue-300 dark:from-slate-700 dark:to-blue-800 overflow-hidden transition-colors duration-300">
          {/* Theme Toggle Button */}
          <div className="absolute top-6 right-6">
            <motion.button
              onClick={toggleTheme}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <div className="w-6 h-6 text-white">☀️</div>
              ) : (
                <div className="w-6 h-6 text-white">🌙</div>
              )}
            </motion.button>
          </div>

          {/* Header Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Hesap Oluştur
              </h1>
              <p className="text-gray-600 dark:text-blue-200">
                Survey App'e katılmak için bilgilerinizi girin
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={formData.userName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                      errors.userName ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                    }`}
                    placeholder="Adınızı girin"
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
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
                    value={formData.userSurname}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                      errors.userSurname ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                    }`}
                    placeholder="Soyadınızı girin"
                  />
                  {errors.userSurname && (
                    <p className="text-red-500 text-sm mt-1">{errors.userSurname}</p>
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
                      value={formData.userEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                        errors.userEmail ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                      }`}
                      placeholder="E-posta adresinizi girin"
                    />
                  </div>
                  {errors.userEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.userEmail}</p>
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
                      value={formData.userAge}
                      onChange={handleInputChange}
                      min="18"
                      max="120"
                      className={`w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                        errors.userAge ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                      }`}
                      placeholder="Yaşınızı girin"
                    />
                  </div>
                  {errors.userAge && (
                    <p className="text-red-500 text-sm mt-1">{errors.userAge}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                    Şifre *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="userPassword"
                      name="userPassword"
                      value={formData.userPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/80 dark:bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 ${
                        errors.userPassword ? 'border-red-500' : 'border-gray-300/50 dark:border-white/20'
                      }`}
                      placeholder="Şifrenizi oluşturun"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-blue-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.userPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.userPassword}</p>
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
                    <input
                      type="text"
                      id="cityName"
                      name="cityName"
                      value={formData.cityName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300"
                      placeholder="Şehir adını girin"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="districtName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                    İlçe
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                    <input
                      type="text"
                      id="districtName"
                      name="districtName"
                      value={formData.districtName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300"
                      placeholder="İlçe adını girin"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="districtTownshipTownName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                    Mahalle/Köy
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                    <input
                      type="text"
                      id="districtTownshipTownName"
                      name="districtTownshipTownName"
                      value={formData.districtTownshipTownName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300"
                      placeholder="Mahalle/Köy adını girin"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="neighbourhoodName" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                    Semt
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
                    <input
                      type="text"
                      id="neighbourhoodName"
                      name="neighbourhoodName"
                      value={formData.neighbourhoodName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300"
                      placeholder="Semt adını girin"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="addressDetails" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1">
                    Detaylı Adres
                  </label>
                  <textarea
                    id="addressDetails"
                    name="addressDetails"
                    value={formData.addressDetails}
                    onChange={(e) => handleInputChange(e as any)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300 resize-none"
                    placeholder="Sokak, bina no, kat, daire no vb. detayları girin"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
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
          </form>

          {/* Bottom Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-blue-300">
              Zaten hesabınız var mı?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Giriş yapın
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
