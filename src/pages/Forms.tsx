import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  MoreVertical,
  Image as ImageIcon,
  FileText,
  Edit,
  Trash2,
  Eye,
  Upload,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Brain,
  AlertCircle,
  RefreshCw,
  X,
  BarChart3
} from 'lucide-react';
import { surveyService, type Survey } from '../services/surveyService';
import { aiService, type AISurveyAnalysis } from '../services/aiService';



const Forms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [showImageUpload, setShowImageUpload] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'responses' | 'views' | 'ai'>('date');
  const [aiAnalysisModal, setAiAnalysisModal] = useState<{ show: boolean; surveyId?: string; analysis?: AISurveyAnalysis }>({ show: false });
  const [isAIAnalyzing, setIsAIAnalyzing] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string>('');
  
  // AI Insights
  const [aiInsightsModal, setAiInsightsModal] = useState<{ show: boolean; surveyId?: string; insights?: any[] }>({ show: false });
  const [isAIInsightsLoading, setIsAIInsightsLoading] = useState<string | null>(null);
  
  // AI Summary
  const [aiSummaryModal, setAiSummaryModal] = useState<{ show: boolean; surveyId?: string; summary?: any }>({ show: false });
  const [isAISummaryLoading, setIsAISummaryLoading] = useState<string | null>(null);
  
  // AI Report
  const [aiReportModal, setAiReportModal] = useState<{ show: boolean; surveyId?: string; report?: any }>({ show: false });
  const [isAIReportLoading, setIsAIReportLoading] = useState<string | null>(null);
  
  // Backend'den gelen veriler için state'ler
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSurvey, setHoveredSurvey] = useState<string | null>(null);

  // Backend'den anketleri yükle
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      console.log('🔄 Anketler yükleniyor...');
      setIsLoading(true);
      setError(null);
      const surveysData = await surveyService.getAllSurveys();
      console.log('📊 Yüklenen anketler:', surveysData);
      setSurveys(surveysData);
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

  // AI analizi fonksiyonu
  const handleAIAnalyze = async (surveyId: string) => {
    setIsAIAnalyzing(surveyId);
    setAiError('');
    
    try {
      const analysis = await aiService.analyzeSurvey(surveyId);
      
      setAiAnalysisModal({
        show: true,
        surveyId,
        analysis
      });
      
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
      
      // Error'u göstermek için boş analiz modal'ı aç
      setAiAnalysisModal({
        show: true,
        surveyId,
        analysis: undefined
      });
    } finally {
      setIsAIAnalyzing(null);
    }
  };

  // AI Insights fonksiyonu
  const handleAIInsights = async (surveyId: string) => {
    setIsAIInsightsLoading(surveyId);
    
    try {
      const insights = await aiService.getInsights(surveyId);
      setAiInsightsModal({
        show: true,
        surveyId,
        insights
      });
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
      console.error('AI insights hatası:', error);
    } finally {
      setIsAIInsightsLoading(null);
    }
  };

  // AI Summary fonksiyonu
  const handleAISummary = async (surveyId: string) => {
    setIsAISummaryLoading(surveyId);
    
    try {
      const summary = await aiService.getSummary(surveyId);
      setAiSummaryModal({
        show: true,
        surveyId,
        summary
      });
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
      console.error('AI summary hatası:', error);
    } finally {
      setIsAISummaryLoading(null);
    }
  };

  // AI Report fonksiyonu
  const handleAIReport = async (surveyId: string) => {
    setIsAIReportLoading(surveyId);
    
    try {
      const report = await aiService.getReport(surveyId);
      setAiReportModal({
        show: true,
        surveyId,
        report
      });
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
      console.error('AI raporu hatası:', error);
    } finally {
      setIsAIReportLoading(null);
    }
  };

  const categories = ['Tümü', 'Ürün', 'Müşteri', 'İnsan Kaynakları', 'Eğitim', 'Pazarlama', 'Teknoloji'];

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.surveyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         survey.surveyDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (survey.tags && survey.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = selectedStatus === 'all' || survey.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || survey.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    switch (sortBy) {
      case 'responses': return (b.responses || 0) - (a.responses || 0);
      case 'views': return (b.views || 0) - (a.views || 0);
      case 'ai': return (b.aiScore || 0) - (a.aiScore || 0);
      default: return new Date(b.lastModified || b.createdAt).getTime() - new Date(a.lastModified || a.createdAt).getTime();
    }
  });

  const handleImageUpload = (surveyId: string, file: File) => {
    console.log(`Uploading image for survey ${surveyId}:`, file);
    setShowImageUpload(null);
  };

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
      case 'active': return 'Aktif';
      case 'draft': return 'Taslak';
      case 'archived': return 'Arşivlenmiş';
      default: return 'Bilinmiyor';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Ürün': 'from-blue-500 to-cyan-500',
      'Müşteri': 'from-purple-500 to-pink-500',
      'İnsan Kaynakları': 'from-green-500 to-emerald-500',
      'Eğitim': 'from-orange-500 to-red-500',
      'Pazarlama': 'from-indigo-500 to-purple-500',
      'Teknoloji': 'from-teal-500 to-blue-500'
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
                Anketlerim
              </motion.h1>
              <motion.p 
                className="text-blue-200 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                AI destekli anket yönetimi ve analizi
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
                <span>Yenile</span>
              </motion.button>
              <motion.button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-2xl flex items-center space-x-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-5 h-5" />
                <span>AI Analiz</span>
              </motion.button>
              <motion.button 
                onClick={() => navigate('/form-builder')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-medium shadow-2xl flex items-center space-x-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Yeni Anket</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Insights Banner */}
        <motion.div 
          className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-blue-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">AI Öngörüleri</h3>
                <p className="text-blue-200">Son 7 günde anketleriniz %23 daha fazla yanıt aldı</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">+23%</div>
              <div className="text-sm text-blue-300">Yanıt Artışı</div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 max-w-md">
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="AI destekli arama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200 backdrop-blur-xl"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-xl"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-xl"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşivlenmiş</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-xl"
              >
                <option value="date">Tarihe Göre</option>
                <option value="responses">Yanıt Sayısına Göre</option>
                <option value="views">Görüntü Sayısına Göre</option>
                <option value="ai">AI Skoruna Göre</option>
              </select>
              
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
                  onMouseEnter={() => setHoveredSurvey(survey.id.toString())}
                  onMouseLeave={() => setHoveredSurvey(null)}
                  onClick={() => navigate(`/forms/${survey.id}`)}
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 overflow-hidden relative">
                    {/* Background Image or Placeholder */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-100/20 to-blue-100/20 overflow-hidden">
                      {survey.backgroundImage ? (
                        <img
                          src={survey.backgroundImage}
                          alt={survey.surveyName}
                          className="w-full h-full object-cover"
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

                      {/* AI Score Badge */}
                      {survey.aiScore && (
                        <div className="absolute bottom-3 right-3">
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI {survey.aiScore}</span>
                          </div>
                        </div>
                      )}
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
                        <motion.button 
                          className="p-2 hover:bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-300 hover:text-white"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.responses || 0}</div>
                          <div className="text-xs text-purple-300">Yanıt</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.views || 0}</div>
                          <div className="text-xs text-purple-300">Görüntü</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-white">{survey.completionRate || 0}%</div>
                          <div className="text-xs text-purple-300">Tamamlanma</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-purple-300">
                        <span>{survey.lastModified || survey.createdAt}</span>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{survey.questions} soru</span>
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Anket</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Yanıtlar</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">AI Skor</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Son Güncelleme</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">İşlemler</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {survey.aiScore ? (
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-white">{survey.aiScore}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-purple-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">{survey.lastModified || survey.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <motion.button 
                              onClick={() => handleAIAnalyze(survey.id)}
                              disabled={isAIAnalyzing === survey.id}
                              className="text-indigo-400 hover:text-indigo-200 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="AI Analizi"
                            >
                              {isAIAnalyzing === survey.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <Brain className="w-4 h-4" />
                              )}
                            </motion.button>
                            
                            <motion.button 
                              onClick={() => handleAIInsights(survey.id)}
                              disabled={isAIInsightsLoading === survey.id}
                              className="text-emerald-400 hover:text-emerald-200 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="AI Insights"
                            >
                              {isAIInsightsLoading === survey.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <Lightbulb className="w-4 h-4" />
                              )}
                            </motion.button>
                            
                            <motion.button 
                              onClick={() => handleAISummary(survey.id)}
                              disabled={isAISummaryLoading === survey.id}
                              className="text-amber-400 hover:text-amber-200 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="AI Özeti"
                            >
                              {isAISummaryLoading === survey.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </motion.button>
                            
                            <motion.button 
                              onClick={() => handleAIReport(survey.id)}
                              disabled={isAIReportLoading === survey.id}
                              className="text-cyan-400 hover:text-cyan-200 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="AI Raporu"
                            >
                              {isAIReportLoading === survey.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <BarChart3 className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button 
                              onClick={() => navigate(`/forms/${survey.id}`)}
                              className="text-purple-400 hover:text-purple-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              className="text-blue-400 hover:text-blue-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
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
        {showImageUpload && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50">
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Arkaplan Resmi Yükle</h3>
              <div className="border-2 border-dashed border-purple-400/50 rounded-2xl p-8 text-center">
                <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 mb-6">Resim dosyasını buraya sürükleyin veya seçin</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(showImageUpload, file);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Resim Seç</span>
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
          </div>
        )}

        {/* AI Analysis Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50">
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full mx-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">AI Anket Analizi</h3>
                <motion.button
                  onClick={() => setShowAIModal(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <h4 className="text-lg font-semibold text-white mb-3">📊 Genel Performans</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">+23%</div>
                      <div className="text-sm text-purple-300">Yanıt Artışı</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">85%</div>
                      <div className="text-sm text-purple-300">Ortalama Tamamlanma</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <div className="text-sm text-purple-300">Toplam Görüntü</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                  <h4 className="text-lg font-semibold text-white mb-3">🎯 AI Önerileri</h4>
                  <ul className="space-y-3 text-purple-200">
                    <li className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <span>Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Çalışan memnuniyet anketleri için en uygun zaman şimdi</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
                      <span>Ürün lansmanı anketleriniz trend olmaya başladı</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Analizi Modal */}
        {aiAnalysisModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Anket Analizi</h3>
                  </div>
                  <button
                    onClick={() => setAiAnalysisModal({ show: false })}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {aiError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analiz Hatası</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{aiError}</p>
                    <button
                      onClick={() => aiAnalysisModal.surveyId && handleAIAnalyze(aiAnalysisModal.surveyId)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : aiAnalysisModal.analysis ? (
                  <div className="space-y-6">
                    {/* Genel Skor */}
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Genel AI Skoru</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Anket kalitesi ve etkililği</p>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          {aiAnalysisModal.analysis.overallScore}/100
                        </div>
                      </div>
                    </div>

                    {/* Öneriler */}
                    {aiAnalysisModal.analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Önerileri</h4>
                        <div className="space-y-3">
                          {aiAnalysisModal.analysis.recommendations.map((rec, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              rec.impact === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                              rec.impact === 'medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                              'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            }`}>
                              <div className="flex items-start space-x-3">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${
                                  rec.impact === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                                  rec.impact === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                  'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                }`}>
                                  {rec.impact === 'high' ? 'Yüksek' : rec.impact === 'medium' ? 'Orta' : 'Düşük'} Etki
                                </span>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* İçgörüler */}
                    {aiAnalysisModal.analysis.insights.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI İçgörüleri</h4>
                        <div className="space-y-3">
                          {aiAnalysisModal.analysis.insights.map((insight, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">{insight.category}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.insight}</p>
                                  <div className="flex items-center mt-2">
                                    <span className="text-xs text-gray-500">Güven: {insight.confidence}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optimizasyon Önerileri */}
                    {aiAnalysisModal.analysis.optimizationSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Optimizasyon Önerileri</h4>
                        <ul className="space-y-2">
                          {aiAnalysisModal.analysis.optimizationSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                              <Target className="w-4 h-4 text-indigo-600 mt-0.5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Beklenen Yanıt Oranı */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Beklenen Yanıt Oranı</h4>
                          <p className="text-2xl font-bold text-blue-600">%{aiAnalysisModal.analysis.expectedResponseRate}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AI tahmin modeline göre</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    </motion.div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Analizi Yapılıyor</h4>
                    <p className="text-gray-600 dark:text-gray-400">Anketiniz detaylı olarak analiz ediliyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Insights Modal */}
        {aiInsightsModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Insights</h3>
                  </div>
                  <button
                    onClick={() => setAiInsightsModal({ show: false })}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {aiInsightsModal.insights ? (
                  <div className="space-y-4">
                    {aiInsightsModal.insights.map((insight: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Lightbulb className="w-5 h-5 text-emerald-500 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">{insight.category}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.insight}</p>
                            <div className="flex items-center mt-2">
                              <span className="text-xs text-gray-500">Güven: {insight.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Insights yükleniyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Summary Modal */}
        {aiSummaryModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Özeti</h3>
                  </div>
                  <button
                    onClick={() => setAiSummaryModal({ show: false })}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {aiSummaryModal.summary ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Özet</h4>
                      <p className="text-gray-700 dark:text-gray-300">{aiSummaryModal.summary.summary}</p>
                    </div>
                    
                    {aiSummaryModal.summary.keyPoints && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ana Noktalar</h4>
                        <ul className="space-y-2">
                          {aiSummaryModal.summary.keyPoints.map((point: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                              <span className="text-gray-700 dark:text-gray-300">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment</p>
                        <p className="font-medium">{aiSummaryModal.summary.sentiment}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Güven</p>
                        <p className="font-medium">{aiSummaryModal.summary.confidence}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Özet hazırlanıyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Report Modal */}
        {aiReportModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Raporu</h3>
                  </div>
                  <button
                    onClick={() => setAiReportModal({ show: false })}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {aiReportModal.report ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Genel Bakış</h4>
                      <p className="text-gray-700 dark:text-gray-300">{aiReportModal.report.overview}</p>
                    </div>
                    
                    {aiReportModal.report.insights && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analiz Sonuçları</h4>
                        <div className="grid gap-4">
                          {aiReportModal.report.insights.map((insight: any, index: number) => (
                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-white">{insight.category}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiReportModal.report.recommendations && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Öneriler</h4>
                        <div className="space-y-3">
                          {aiReportModal.report.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200 rounded">
                                  Etki: {rec.impact}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                                  Kategori: {rec.category}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiReportModal.report.exportUrl && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <a
                          href={aiReportModal.report.exportUrl}
                          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Raporu İndir
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Rapor hazırlanıyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Forms;


