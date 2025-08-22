import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Rocket, 
  BarChart3,
  Users,
  MoreVertical,
  Calendar,
  Gift,
  Shirt,
  Building,
  Grid3X3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { surveyService, type Survey } from '../services/surveyService';
import { aiService } from '../services/aiService';



const Home: React.FC = () => {
  const [, setHoveredSurvey] = useState<string | null>(null); // gelecekte kart hover efektleri için tutuluyor
  const [activeTab, setActiveTab] = useState<'templates' | 'trending'>('templates');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const navigate = useNavigate();

  // Şablon template verileri
  const getTemplateFormData = (templateId: string) => {
    const templateConfigs: { [key: string]: any } = {
      contact: {
        title: 'İletişim Bilgileri Formu',
        description: 'Müşteri iletişim bilgilerini toplamak için kullanılan profesyonel form',
        category: 'İş',
        questions: [
          {
            id: Date.now().toString(),
            type: 'name',
            title: 'Ad Soyad',
            required: true,
            placeholder: 'Adınızı ve soyadınızı yazın'
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'email',
            title: 'E-posta Adresi',
            required: true,
            placeholder: 'ornek@email.com'
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'phone',
            title: 'Telefon Numarası',
            required: false,
            placeholder: '+90 5XX XXX XX XX'
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'textarea',
            title: 'Mesajınız',
            required: false,
            placeholder: 'Lütfen mesajınızı buraya yazın...'
          }
        ]
      },
      event: {
        title: 'Etkinlik Katılım Onay Formu',
        description: 'Etkinliğimize katılım durumunuzu belirtmek için formu doldurun',
        category: 'Etkinlik',
        questions: [
          {
            id: Date.now().toString(),
            type: 'name',
            title: 'Ad Soyad',
            required: true,
            placeholder: 'Adınızı ve soyadınızı yazın'
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'email',
            title: 'E-posta Adresi',
            required: true,
            placeholder: 'ornek@email.com'
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'radio',
            title: 'Katılım Durumunuz',
            required: true,
            options: ['Kesinlikle Katılacağım', 'Muhtemelen Katılacağım', 'Kararsızım', 'Katılmayacağım']
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'select',
            title: 'Kaç Kişi Katılacaksınız?',
            required: true,
            options: ['1 Kişi', '2 Kişi', '3 Kişi', '4 Kişi', '5+ Kişi']
          },
          {
            id: (Date.now() + 4).toString(),
            type: 'checkbox',
            title: 'Diyet Kısıtlarınız',
            required: false,
            options: ['Vejetaryen', 'Vegan', 'Glutensiz', 'Laktozsuz', 'Yok']
          },
          {
            id: (Date.now() + 5).toString(),
            type: 'textarea',
            title: 'Özel İstekleriniz',
            required: false,
            placeholder: 'Varsa özel isteklerinizi belirtin...'
          }
        ]
      },
      party: {
        title: 'Parti Davetiyesi Formu',
        description: 'Doğum günü partimize katılım durumunuzu bildirin',
        category: 'Sosyal',
        questions: [
          {
            id: Date.now().toString(),
            type: 'name',
            title: 'Ad Soyad',
            required: true,
            placeholder: 'Adınızı ve soyadınızı yazın'
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'radio',
            title: 'Katılım Durumunuz',
            required: true,
            options: ['Evet, katılacağım! 🎉', 'Maalesef katılamayacağım 😢', 'Henüz kararsızım 🤔']
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'select',
            title: 'Yanınızda Kimse Getirmeyi Düşünüyor musunuz?',
            required: false,
            options: ['Yalnız geleceğim', '+1 kişi getireceğim', '+2 kişi getireceğim', 'Daha fazla']
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'checkbox',
            title: 'Hangi Aktiviteleri Tercih Edersiniz?',
            required: false,
            options: ['Dans 💃', 'Karaoke 🎤', 'Oyunlar 🎲', 'Fotoğraf Çekimi 📸', 'Sohbet 💬']
          },
          {
            id: (Date.now() + 4).toString(),
            type: 'text',
            title: 'Müzik İsteğiniz',
            required: false,
            placeholder: 'Çalınmasını istediğiniz şarkı/sanatçı'
          },
          {
            id: (Date.now() + 5).toString(),
            type: 'textarea',
            title: 'Hediye Önerisi/Dilek',
            required: false,
            placeholder: 'Hediye önerileriniz veya dilekleriniz...'
          }
        ]
      },
      tshirt: {
        title: 'Tişört Sipariş Formu',
        description: 'Şirket tişörtü siparişinizi vermek için formu doldurun',
        category: 'Sipariş',
        questions: [
          {
            id: Date.now().toString(),
            type: 'name',
            title: 'Ad Soyad',
            required: true,
            placeholder: 'Adınızı ve soyadınızı yazın'
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'email',
            title: 'E-posta Adresi',
            required: true,
            placeholder: 'ornek@email.com'
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'radio',
            title: 'Tişört Bedeni',
            required: true,
            options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'checkbox',
            title: 'Renk Tercihleri',
            required: true,
            options: ['Siyah', 'Beyaz', 'Lacivert', 'Gri', 'Kırmızı', 'Mavi']
          },
          {
            id: (Date.now() + 4).toString(),
            type: 'select',
            title: 'Kaç Adet İstiyorsunuz?',
            required: true,
            options: ['1 Adet', '2 Adet', '3 Adet', '4 Adet', '5+ Adet']
          },
          {
            id: (Date.now() + 5).toString(),
            type: 'textarea',
            title: 'Tasarım Önerileri',
            required: false,
            placeholder: 'Tişört tasarımı hakkında önerileriniz...'
          }
        ]
      },
      registration: {
        title: 'Etkinlik Kayıt Formu',
        description: 'Seminer/Konferansa katılmak için kayıt formu',
        category: 'Eğitim',
        questions: [
          {
            id: Date.now().toString(),
            type: 'name',
            title: 'Ad Soyad',
            required: true,
            placeholder: 'Adınızı ve soyadınızı yazın'
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'email',
            title: 'E-posta Adresi',
            required: true,
            placeholder: 'ornek@email.com'
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'phone',
            title: 'Telefon Numarası',
            required: true,
            placeholder: '+90 5XX XXX XX XX'
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'text',
            title: 'Şirket/Kurum Adı',
            required: false,
            placeholder: 'Çalıştığınız şirket/kurum'
          },
          {
            id: (Date.now() + 4).toString(),
            type: 'text',
            title: 'Ünvan/Pozisyon',
            required: false,
            placeholder: 'İş ünvanınız'
          },
          {
            id: (Date.now() + 5).toString(),
            type: 'checkbox',
            title: 'Katılmak İstediğiniz Oturumlar',
            required: true,
            options: ['Açılış Konuşması', 'Teknik Sunum', 'Panel Tartışması', 'Workshop', 'Networking']
          },
          {
            id: (Date.now() + 6).toString(),
            type: 'radio',
            title: 'Sertifika İstiyor musunuz?',
            required: false,
            options: ['Evet, sertifika istiyorum', 'Hayır, gerek yok']
          }
        ]
      }
    };
    return templateConfigs[templateId];
  };

  // Şablon tıklama fonksiyonu
  const handleTemplateClick = (templateId: string) => {
    const templateData = getTemplateFormData(templateId);
    if (templateData) {
      // Template verilerini localStorage'a kaydet
      localStorage.setItem('templateFormData', JSON.stringify(templateData));
      // FormBuilder'a yönlendir
      navigate('/form-builder?template=' + templateId);
    }
  };



  // Trending surveys
  const trendingSurveys = [
    { title: 'Uzaktan Çalışma Deneyimi', trend: '+156%', category: 'İş' },
    { title: 'Sürdürülebilir Yaşam', trend: '+89%', category: 'Çevre' },
    { title: 'Dijital Dönüşüm', trend: '+234%', category: 'Teknoloji' }
  ];

  const templates = [
    { 
      id: 'contact', 
      title: 'İletişim Bilgileri', 
      description: 'Müşteri iletişim bilgilerini toplamak için profesyonel form',
      icon: <FileText className="w-6 h-6" />, 
      color: 'from-green-400 to-emerald-500', 
      difficulty: 'Kolay', 
      time: '2 dk',
      features: ['Ad Soyad', 'E-posta', 'Telefon', 'Mesaj'],
      popular: true
    },
    { 
      id: 'event', 
      title: 'Etkinlik LCV Formu', 
      description: 'Etkinlik katılım onayı ve misafir bilgileri toplama',
      icon: <Calendar className="w-6 h-6" />, 
      color: 'from-blue-400 to-cyan-500', 
      difficulty: 'Orta', 
      time: '5 dk',
      features: ['RSVP Onayı', 'Misafir Sayısı', 'Diyet Kısıtları', 'Özel İstekler'],
      popular: false
    },
    { 
      id: 'party', 
      title: 'Parti Davetiyesi', 
      description: 'Doğum günü ve özel kutlamalar için daveti formu',
      icon: <Gift className="w-6 h-6" />, 
      color: 'from-purple-400 to-pink-500', 
      difficulty: 'Kolay', 
      time: '3 dk',
      features: ['Katılım Durumu', 'Hediye Tercihi', 'Müzik İsteği', 'Yanındaki Kişi'],
      popular: true
    },
    { 
      id: 'tshirt', 
      title: 'Tişört İstek Formu', 
      description: 'Şirket veya etkinlik tişörtü sipariş formu',
      icon: <Shirt className="w-6 h-6" />, 
      color: 'from-orange-400 to-red-500', 
      difficulty: 'Kolay', 
      time: '2 dk',
      features: ['Beden Seçimi', 'Renk Tercihi', 'Tasarım Önerileri', 'Teslimat Adresi'],
      popular: false
    },
    { 
      id: 'registration', 
      title: 'Etkinlik Kayıt Formu', 
      description: 'Seminer, konferans ve workshop kayıt formu',
      icon: <Building className="w-6 h-6" />, 
      color: 'from-indigo-400 to-purple-500', 
      difficulty: 'Orta', 
      time: '4 dk',
      features: ['Kişisel Bilgiler', 'Şirket Bilgileri', 'Oturum Seçimi', 'Sertifika İsteği'],
      popular: true
    }
  ];

  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [allOwnedSurveys, setAllOwnedSurveys] = useState<Survey[]>([]);
  const [selectedRange, setSelectedRange] = useState<'all' | '7' | '30'>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 4;
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
        setAllOwnedSurveys(sorted);
      } catch (error) {
        console.error('Error loading recent surveys:', error);
      }
    };
    loadRecentSurveys();
  }, [user]);

  // Filtre ve sayfalama hesapları
  const filteredSurveys = useMemo(() => {
    let list = allOwnedSurveys;
    if (selectedRange !== 'all') {
      const days = selectedRange === '7' ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter((s: any) => {
        const ts = new Date((s as any).createdAt || (s as any).created_at || 0).getTime();
        return ts >= cutoff;
      });
    }
    return list;
  }, [allOwnedSurveys, selectedRange]);

  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const visibleSurveys = useMemo(
    () => filteredSurveys.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [filteredSurveys, safePage]
  );

  useEffect(() => {
    // Görünenleri state'e yansıt (mevcut render akışını fazla bozmamak için)
    setRecentSurveys(visibleSurveys);
  }, [visibleSurveys]);

  useEffect(() => {
    // Filtre değişince başa dön
    setCurrentPage(0);
  }, [selectedRange, allOwnedSurveys.length]);

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
      // Eğer backend id döndürdüyse düzenlemeye onunla git
      if (generatedSurvey?.id) {
        navigate(`/form-builder?surveyId=${generatedSurvey.id}`);
      } else {
        navigate('/form-builder');
      }
      
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
              Profesyonel anket oluşturucu ile benzersiz sorular hazırlayın, 
              trend analizi yapın ve daha fazla yanıt alın.
            </motion.p>
          </section>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              {[
                { id: 'templates', label: 'Şablonlar', icon: <FileText className="w-5 h-5" /> },
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
                <section className="mb-20">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      Yeni bir form hazırlamaya başlayın
                    </h2>
                    <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                      Form oluşturucu ile hızlıca profesyonel anketler hazırlayın
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
                    {/* Boş Form */}
                    <motion.div
                      className="group cursor-pointer"
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/form-builder')}
                    >
                      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500 h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            <Plus className="w-8 h-8 text-white" />
                    </div>
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-colors">
                            Boş Form
                          </h3>
                          <p className="text-blue-200 text-sm mb-4">
                            Sıfırdan yeni bir form oluşturun
                          </p>
                          <div className="flex items-center justify-center text-xs text-blue-300">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Destekli
                  </div>
                        </div>
                      </div>
                    </motion.div>
                  
                    {/* AI Oluşturucu */}
                    <motion.div
                      className="group cursor-pointer"
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openAIModal}
                    >
                      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-300/30 shadow-2xl group-hover:shadow-3xl transition-all duration-500 h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                            AI Oluşturucu
                          </h3>
                          <p className="text-blue-200 text-sm mb-4">
                            Yapay zeka ile otomatik oluşturun
                          </p>
                          <div className="flex items-center justify-center text-xs text-purple-300">
                            <Rocket className="w-3 h-3 mr-1" />
                            Akıllı Öneriler
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* İstatistik Kartı */}
                      <motion.div 
                      className="group"
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-8 border border-green-300/30 shadow-2xl group-hover:shadow-3xl transition-all duration-500 h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">
                            Bu Ay
                          </h3>
                          <p className="text-green-300 text-2xl font-bold mb-2">
                            +156%
                          </p>
                          <div className="flex items-center justify-center text-xs text-green-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Artış oranı
                          </div>
                        </div>
                        </div>
                      </motion.div>
                  </div>

                    {/* Template Gallery */}
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Şablon Galerisi</h3>
                        <p className="text-blue-200">Hazır şablonlar ile hızlıca başlayın</p>
                      </div>
                        <div className="flex items-center space-x-3">
                          <motion.button 
                          className="p-2 hover:bg-white/10 rounded-xl text-blue-300 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                          <Grid3X3 className="w-5 h-5" />
                          </motion.button>
                          <motion.button 
                          className="p-2 hover:bg-white/10 rounded-xl text-blue-300 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {templates.map((template, index) => (
                          <motion.div
                            key={template.id}
                            variants={itemVariants}
                            custom={index}
                          className="group cursor-pointer relative"
                            whileHover={{ 
                              scale: 1.05, 
                            rotateY: 5,
                              z: 50
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                          onClick={() => handleTemplateClick(template.id)}
                        >
                          {/* Popular Badge */}
                          {template.popular && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-lg">
                              ⭐ Popüler
                            </div>
                          )}
                          
                          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden group-hover:shadow-3xl transition-all duration-300 h-full">
                            {/* Icon Section */}
                            <div className={`bg-gradient-to-br ${template.color} p-4 flex items-center justify-center relative overflow-hidden`}>
                              <div className="text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                                  {template.icon}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            
                            {/* Content Section */}
                            <div className="p-4 flex flex-col flex-grow">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  template.difficulty === 'Kolay' ? 'bg-green-500/20 text-green-300' :
                                  template.difficulty === 'Orta' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {template.difficulty}
                                </span>
                                <span className="text-xs text-blue-300">
                                  {template.time}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h4 className="text-white font-bold text-sm leading-tight mb-2 group-hover:text-blue-200 transition-colors">
                                  {template.title}
                                </h4>
                              
                              {/* Description */}
                              <p className="text-blue-200 text-xs leading-relaxed mb-3 flex-grow line-clamp-2">
                                {template.description}
                              </p>
                              
                              {/* Features */}
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {template.features.slice(0, 2).map((feature, idx) => (
                                    <span key={idx} className="text-xs bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full">
                                      {feature}
                                    </span>
                                  ))}
                                  {template.features.length > 2 && (
                                    <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">
                                      +{template.features.length - 2}
                                    </span>
                                  )}
                    </div>
                  </div>
                  
                              {/* Call to Action */}
                              <div className="mt-3 pt-2 border-t border-white/10">
                                <div className="flex items-center justify-center text-blue-300 group-hover:text-white transition-colors">
                                  <Plus className="w-3 h-3 mr-1" />
                                  <span className="text-xs font-medium">Kullan</span>
                        </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                    </div>
                  </div>
                </section>
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
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-xl"
                >
                  <option value="all" className="bg-slate-800">Tümü</option>
                  <option value="7" className="bg-slate-800">Son 7 gün</option>
                  <option value="30" className="bg-slate-800">Son 30 gün</option>
                </select>
                
                {/* Pager */}
                <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
                  <motion.button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className={`p-2 rounded-lg ${safePage === 0 ? 'text-purple-400/40' : 'text-purple-300 hover:text-white hover:bg-white/10 transition-colors'}`}
                    whileHover={{ scale: safePage === 0 ? 1 : 1.1 }}
                    whileTap={{ scale: safePage === 0 ? 1 : 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <div className="px-2 text-purple-300 text-sm select-none">{safePage + 1}/{totalPages}</div>
                  <motion.button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage >= totalPages - 1}
                    className={`p-2 rounded-lg ${safePage >= totalPages - 1 ? 'text-purple-400/40' : 'text-purple-300 hover:text-white hover:bg-white/10 transition-colors'}`}
                    whileHover={{ scale: safePage >= totalPages - 1 ? 1 : 1.1 }}
                    whileTap={{ scale: safePage >= totalPages - 1 ? 1 : 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5" />
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
                  onClick={() => navigate(`/form-builder?surveyId=${survey.id}`)}
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