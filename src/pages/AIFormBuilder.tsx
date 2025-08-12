import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  FileText, 
  Lightbulb, 
  Target, 
  Zap,
  Brain,
  Rocket,
  Wand2
} from 'lucide-react';

const AIFormBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      navigate('/form-builder');
    }, 2000);
  };

  const suggestions = [
    "Müşteri memnuniyet anketi oluştur",
    "Çalışan performans değerlendirme formu",
    "Ürün lansmanı geri bildirim anketi",
    "Etkinlik kayıt formu",
    "Eğitim değerlendirme anketi"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-xl text-blue-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Brain className="w-7 h-7 text-amber-900" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  AI Form Oluşturucu
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
              AI ile Anket Oluşturun
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-200 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Yapay zeka destekli anket oluşturucu ile sadece ne istediğinizi söyleyin, 
            AI sizin için mükemmel soruları hazırlasın.
          </motion.p>
        </motion.div>

        {/* AI Prompt Form */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold text-white mb-3">
                Anket açıklamanızı yazın
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örnek: Müşteri memnuniyet anketi oluştur. Hizmet kalitesi, personel davranışı ve genel deneyim hakkında sorular olsun..."
                className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-blue-200 backdrop-blur-xl resize-none"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900 rounded-2xl font-medium shadow-2xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isGenerating ? 1 : 1.02, y: -2 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  <span>AI Anket Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  <span>AI ile Anket Oluştur</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Suggestions */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <span>Hızlı Başlangıç Önerileri</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl text-left transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-blue-200 group-hover:text-white transition-colors">
                    {suggestion}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-amber-900" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Akıllı Soru Üretimi</h4>
            <p className="text-blue-200 text-sm">AI, konunuza uygun en iyi soruları otomatik olarak oluşturur</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Hızlı Oluşturma</h4>
            <p className="text-blue-200 text-sm">Saniyeler içinde profesyonel anketler hazırlayın</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Optimize Edilmiş</h4>
            <p className="text-blue-200 text-sm">Yanıt oranını artıran etkili soru yapıları</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIFormBuilder;
