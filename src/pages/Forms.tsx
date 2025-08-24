import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Image as ImageIcon,
  FileText,
  Edit,
  Trash2,
  Eye,
  Upload,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { surveyService, type Survey } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadService } from '../services/uploadService';

const Forms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showImageUpload, setShowImageUpload] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Backend'den gelen veriler için state'ler
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  // Backend'den anketleri yükle
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      console.log('🔄 Anketler yükleniyor...');
      setIsLoading(true);
      setError(null);
      const surveysData = user?.id
        ? await surveyService.getSurveysByUserFlexible(user.id)
        : await surveyService.getAllSurveys();
      console.log('📊 Yüklenen anket sayısı:', surveysData.length);
      if (surveysData && surveysData.length) {
        console.table(
          surveysData.slice(0, 10).map((s: any) => ({
            id: s.id ?? s._id,
            users_id: s.users_id,
            usersId: s.usersId,
            userId: s.userId,
            user_id: s.user_id,
            createdBy: s.createdBy,
            ownerId: s.ownerId,
            userObjId: s.user?.id,
          }))
        );
      }
      // Ek güvenlik: client-side sahiplik filtresi uygula
      const myId = user?.id ? String(user.id) : ''
      const owned = surveysData.filter((s: any, idx: number) => {
        const owner = s.UsersId ?? s.usersId ?? s.users_id ?? s.userId ?? s.user_id ?? s.createdBy ?? s.ownerId ?? s.user?.id
        const ok = owner != null && String(owner) === myId
        if (idx < 10) console.log('[Forms][final-filter] item', idx, 'owner:', owner, 'match:', ok)
        return ok
      })
             console.log('📊 (Forms) Nihai sahip filtre sayısı:', owned.length)
       
       // Resim URL'lerini kontrol et
       owned.forEach((survey, index) => {
         console.log(`📸 Survey ${index + 1} (${survey.id}):`, {
           surveyName: survey.surveyName,
           backgroundImage: survey.backgroundImage,
           surveyBackgroundImage: survey.surveyBackgroundImage, 
           fullUrl: survey.backgroundImage || (survey.surveyBackgroundImage ? `http://localhost:5000${survey.surveyBackgroundImage}` : '')
         });
       });
       
       setSurveys(owned)
    } catch (err: any) {
      console.error('❌ Anketler yüklenirken hata:', err);
      setError(err.message || 'Anketler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSurveys();
  };

  const handleImageUpload = async (file: File, surveyId: string) => {
    console.log('🚀 handleImageUpload fonksiyonu başlatıldı');
    console.log('📁 Gelen dosya:', file);
    console.log('🆔 Survey ID:', surveyId);
    
    try {
      console.log('⏳ Yükleme durumu ayarlanıyor...');
      setIsUploadingImage(true);
      setUploadProgress(0);
      setUploadMessage(null);
      
      console.log('📁 Seçilen dosya bilgileri:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString()
      });
      
      // Dosya boyutu kontrolü (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage({ type: 'error', message: 'Dosya boyutu 5MB\'dan küçük olmalıdır' });
        return;
      }

      // Dosya tipi kontrolü - daha detaylı
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      console.log('🔍 Dosya format kontrolü:', {
        mimeType: file.type,
        extension: fileExtension,
        isAllowedMimeType: allowedTypes.includes(file.type),
        isAllowedExtension: allowedExtensions.includes(fileExtension || '')
      });
      
      if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension || '')) {
        setUploadMessage({ 
          type: 'error', 
          message: `Geçersiz dosya formatı. Sadece JPG, PNG, GIF ve WebP dosyaları kabul edilir. Seçilen dosya: ${file.name}` 
        });
        return;
      }

      // Progress simülasyonu
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Resmi sunucuya yükle
      const imageUrl = await uploadService.uploadBackgroundImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Relative URL'yi tam URL'ye çevir
      const fullImageUrl = `http://localhost:5000${imageUrl}`;
      console.log('✅ Backend\'den gelen resim URL:', imageUrl);
      console.log('🔗 Tam resim URL:', fullImageUrl);

      // Anketi güncelle
      const surveyToUpdate = surveys.find(s => s.id === surveyId);
      if (surveyToUpdate) {
        const updatedSurvey = {
          ...surveyToUpdate,
          backgroundImage: fullImageUrl,
          surveyBackgroundImage: imageUrl
        };
        
        // Backend'e güncelleme gönder
        await surveyService.updateSurvey(surveyId, {
          surveyName: updatedSurvey.surveyName,
          surveyDescription: updatedSurvey.surveyDescription,
          surveyTypeId: 1,
          isActive: updatedSurvey.isActive,
          usersId: user?.id != null ? Number(user.id) : undefined,
          backgroundImage: fullImageUrl,
          surveyBackgroundImage: imageUrl,
          questions: [],
          settings: (updatedSurvey as any).settings || {},
          status: updatedSurvey.status || 'draft',
          category: updatedSurvey.category || 'Genel',
          tags: updatedSurvey.tags || []
        });
        
        // Local state'i güncelle
        setSurveys(prev => prev.map(s => 
          s.id === surveyId 
            ? { ...s, backgroundImage: fullImageUrl, surveyBackgroundImage: imageUrl }
            : s
        ));
      }
      
      setUploadMessage({ type: 'success', message: 'Anket resmi başarıyla yüklendi!' });
      setShowImageUpload(null);
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => setUploadMessage(null), 3000);
      
    } catch (error) {
      console.error('❌ Forms - Resim yükleme hatası:', error);
      console.error('📋 Hata detayları:', {
        error: error,
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setUploadMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : t('Resim yüklenirken bir hata oluştu') 
      });
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (window.confirm(t('Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'))) {
      try {
        console.log('🚀 Anket silme işlemi başlatılıyor...');
        console.log('🆔 Survey ID:', surveyId);
        console.log('👤 User objesi:', user);
        console.log('👤 User ID:', user?.id);
        console.log('👤 User ID tipi:', typeof user?.id);
        
        // Kullanıcı ID'sini number'a çevir (0 değeri de geçerli)
        const userId = user?.id != null ? Number(user.id) : undefined;
        console.log('🔢 Dönüştürülmüş User ID:', userId);
        console.log('🔢 Dönüştürülmüş User ID tipi:', typeof userId);
        
        await surveyService.deleteSurvey(surveyId, userId);
        console.log('✅ Anket başarıyla silindi:', surveyId);
        
        // Başarı mesajı göster
        alert(t('Anket başarıyla silindi!'));
        
        // Anketleri yeniden yükle
        loadSurveys();
      } catch (error: any) {
        console.error('❌ Anket silinirken hata:', error);
        
        // Kullanıcıya daha detaylı hata mesajı göster
        const errorMessage = error.message || t('Anket silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        alert(`${t('Hata')}: ${errorMessage}`);
      }
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.surveyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         survey.surveyDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (survey.tags && survey.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    return new Date(b.lastModified || b.createdAt).getTime() - new Date(a.lastModified || a.createdAt).getTime();
  });



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-500';
      case 'draft': return 'from-yellow-500 to-orange-500';
      case 'archived': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
             case 'active': return 'Active';
             case 'draft': return 'Draft';
             case 'archived': return 'Archived';
             default: return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      [t('Ürün')]: 'from-blue-500 to-cyan-500',
      [t('Müşteri')]: 'from-purple-500 to-pink-500',
      [t('İnsan Kaynakları')]: 'from-green-500 to-emerald-500',
      [t('Eğitim')]: 'from-orange-500 to-red-500',
      [t('Pazarlama')]: 'from-indigo-500 to-purple-500',
      [t('Teknoloji')]: 'from-teal-500 to-blue-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Header */}
      <div className="relative bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('My Forms')}
              </motion.h1>
              <motion.p 
                className="text-blue-200 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t('Anket yönetimi ve takibi')}
              </motion.p>
              {error && (
                <motion.div 
                  className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-3 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-2xl font-medium shadow-2xl flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: isLoading ? 1 : 1.05, y: isLoading ? 0 : -2 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('Yenile')}</span>
              </motion.button>
              <motion.button 
                onClick={() => navigate('/form-builder')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-medium shadow-2xl flex items-center space-x-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>{t('Yeni Anket')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1">
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('Anket ara...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200 backdrop-blur-xl"
                />
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white/10 rounded-2xl p-1 border border-white/20">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-colors ${
                    viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-blue-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Grid3X3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-colors ${
                    viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-blue-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Surveys Grid/List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-blue-200 text-lg">Anketler yükleniyor...</p>
              </div>
            </motion.div>
          ) : sortedSurveys.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <FileText className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-200 text-lg mb-2">Henüz anket oluşturmadınız</p>
                <p className="text-blue-300 text-sm">İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın</p>
              </div>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {sortedSurveys.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group cursor-pointer"
                  whileHover={{ 
                    scale: 1.02, 
                    rotateY: 5,
                    z: 50
                  }}
                  transition={{ type: "spring", stiffness: 300, duration: 0.5, delay: index * 0.1 }}
                  onClick={() => navigate(`/forms/${survey.id}`)}
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 overflow-hidden relative">
                    {/* Background Image or Placeholder */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-100/20 to-blue-100/20 overflow-hidden">
                      {survey.backgroundImage || survey.surveyBackgroundImage ? (
                        <img
                          src={survey.backgroundImage || (survey.surveyBackgroundImage ? `http://localhost:5000${survey.surveyBackgroundImage}` : '')}
                          alt={survey.surveyName}
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            console.log('✅ Resim başarıyla yüklendi:', e.currentTarget.src);
                          }}
                          onError={(e) => {
                            console.error('❌ Resim yüklenemedi:', survey.backgroundImage || survey.surveyBackgroundImage);
                            console.error('🔗 Denenen URL:', survey.backgroundImage || (survey.surveyBackgroundImage ? `http://localhost:5000${survey.surveyBackgroundImage}` : ''));
                            console.error('📊 Survey verisi:', {
                              id: survey.id,
                              backgroundImage: survey.backgroundImage,
                              surveyBackgroundImage: survey.surveyBackgroundImage
                            });
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-purple-400/50" />
                        </div>
                      )}
                      
                      {/* Upload Image Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageUpload(survey.id.toString());
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Upload className="w-4 h-4 text-white" />
                      </motion.button>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(survey.status || 'draft')} text-white shadow-lg`}>
                          {getStatusText(survey.status || 'draft')}
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(survey.category || 'Genel')} text-white shadow-lg`}>
                          {survey.category || 'Genel'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-xl group-hover:text-purple-200 transition-colors mb-2">
                            {survey.surveyName}
                          </h3>
                          <p className="text-purple-200 text-sm line-clamp-2 mb-3">{survey.surveyDescription}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {survey.tags && survey.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/forms/${survey.id}`);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl text-purple-300 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/form-builder/${survey.id}`);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl text-blue-400 hover:text-blue-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSurvey(survey.id);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl text-red-400 hover:text-red-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.responses || 0}</div>
                          <div className="text-xs text-purple-300">Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.views || 0}</div>
                          <div className="text-xs text-purple-300">{t('Görüntü')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.completionRate || 0}%</div>
                          <div className="text-xs text-purple-300">{t('Tamamlanma')}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-purple-300">
                        <span>{survey.lastModified || survey.createdAt}</span>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{survey.questions} {t('soru')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Survey</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Responses</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Last Update</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sortedSurveys.map((survey) => (
                      <motion.tr 
                        key={survey.id} 
                        className="hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{survey.surveyName}</div>
                              <div className="text-sm text-purple-300">{survey.surveyDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getStatusColor(survey.status || 'draft')} text-white`}>
                            {getStatusText(survey.status || 'draft')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getCategoryColor(survey.category || 'Genel')} text-white`}>
                            {survey.category || 'Genel'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{survey.responses || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">{survey.lastModified || survey.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <motion.button 
                              onClick={() => navigate(`/forms/${survey.id}`)}
                              className="text-purple-400 hover:text-purple-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              onClick={() => navigate(`/form-builder/${survey.id}`)}
                              className="text-blue-400 hover:text-blue-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              onClick={() => handleDeleteSurvey(survey.id)}
                              className="text-red-400 hover:text-red-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div 
              className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <h3 className="text-2xl font-semibold text-white mb-2 text-center">Anket Resmi Yükle</h3>
                <p className="text-purple-200 text-center mb-6">Anketinizin görsel kimliğini belirlemek için bir resim seçin</p>
                
                {/* Upload Message */}
                {uploadMessage && (
                  <motion.div 
                    className={`py-3 px-4 rounded-lg mb-4 flex items-center space-x-2 ${
                      uploadMessage.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {uploadMessage.type === 'success' ? (
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm ${
                      uploadMessage.type === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {uploadMessage.message}
                    </span>
                  </motion.div>
                )}
                
                <div className="border-2 border-dashed border-purple-400/50 rounded-2xl p-8 text-center">
                  {isUploadingImage ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-purple-200">Anket resmi yükleniyor...</p>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-purple-300 text-sm">{uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-200 mb-2">Anket resmi dosyasını buraya sürükleyin</p>
                      <p className="text-purple-300 text-sm mb-6">veya aşağıdaki butona tıklayarak seçin</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('🖱️ Dosya seçimi tetiklendi');
                      const file = e.target.files?.[0];
                      console.log('📁 Seçilen dosya:', file);
                      
                      if (file) {
                        console.log('✅ Dosya bulundu, yükleme başlatılıyor...');
                        handleImageUpload(file, showImageUpload);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`px-6 py-3 rounded-2xl transition-all duration-300 shadow-xl inline-flex items-center space-x-2 ${
                      isUploadingImage 
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white cursor-pointer hover:shadow-2xl'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>{isUploadingImage ? 'Yükleniyor...' : 'Resim Seç'}</span>
                  </label>
                </div>
                <div className="flex justify-end mt-6">
                  <motion.button
                    onClick={() => setShowImageUpload(null)}
                    className="px-6 py-3 text-purple-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    İptal
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Forms;