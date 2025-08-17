import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical, 
  Users, 
  BarChart3,
  Image as ImageIcon,
  FileText,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Lightbulb,
  Rocket,
  Star,
  Palette,
  Wand2,
  Brain,
  ChartBar,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { surveyService, type Survey } from '../services/surveyService';



const Forms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSurvey, setHoveredSurvey] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'responses' | 'views' | 'ai'>('date');
  
  // Backend'den gelen veriler için state'ler
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      </main>
    </div>
  );
};

export default Forms;


