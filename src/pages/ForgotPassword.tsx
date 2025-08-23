import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';


const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        className="w-full max-w-md bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 dark:border-white/20 p-8 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Şifremi Unuttum</h1>
          <p className="text-gray-600 dark:text-blue-200 text-sm mt-1">E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-blue-200">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-blue-300" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-blue-300 transition-colors duration-300"
                placeholder="ornek@mail.com"
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-blue-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Giriş sayfasına dön</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
