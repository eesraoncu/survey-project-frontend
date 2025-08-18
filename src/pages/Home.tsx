import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Rocket, 
  Lightbulb,
  BarChart3,
  Users,
  MoreVertical,
  Calendar,
  Gift,
  Shirt,
  Building,
  Grid3X3,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { surveyService, type Survey } from '../services/surveyService';
import { aiService } from '../services/aiService';



const Home: React.FC = () => {
  const [hoveredSurvey, setHoveredSurvey] = useState<string | null>(null); // gelecekte kart hover efektleri için tutuluyor
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'trending'>('templates');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const navigate = useNavigate();

  // AI-powered survey suggestions
  const aiSuggestions = [
    { title: 'AI Önerisi: Müşteri Deneyimi', confidence: 94, reason: 'Son 30 günde benzer anketler %40 daha fazla yanıt aldı' },
    { title: 'AI Önerisi: Çalışan Memnuniyeti', confidence: 87, reason: 'Şirket büyüme döneminde, çalışan geri bildirimi kritik' },
    { title: 'AI Önerisi: Ürün Lansmanı', confidence: 92, reason: 'Pazar araştırması için en uygun zaman' }
  ];

  // Trending surveys
  const trendingSurveys = [
    { title: 'Uzaktan Çalışma Deneyimi', trend: '+156%', category: 'İş' },
    { title: 'Sürdürülebilir Yaşam', trend: '+89%', category: 'Çevre' },
    { title: 'Dijital Dönüşüm', trend: '+234%', category: 'Teknoloji' }
  ];

  const templates = [
    { id: 'contact', title: 'İletişim Bilgileri', icon: <FileText className="w-6 h-6" />, color: 'from-green-400 to-emerald-500', difficulty: 'Kolay', time: '2 dk' },
    { id: 'event', title: 'Etkinlik LCV Formu', icon: <Calendar className="w-6 h-6" />, color: 'from-blue-400 to-cyan-500', difficulty: 'Orta', time: '5 dk' },
    { id: 'party', title: 'Parti Davetiyesi', icon: <Gift className="w-6 h-6" />, color: 'from-purple-400 to-pink-500', difficulty: 'Kolay', time: '3 dk' },
    { id: 'tshirt', title: 'Tişört İstek Formu', icon: <Shirt className="w-6 h-6" />, color: 'from-orange-400 to-red-500', difficulty: 'Kolay', time: '2 dk' },
    { id: 'registration', title: 'Etkinlik Kayıt Formu', icon: <Building className="w-6 h-6" />, color: 'from-indigo-400 to-purple-500', difficulty: 'Orta', time: '4 dk' }
  ];

  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const { user } = useAuth();

  // Son anketleri yükle
  useEffect(() => {
    const loadRecentSurveys = async () => {
      try {
        console.log('[Home] Aktif kullanıcı:', user?.id);
        const surveys = user?.id
          ? await surveyService.getSurveysByUserFlexible(user.id)
          : await surveyService.getAllSurveys();
        console.log('[Home] getAllSurveys count =', surveys.length);
        if (surveys && surveys.length) {
          console.log('[Home] İlk 5 kayıt örnek alanları (id, users_id, usersId, userId, user_id, createdBy, ownerId):');
          console.table(
            surveys.slice(0, 5).map((s: any) => ({
              id: s.id ?? s._id,
              users_id: s.users_id,
              usersId: s.usersId,
              userId: s.userId,
              user_id: s.user_id,
              createdBy: s.createdBy,
              ownerId: s.ownerId,
              userObjId: s.user?.id
            }))
          );
        }
        // Giriş yapmış kullanıcıya ait olanları filtrele (backend tümünü dönerse)
        // Ek güvenlik: client-side sahiplik filtresi uygula
        const myId = user?.id ? String(user.id) : ''
        const owned = surveys.filter((s: any, idx: number) => {
          const owner = s.UsersId ?? s.usersId ?? s.users_id ?? s.userId ?? s.user_id ?? s.createdBy ?? s.ownerId ?? s.user?.id
          const ok = owner != null && String(owner) === myId
          if (idx < 10) console.log('[Home][final-filter] item', idx, 'owner:', owner, 'match:', ok)
          return ok
        })
        console.log('[Home] (User filtered) count =', owned.length)
        // En son oluşturulan 4 anketi sırala ve al
        const sorted = owned.sort((a: any, b: any) => {
          const da = new Date((a as any).createdAt || (a as any).created_at || 0).getTime();
          const db = new Date((b as any).createdAt || (b as any).created_at || 0).getTime();
          return db - da;
        });
        const last4 = sorted.slice(0, 4);
        console.log('[Home] last4 ids =', last4.map((s: any) => s.id ?? s._id));
        setRecentSurveys(last4);
      } catch (error) {
        console.error('Error loading recent surveys:', error);
      }
    };
    loadRecentSurveys();
  }, [user]);

  // Particle system for background
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vx: p.x < 0 || p.x > window.innerWidth ? -p.vx : p.vx,
        vy: p.y < 0 || p.y > window.innerHeight ? -p.vy : p.vy
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Jira token testi kaldırıldı

  // AI anket oluşturma fonksiyonu
  const handleAIGenerate = async () => {
    console.log('🚀 AI Anket Oluşturma Başladı:', aiDescription);
    console.log('🔧 AUTH TOKEN:', localStorage.getItem('authToken') ? 'Mevcut' : 'YOK!');
    console.log('🌐 Current URL:', window.location.href);
    
    // Form validasyonu
    const validation = aiService.validateAIDescription(aiDescription);
    if (!validation.isValid) {
      console.log('❌ Validation Failed:', validation.message);
      setAiError(validation.message || 'Geçersiz açıklama');
      return;
    }

    setIsAILoading(true);
    setAiError('');

    try {
      console.log('📡 Backend API çağrısı yapılıyor...');
      const generatedSurvey = await aiService.generateCompleteSurvey(aiDescription);
      
      console.log('✅ AI Anket Alındı:', generatedSurvey);
      console.log('📊 AI Anket Questions Count:', generatedSurvey.questions?.length || 0);
      console.log('📝 AI Anket Questions:', generatedSurvey.questions);
      
      // AI anket verisini localStorage'a kaydet
      localStorage.setItem('aiGeneratedSurvey', JSON.stringify(generatedSurvey));
      console.log('💾 LocalStorage\'a kaydedildi');
      
      // LocalStorage'da gerçekten kaydedildiğini kontrol et
      const saved = localStorage.getItem('aiGeneratedSurvey');
      console.log('🔍 LocalStorage Kontrol:', saved ? 'Veri mevcut' : 'Veri YOK!');
      if (saved) {
        console.log('📋 Kaydedilen veri uzunluğu:', saved.length, 'karakter');
        
        // Parse edilmiş veriyi kontrol et
        try {
          const parsedData = JSON.parse(saved);
          console.log('🔍 Parsed Data Questions Count:', parsedData.questions?.length || 0);
          console.log('🔍 Parsed Data Questions:', parsedData.questions);
        } catch (parseError) {
          console.error('❌ Parse Error:', parseError);
        }
      }
      
      // Başarılı olursa form builder sayfasına yönlendir
      console.log('🔄 FormBuilder\'a yönlendiriliyor...');
      navigate('/form-builder');
      
      // Modal'ı kapat
      setShowAIModal(false);
      setAiDescription('');
      
    } catch (error: any) {
      console.error('💥 AI Anket Oluşturma Hatası:', error);
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
    } finally {
      setIsAILoading(false);
    }
  };

  // AI modal'ını aç
  const openAIModal = () => {
    console.log('🎯 AI Modal açılıyor...');
    setShowAIModal(true);
    setAiError('');
    setAiDescription('');
    console.log('✅ AI Modal state güncellendi');
  };

  // showAIModal state'ini izle
  useEffect(() => {
    console.log('🔍 showAIModal State Değişimi:', showAIModal);
  }, [showAIModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            animate={{
              x: particle.x,
              y: particle.y,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>



      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <section className="text-center mb-16">
            <motion.h1 
              className="text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                Anketlerinizi
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AI ile Güçlendirin
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, 
              trend analizi yapın ve daha fazla yanıt alın.
            </motion.p>
          </section>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              {[
                { id: 'templates', label: 'Şablonlar', icon: <FileText className="w-5 h-5" /> },
                { id: 'ai', label: 'AI Önerileri', icon: <Sparkles className="w-5 h-5" /> },
                { id: 'trending', label: 'Trendler', icon: <TrendingUp className="w-5 h-5" /> }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* New Form Section */}
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      Yeni bir form hazırlamaya başlayın
                    </h2>
                    <div className="flex items-center space-x-4">
                      <motion.button
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-medium shadow-2xl"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openAIModal}
                      >
                        <Rocket className="w-5 h-5 inline mr-2" />
                        AI Destekli Oluştur
                      </motion.button>
                      {/* Jira Token Test butonu kaldırıldı */}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    {/* Blank Form Card */}
                    <motion.div
                      variants={itemVariants}
                      className="lg:col-span-2"
                    >
                      <motion.div 
                        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center cursor-pointer group hover:bg-white/20 transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/form-builder')}
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-300/25 transition-all duration-300">
                          <Plus className="w-12 h-12 text-amber-800" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Boş Form</h3>
                        <p className="text-blue-200 mb-6">AI destekli sıfırdan yeni bir form oluşturun</p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
                          <Sparkles className="w-4 h-4" />
                          <span>AI Destekli</span>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Template Gallery */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Şablon Galerisi</h3>
                        <div className="flex items-center space-x-3">
                          <motion.button 
                            className="p-2 hover:bg-white/10 rounded-xl text-purple-300 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.button>
                          <motion.button 
                            className="p-2 hover:bg-white/10 rounded-xl text-purple-300 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {templates.map((template, index) => (
                          <motion.div
                            key={template.id}
                            variants={itemVariants}
                            custom={index}
                            className="group cursor-pointer"
                            whileHover={{ 
                              scale: 1.05, 
                              rotateY: 10,
                              z: 50
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={() => navigate('/form-builder')}
                          >
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                              <div className={`${template.color} p-4 flex items-center justify-center relative overflow-hidden`}>
                                <div className="text-white relative z-10">
                                  {template.icon}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="p-4">
                                <h4 className="text-sm font-medium text-white text-center mb-2 group-hover:text-purple-200 transition-colors">
                                  {template.title}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-purple-300">
                                  <span>{template.difficulty}</span>
                                  <span>{template.time}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Jira test sonucu alanı kaldırıldı */}
                </section>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white text-center mb-8">AI Önerileri</h2>
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{suggestion.title}</h3>
                          <p className="text-purple-200">{suggestion.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{suggestion.confidence}%</div>
                        <div className="text-sm text-purple-300">Güven</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'trending' && (
              <motion.div
                key="trending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white text-center mb-8">Trend Anketler</h2>
                {trendingSurveys.map((survey, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{survey.title}</h3>
                          <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {survey.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{survey.trend}</div>
                        <div className="text-sm text-purple-300">Büyüme</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Forms Section */}
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Son Formlar</h2>
              <div className="flex items-center space-x-4">
                <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-xl">
                  <option className="bg-slate-800">Tümü</option>
                  <option className="bg-slate-800">Son 7 gün</option>
                  <option className="bg-slate-800">Son 30 gün</option>
                </select>
                
                <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
                  <motion.button
                    className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <BarChart3 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentSurveys.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  variants={itemVariants}
                  custom={index}
                  className="group cursor-pointer"
                  whileHover={{ 
                    scale: 1.02, 
                    rotateY: 5,
                    z: 50
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onMouseEnter={() => setHoveredSurvey(survey.id.toString())}
                  onMouseLeave={() => setHoveredSurvey(null)}
                  onClick={() => navigate('/form-builder')}
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden">
                    {/* AI Score Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI {survey.aiScore}</span>
                    </div>

                    {/* Trend Score Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{survey.trendScore}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg">
                            <FileText className="w-8 h-8 text-amber-800" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg group-hover:text-purple-200 transition-colors">
                              {survey.surveyName}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-purple-300">
                              <Users className="w-4 h-4" />
                              <span>{survey.responses} yanıt</span>
                            </div>
                          </div>
                        </div>
                        <motion.button 
                          className="p-2 hover:bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-300 hover:text-white"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-purple-300">
                        <span>{survey.createdAt}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI ile Anket Oluştur</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Anketinizi tanımlayın, AI sizin için oluştursun</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anket Açıklaması *
                </label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => {
                    setAiDescription(e.target.value);
                    if (aiError) setAiError(''); // Hata mesajını temizle
                  }}
                  placeholder="Örnek: Müşteri memnuniyeti için e-ticaret deneyimi anketi. Ürün kalitesi, teslimat hızı ve müşteri hizmetleri hakkında sorular olsun."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isAILoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  En az 10 karakter, maksimum 500 karakter
                </p>
              </div>

              {aiError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAIModal(false)}
                  disabled={isAILoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={isAILoading || !aiDescription.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isAILoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </motion.div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI ile Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;


