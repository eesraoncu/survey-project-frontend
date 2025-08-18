import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Type,
  CheckSquare,
  Radio,
  List,
  Star,
  Heart,
  ThumbsUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { surveyService, type FormData as SurveyFormData } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import { questionService, type UpsertQuestionRequest } from '../services/questionService';
import { aiService, type AIQuestionSuggestion } from '../services/aiService';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating' | 'date' | 'location' | 'phone' | 'email' | 'name';
  title: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  // Derecelendirme için
  maxRating?: number;
  ratingValue?: number;
  ratingIcon?: 'star' | 'heart' | 'thumb';
}

interface FormData {
  title: string;
  description: string;
  backgroundImage?: string;
  questions: Question[];
  settings: {
    allowAnonymous: boolean;
    showProgressBar: boolean;
    allowMultipleResponses: boolean;
    theme: 'light' | 'dark' | 'custom';
  };
  status: 'active' | 'draft' | 'archived';
  category: string;
  tags: string[];
}

const FormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    backgroundImage: '',
    questions: [],
    settings: {
      allowAnonymous: true,
      showProgressBar: true,
      allowMultipleResponses: false,
      theme: 'light'
    },
    status: 'draft',
    category: 'Genel',
    tags: []
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'settings'>('builder');
  const [showImageUpload, setShowImageUpload] = useState(false);
  // const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showAIQuestions, setShowAIQuestions] = useState(false);
  const [aiQuestionSuggestions, setAiQuestionSuggestions] = useState<AIQuestionSuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [sentimentModal, setSentimentModal] = useState<{ show: boolean; text?: string; result?: any }>({ show: false });
  const [isSentimentAnalyzing, setIsSentimentAnalyzing] = useState(false);

  // AI'dan gelen anket verilerini yükle
  useEffect(() => {
    console.log('🔍 FormBuilder başladı, AI verisi kontrol ediliyor...');
    
    const aiGeneratedData = localStorage.getItem('aiGeneratedSurvey');
    console.log('🔍 AI verisi raw data:', aiGeneratedData);
    
    if (aiGeneratedData) {
      try {
        const aiSurvey = JSON.parse(aiGeneratedData);
        console.log('📊 AI anket parse edildi:', aiSurvey);
        
        // AI verilerini FormBuilder formatına dönüştür
        const aiQuestions: Question[] = aiSurvey.questions?.map((q: any, index: number) => ({
          id: `ai-question-${index}`,
          type: mapAIQuestionType(q.questionType || q.question_type || q.type),
          title: q.questionsText || q.question_text || q.question || `Soru ${index + 1}`,
          required: q.required || false,
          options: q.choices || q.options || [],
          placeholder: `${q.questionsText || q.question_text || q.question || 'Bu soru'} için yanıtınızı girin`,
          description: ''
        })) || [];

        console.log('🔄 AI soruları dönüştürüldü:', aiQuestions);

        setFormData({
          title: aiSurvey.surveyName || aiSurvey.survey_title || aiSurvey.title || 'AI ile Oluşturulan Anket',
          description: aiSurvey.surveyDescription || aiSurvey.survey_description || aiSurvey.description || '',
          backgroundImage: '',
          questions: aiQuestions,
          settings: {
            allowAnonymous: true,
            showProgressBar: true,
            allowMultipleResponses: false,
            theme: 'light'
          },
          status: 'draft',
          category: 'Genel',
          tags: ['AI-Generated']
        });

        console.log('💾 FormData güncellendi, soru sayısı:', aiQuestions.length);

        // Başarı mesajı göster
        setSaveMessage({ 
          type: 'success', 
          message: `AI tarafından ${aiQuestions.length} soru ile anket oluşturuldu!` 
        });

        // localStorage'dan sil
        localStorage.removeItem('aiGeneratedSurvey');
        
        // 5 saniye sonra mesajı kaldır
        setTimeout(() => setSaveMessage(null), 5000);
        
      } catch (error) {
        console.error('💥 AI verisi parse edilemedi:', error);
        setSaveMessage({ 
          type: 'error', 
          message: 'AI verisi yüklenirken hata oluştu.' 
        });
        localStorage.removeItem('aiGeneratedSurvey');
      }
    }
  }, []);



  // FormData questions değişikliğini izle
  useEffect(() => {
    console.log('📝 FormData Questions Güncellemesi:', {
      questionsCount: formData.questions.length,
      questions: formData.questions.map((q, i) => `${i+1}. ${q.title}`)
    });
  }, [formData.questions]);

  // AI soru tipini FormBuilder tipine dönüştür
  const mapAIQuestionType = (aiType: string): Question['type'] => {
    console.log('🔍 AI Question Type Mapping:', aiType);
    
    switch (aiType?.toLowerCase()) {
      case 'multiple_choice':
      case 'single_choice':
        console.log('✅ multiple_choice → radio');
        return 'radio';
      case 'text':
      case 'textarea':
        console.log('✅ text → text');
        return 'text';
      case 'rating':
      case 'scale':
        console.log('✅ rating → rating');
        return 'rating';
      case 'yes_no':
      case 'boolean':
        console.log('✅ yes_no → radio');
        return 'radio';
      case 'dropdown':
      case 'select':
        console.log('✅ dropdown → select');
        return 'select';
      case 'checkbox':
      case 'multiple_select':
        console.log('✅ checkbox → checkbox');
        return 'checkbox';
      default:
        console.log('⚠️ Unknown type, defaulting to text:', aiType);
        return 'text';
    }
  };

  // AI'dan soru önerileri al
  const handleAIQuestionSuggestions = async () => {
    setIsLoadingAI(true);
    setAiError('');
    
    try {
      const context = {
        surveyTitle: formData.title,
        surveyDescription: formData.description,
        existingQuestions: formData.questions.map(q => q.title),
        category: formData.category
      };
      
      const suggestions = await aiService.generateQuestions(context);
      setAiQuestionSuggestions(suggestions);
      setShowAIQuestions(true);
      
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setAiError(errorMessage);
      setSaveMessage({ type: 'error', message: errorMessage });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI önerilen soruyu formuna ekle
  const addAIQuestion = (suggestion: AIQuestionSuggestion) => {
    const newQuestion: Question = {
      id: `ai-${Date.now()}`,
      type: mapAIQuestionType(suggestion.type),
      title: suggestion.question,
      required: false,
      options: suggestion.options || [],
      placeholder: `${suggestion.question} için yanıtınızı girin`,
      description: suggestion.reasoning
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Eklenen soruyu listeden kaldır
    setAiQuestionSuggestions(prev => 
      prev.filter(s => s.question !== suggestion.question)
    );

    setSaveMessage({ 
      type: 'success', 
      message: 'AI önerisi başarıyla eklendi!' 
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Sentiment analizi fonksiyonu
  const handleSentimentAnalyze = async (text: string) => {
    if (!text.trim()) {
      setSaveMessage({ type: 'error', message: 'Analiz için metin gerekli!' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSentimentAnalyzing(true);
    
    try {
      const result = await aiService.analyzeSentiment(text);
      setSentimentModal({
        show: true,
        text,
        result
      });
    } catch (error: any) {
      const errorMessage = aiService.formatErrorMessage(error);
      setSaveMessage({ type: 'error', message: errorMessage });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSentimentAnalyzing(false);
    }
  };

  const questionTypes = [
    { type: 'text' as const, label: 'Kısa Yanıt', icon: <Type className="w-5 h-5" />, color: 'bg-blue-500' },
    { type: 'textarea' as const, label: 'Paragraf', icon: <List className="w-5 h-5" />, color: 'bg-green-500' },
    { type: 'radio' as const, label: 'Çoktan Seçmeli', icon: <Radio className="w-5 h-5" />, color: 'bg-purple-500' },
    { type: 'checkbox' as const, label: 'Çoklu Seçim', icon: <CheckSquare className="w-5 h-5" />, color: 'bg-orange-500' },
    { type: 'select' as const, label: 'Açılır Liste', icon: <ChevronDown className="w-5 h-5" />, color: 'bg-indigo-500' },
    { type: 'rating' as const, label: 'Derecelendirme', icon: <Star className="w-5 h-5" />, color: 'bg-yellow-500' },
    { type: 'date' as const, label: 'Tarih', icon: <Calendar className="w-5 h-5" />, color: 'bg-red-500' },
    { type: 'location' as const, label: 'Konum', icon: <MapPin className="w-5 h-5" />, color: 'bg-teal-500' },
    { type: 'phone' as const, label: 'Telefon', icon: <Phone className="w-5 h-5" />, color: 'bg-pink-500' },
    { type: 'email' as const, label: 'E-posta', icon: <Mail className="w-5 h-5" />, color: 'bg-cyan-500' },
    { type: 'name' as const, label: 'Ad Soyad', icon: <User className="w-5 h-5" />, color: 'bg-gray-500' }
  ];

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: '',
      required: false,
      options:
        type === 'radio' || type === 'checkbox' || type === 'select'
          ? ['', '']
          : type === 'rating'
          ? ['1', '2', '3', '4', '5']
          : undefined,
      // Kısa yanıt ve paragraf için varsayılan placeholder'ı boş bırakıyoruz,
      // böylece input'ta saydam placeholder davranışı olur
      placeholder: type === 'text' || type === 'textarea' ? '' : undefined
    };
    if (type === 'rating') {
      newQuestion.maxRating = 5;
      newQuestion.ratingValue = 0;
      newQuestion.ratingIcon = 'star';
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleSaveForm = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Form validasyonu
      if (!formData.title.trim()) {
        setSaveMessage({ type: 'error', message: 'Form başlığı gereklidir' });
        return;
      }

      if (formData.questions.length === 0) {
        setSaveMessage({ type: 'error', message: 'En az bir soru eklemelisiniz' });
        return;
      }

      console.log('🔍 FormBuilder Questions:', formData.questions);

      // Backend'e gönderilecek veriyi hazırla
      const surveyData: SurveyFormData = {
        surveyName: formData.title,
        surveyDescription: formData.description,
        surveyTypeId: 1, // Varsayılan tip ID
        isActive: formData.status === 'active',
        // Backend UsersId bekliyor; sayısal gönderelim
        usersId: user?.id != null ? Number(user.id) : undefined,
        backgroundImage: formData.backgroundImage,
        // Questions'ları backend formatına dönüştür
        questions: formData.questions.map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          required: q.required,
          options: q.options || [],
          placeholder: q.placeholder || '',
          description: q.description || ''
        })),
        settings: formData.settings,
        status: formData.status,
        category: formData.category,
        tags: formData.tags
      };

      console.log('📤 Backend\'e gönderilecek veri (Survey):', surveyData);

      // 1) Anketi kaydet
      const savedSurvey = await surveyService.createSurvey(surveyData);
      console.log('✅ Anket kaydı tamamlandı:', savedSurvey);
      console.log('✅ Kayıt edilen anket sahiplik alanları:', {
        id: (savedSurvey as any).id ?? (savedSurvey as any)._id,
        users_id: (savedSurvey as any).users_id,
        usersId: (savedSurvey as any).usersId,
        userId: (savedSurvey as any).userId,
        user_id: (savedSurvey as any).user_id,
        createdBy: (savedSurvey as any).createdBy,
        ownerId: (savedSurvey as any).ownerId,
        userObjId: (savedSurvey as any).user?.id,
      });

      // 2) Kaydedilen anket ID'sini tespit et
      const rawSurveyId: any = (savedSurvey as any)?.id ?? (savedSurvey as any)?.surveyId ?? (savedSurvey as any)?._id;
      if (!rawSurveyId && formData.questions.length > 0) {
        throw new Error('Anket ID alınamadı, sorular kaydedilemedi.');
      }
      const surveyId: number | string = typeof rawSurveyId === 'string' && /^\d+$/.test(rawSurveyId)
        ? Number(rawSurveyId)
        : rawSurveyId;
      console.log('➡️ Sorular için kullanılacak surveyId:', surveyId);

      // 3) Soruları Questions API'ına yaz
      if (formData.questions.length > 0) {
        const payloads: UpsertQuestionRequest[] = formData.questions.map(q => {
          const titleTrim = (q.title || '').trim()
          const placeholderTrim = (q.placeholder || '').trim()
          const questionsText = titleTrim ? titleTrim : (placeholderTrim || 'Yeni Soru')
          return {
            questionsText,
            questionType: q.type,
            choices: q.options || [],
            surveysId: surveyId,
          }
        });

        console.log('📤 Backend\'e gönderilecek veri (Questions):', payloads);
        await Promise.all(
          payloads.map(p => questionService.create(p).catch(err => {
            console.error('❌ Soru kaydedilemedi:', p, err);
            throw err;
          }))
        );
        console.log('✅ Tüm sorular kaydedildi');
      }

      setSaveMessage({ type: 'success', message: 'Anket ve sorular başarıyla kaydedildi!' });
      
      // 2 saniye sonra anketler sayfasına yönlendir
      setTimeout(() => {
        navigate('/forms');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Anket kaydedilirken hata:', error);
      console.error('📋 Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Anket kaydedilirken bir hata oluştu';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Gönderilen veri formatı hatalı. Lütfen tüm alanları kontrol edin.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      }
      
      setSaveMessage({ type: 'error', message: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== id)
      }));
    }
  };

  const duplicateQuestion = (id: string) => {
    const question = formData.questions.find(q => q.id === id);
    if (question) {
      const newQuestion = { 
        ...question, 
        id: Date.now().toString(),
        title: `${question.title} (Kopya)`
      };
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }
  };

  // const handleImageUpload = (file: File) => {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     setFormData(prev => ({
  //       ...prev,
  //       backgroundImage: e.target?.result as string
  //     }));
  //   };
  //   reader.readAsDataURL(file);
  //   setShowImageUpload(false);
  // };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
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
          {/* Save Message */}
          {saveMessage && (
            <motion.div 
              className={`py-3 px-4 rounded-lg mb-4 flex items-center space-x-2 ${
                saveMessage.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm ${
                saveMessage.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {saveMessage.message}
              </span>
            </motion.div>
          )}
          
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Form Oluşturucu
                </span>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                <span>Önizle</span>
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4" />
                <span>Ayarlar</span>
              </motion.button>
              
              <motion.button
                onClick={handleSaveForm}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-xl flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: isSaving ? 1 : 1.05, y: isSaving ? 0 : -2 }}
                whileTap={{ scale: isSaving ? 1 : 0.95 }}
              >
                {isSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Question Types */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sticky top-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Soru Türleri</h3>
              <div className="space-y-3">
                {questionTypes.map((questionType) => (
                  <motion.button
                    key={questionType.type}
                    onClick={() => addQuestion(questionType.type)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl text-left transition-all duration-300 group flex items-center space-x-3"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-10 h-10 ${questionType.color} rounded-xl flex items-center justify-center`}>
                      <div className="text-white">
                        {questionType.icon}
                      </div>
                    </div>
                    <span className="text-blue-200 group-hover:text-white transition-colors font-medium">
                      {questionType.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'builder' && (
                <motion.div 
                  key="builder"
                  className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
              {/* Form Header */}
              <div className="mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Form başlığı..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-blue-200"
                    />
                    {formData.tags.includes('AI-Generated') && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-full"
                      >
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-indigo-300">AI Destekli</span>
                      </motion.div>
                    )}
                  </div>
                  <textarea
                    placeholder="Form açıklaması..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-lg bg-transparent border-none outline-none text-blue-200 placeholder-blue-300 resize-none"
                    rows={2}
                  />
                  
                  <motion.button
                    onClick={() => setShowImageUpload(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Arkaplan Resmi</span>
                  </motion.button>
                </div>
              </div>

              {/* Questions Area */}
              <div className="min-h-[400px]">
                {formData.questions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-12 h-12 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">İlk sorunuzu ekleyin</h3>
                    <p className="text-blue-200 mb-6">Sol taraftaki soru türlerinden birini seçerek başlayın</p>
                    
                    {/* AI Soru Önerisi Butonu */}
                    <motion.button
                      onClick={handleAIQuestionSuggestions}
                      disabled={isLoadingAI || !formData.title.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoadingAI ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          </motion.div>
                          <span>AI Önerileri Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>AI'dan Soru Öner</span>
                        </>
                      )}
                    </motion.button>
                    
                    {!formData.title.trim() && (
                      <p className="text-yellow-300 text-sm mt-3">
                        AI soru önerisi için önce form başlığını girin
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="w-5 h-5 text-blue-300 cursor-move" />
                            <span className="text-sm text-blue-300 font-medium">Soru {index + 1}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={() => duplicateQuestion(question.id)}
                              className="p-2 hover:bg-white/10 rounded-xl text-blue-300 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => deleteQuestion(question.id)}
                              className="p-2 hover:bg-white/10 rounded-xl text-red-300 hover:text-red-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <input
                            type="text"
                            value={question.title}
                            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                            className="flex-1 text-lg font-semibold bg-transparent border-none outline-none text-white"
                            placeholder="Yeni Soru"
                          />
                          {question.title.trim() && (
                            <motion.button
                              onClick={() => handleSentimentAnalyze(question.title)}
                              disabled={isSentimentAnalyzing}
                              className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Sentiment Analizi"
                            >
                              {isSentimentAnalyzing ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <span className="text-sm">💭</span>
                              )}
                            </motion.button>
                          )}
                        </div>
                        
                                                 {question.type === 'radio' || question.type === 'checkbox' || question.type === 'select' ? (
                           <div className="space-y-2">
                             {question.options?.map((option, optionIndex) => (
                               <div key={optionIndex} className="flex items-center space-x-3">
                                 <input
                                   type="text"
                                   value={option}
                                   onChange={(e) => {
                                     const newOptions = [...(question.options || [])];
                                     newOptions[optionIndex] = e.target.value;
                                     updateQuestion(question.id, { options: newOptions });
                                   }}
                                   className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                   placeholder={`Seçenek ${optionIndex + 1}`}
                                 />
                                 <motion.button
                                   onClick={() => {
                                     const newOptions = question.options?.filter((_, i) => i !== optionIndex);
                                     updateQuestion(question.id, { options: newOptions });
                                   }}
                                   className="p-1 hover:bg-white/10 rounded-lg text-red-300 hover:text-red-200 transition-colors"
                                   whileHover={{ scale: 1.1 }}
                                   whileTap={{ scale: 0.9 }}
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </motion.button>
                               </div>
                             ))}
                             <motion.button
                               onClick={() => {
                                 const newOptions = [...(question.options || []), ''];
                                 updateQuestion(question.id, { options: newOptions });
                               }}
                               className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-300 hover:text-white rounded-lg transition-all duration-300 flex items-center space-x-2"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                             >
                               <Plus className="w-4 h-4" />
                               <span>Seçenek Ekle</span>
                             </motion.button>
                           </div>
                         ) : question.type === 'rating' ? (
                           <div className="space-y-3">
                             {/* Icon selector */}
                             <div className="flex items-center space-x-2">
                               <span className="text-sm text-blue-200">Sembol:</span>
                               <div className="flex items-center space-x-2">
                                 <button
                                   type="button"
                                   onClick={() => updateQuestion(question.id, { ratingIcon: 'star' })}
                                   className={`px-3 py-1 rounded-lg border ${question.ratingIcon === 'star' ? 'bg-white/20 border-white/30 text-yellow-300' : 'bg-white/5 border-white/20 text-blue-200'}`}
                                 >
                                   ★
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => updateQuestion(question.id, { ratingIcon: 'heart' })}
                                   className={`px-3 py-1 rounded-lg border ${question.ratingIcon === 'heart' ? 'bg-white/20 border-white/30 text-rose-400' : 'bg-white/5 border-white/20 text-blue-200'}`}
                                 >
                                   ❤
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => updateQuestion(question.id, { ratingIcon: 'thumb' })}
                                   className={`px-3 py-1 rounded-lg border ${question.ratingIcon === 'thumb' ? 'bg-white/20 border-white/30 text-amber-400' : 'bg-white/5 border-white/20 text-blue-200'}`}
                                 >
                                   👍
                                 </button>
                               </div>
                             </div>

                             {/* Stars/hearts/thumbs */}
                             <div className="flex items-center space-x-4 select-none">
                               {Array.from({ length: question.maxRating || 5 }).map((_, i) => {
                                 const idx = i + 1;
                                 const isActive = (question.ratingValue || 0) >= idx;
                                 const base = 'text-2xl transition-colors';
                                 let char = '★';
                                 let activeColor = 'text-yellow-400';
                                 if (question.ratingIcon === 'heart') {
                                   char = '❤';
                                   activeColor = 'text-rose-400';
                                 } else if (question.ratingIcon === 'thumb') {
                                   char = '';
                                   activeColor = 'text-blue-400';
                                 }
                                 const display = question.ratingIcon === 'star' ? (isActive ? '★' : '☆') : char;
                                 return (
                                   <button
                                     type="button"
                                     key={idx}
                                     onClick={() => {
                                       const current = question.ratingValue || 0;
                                       const newValue = current === idx ? Math.max(0, idx - 1) : idx;
                                       updateQuestion(question.id, { ratingValue: newValue });
                                     }}
                                     className="focus:outline-none"
                                     aria-label={`Derece ${idx}`}
                                   >
                                     {question.ratingIcon === 'thumb' ? (
                                       <ThumbsUp className={`w-6 h-6 ${isActive ? 'text-amber-400' : 'text-blue-300'}`} />
                                     ) : (
                                       <span className={`${base} ${isActive ? activeColor : 'text-blue-300'}`}>{display}</span>
                                     )}
                                   </button>
                                 );
                               })}
                             </div>
                             <div className="text-sm text-blue-300">Seçilen: {question.ratingValue || 0}/{question.maxRating || 5}</div>
                           </div>
                         ) : question.type === 'date' ? (
                           <div className="space-y-2">
                             <div className="text-sm text-blue-200">Tarih Şablonu</div>
                            <input
                              type="text"
                              placeholder="gg.aa.yyyy"
                              onFocus={(e) => {
                                e.currentTarget.type = 'date';
                                // Chrome/Edge destekliyorsa picker'ı aç
                                // @ts-ignore
                                if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                              }}
                              onBlur={(e) => {
                                if (!e.currentTarget.value) {
                                  e.currentTarget.type = 'text';
                                }
                              }}
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                             <div className="text-sm text-blue-300">Format: YYYY-MM-DD</div>
                           </div>
                          ) : (
                            <input
                              type="text"
                              value={question.placeholder || ''}
                              onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              placeholder="Placeholder metni..."
                            />
                          )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                              className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                            />
                            <span className="text-sm text-blue-200">Zorunlu</span>
                          </label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div 
                  key="preview"
                  className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Form Önizleme</h2>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">{formData.title || 'Form Başlığı'}</h3>
                    <p className="text-blue-200 mb-6">{formData.description || 'Form açıklaması'}</p>
                    
                    {formData.questions.length === 0 ? (
                      <p className="text-blue-300 text-center py-8">Henüz soru eklenmemiş</p>
                    ) : (
                      <div className="space-y-6">
                        {formData.questions.map((question, index) => (
                          <div key={question.id} className="bg-white/10 rounded-xl p-4">
                            <h4 className="text-white font-medium mb-3">
                              {question.title} {question.required && <span className="text-red-400">*</span>}
                            </h4>
                            
                            {question.type === 'text' && (
                              <input
                                type="text"
                                placeholder={question.placeholder || 'Yanıtınızı yazın...'}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200"
                                disabled
                              />
                            )}
                            
                            {question.type === 'textarea' && (
                              <textarea
                                placeholder={question.placeholder || 'Yanıtınızı yazın...'}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200"
                                rows={3}
                                disabled
                              />
                            )}
                            
                                                         {(question.type === 'radio' || question.type === 'checkbox') && (
                               <div className="space-y-2">
                                 {question.options?.map((option, optionIndex) => (
                                   <label key={optionIndex} className="flex items-center space-x-2">
                                     <input
                                       type={question.type}
                                       disabled
                                       className="text-blue-500 bg-white/10 border-white/20"
                                     />
                                     <span className="text-blue-200">{option}</span>
                                   </label>
                                 ))}
                               </div>
                             )}
                             
                             {question.type === 'rating' && (
                               <div className="space-y-2">
                                 <div className="flex items-center space-x-2">
                                   {question.options?.map((option, optionIndex) => (
                                     <label key={optionIndex} className="flex items-center space-x-2">
                                       <input
                                         type="radio"
                                         disabled
                                         className="text-blue-500 bg-white/10 border-white/20"
                                       />
                                       <span className="text-blue-200 text-sm">{option}</span>
                                     </label>
                                   ))}
                                 </div>
                               </div>
                             )}
                            
                            {question.type === 'select' && (
                              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" disabled>
                                <option>Seçenek seçin...</option>
                                {question.options?.map((option, optionIndex) => (
                                  <option key={optionIndex} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                            {question.type === 'date' && (
                              <div>
                                <input type="date" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" disabled />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Form Ayarları</h2>
                  
                  <div className="space-y-6">
                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        <option value="Genel">Genel</option>
                        <option value="Ürün">Ürün</option>
                        <option value="Müşteri">Müşteri</option>
                        <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Pazarlama">Pazarlama</option>
                        <option value="Teknoloji">Teknoloji</option>
                      </select>
                    </div>

                    {/* Durum */}
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Durum</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'draft' | 'archived' }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        <option value="draft">Taslak</option>
                        <option value="active">Aktif</option>
                        <option value="archived">Arşivlenmiş</option>
                      </select>
                    </div>

                    {/* Etiketler */}
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Etiketler</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-2">
                            <span>{tag}</span>
                            <button
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                tags: prev.tags.filter((_, i) => i !== index) 
                              }))}
                              className="text-blue-400 hover:text-blue-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Yeni etiket ekle..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              setFormData(prev => ({ 
                                ...prev, 
                                tags: [...prev.tags, e.currentTarget.value.trim()] 
                              }));
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value.trim()) {
                              setFormData(prev => ({ 
                                ...prev, 
                                tags: [...prev.tags, input.value.trim()] 
                              }));
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Form Ayarları */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Form Ayarları</h3>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.settings.allowAnonymous}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            settings: { ...prev.settings, allowAnonymous: e.target.checked } 
                          }))}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                        />
                        <span className="text-blue-200">Anonim yanıtlara izin ver</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.settings.showProgressBar}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            settings: { ...prev.settings, showProgressBar: e.target.checked } 
                          }))}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                        />
                        <span className="text-blue-200">İlerleme çubuğunu göster</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.settings.allowMultipleResponses}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            settings: { ...prev.settings, allowMultipleResponses: e.target.checked } 
                          }))}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                        />
                        <span className="text-blue-200">Çoklu yanıtlara izin ver</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* AI Soru Önerileri Modal */}
      <AnimatePresence>
        {showAIQuestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Soru Önerileri</h3>
                  </div>
                  <button
                    onClick={() => setShowAIQuestions(false)}
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
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Soru Önerisi Hatası</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{aiError}</p>
                    <button
                      onClick={handleAIQuestionSuggestions}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : aiQuestionSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        AI tarafından önerilen sorular
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Beğendiğiniz soruları formunuza ekleyin
                      </p>
                    </div>
                    
                    <div className="grid gap-4">
                      {aiQuestionSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded">
                                  {suggestion.type === 'multiple_choice' ? 'Çoktan Seçmeli' :
                                   suggestion.type === 'text' ? 'Metin' :
                                   suggestion.type === 'rating' ? 'Derecelendirme' :
                                   suggestion.type === 'yes_no' ? 'Evet/Hayır' :
                                   suggestion.type === 'dropdown' ? 'Açılır Liste' : 'Metin'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Güven: {suggestion.confidence}%
                                </span>
                              </div>
                              
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                {suggestion.question}
                              </h5>
                              
                              {suggestion.options && suggestion.options.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seçenekler:</p>
                                  <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4">
                                    {suggestion.options.map((option, i) => (
                                      <li key={i} className="list-disc">{option}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Gerekçe:</strong> {suggestion.reasoning}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => addAIQuestion(suggestion)}
                              className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Ekle
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Soru önerileri hazırlanıyor</h4>
                    <p className="text-gray-600 dark:text-gray-400">AI size en uygun soruları hazırlıyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sentiment Analizi Modal */}
      <AnimatePresence>
        {sentimentModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💭</span>
                    <h3 className="text-xl font-bold">Sentiment Analizi</h3>
                  </div>
                  <button
                    onClick={() => setSentimentModal({ show: false })}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {sentimentModal.result ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analiz Edilen Metin</h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        "{sentimentModal.text}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Sentiment</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            sentimentModal.result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            sentimentModal.result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sentimentModal.result.sentiment === 'positive' ? '😊 Pozitif' :
                             sentimentModal.result.sentiment === 'negative' ? '😞 Negatif' :
                             '😐 Nötr'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Güven Skoru</h5>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${sentimentModal.result.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {sentimentModal.result.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {sentimentModal.result.emotions && Object.keys(sentimentModal.result.emotions).length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Duygu Analizi</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(sentimentModal.result.emotions).map(([emotion, score]: [string, any]) => (
                            <div key={emotion} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{emotion}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {(score * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">💡 Öneri</h5>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {sentimentModal.result.sentiment === 'negative' 
                          ? 'Bu soru olumsuz bir ton içeriyor. Daha olumlu ve teşvik edici bir dil kullanmayı deneyebilirsiniz.'
                          : sentimentModal.result.sentiment === 'positive'
                          ? 'Bu soru olumlu bir ton taşıyor. Katılımcılar için motive edici olacaktır.'
                          : 'Bu soru nötr bir ton taşıyor. İhtiyaca göre daha samimi veya profesyonel hale getirebilirsiniz.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💭</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Sentiment analizi yapılıyor...</p>
                  </div>
                )}
              </div>
            </motion.div>
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
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Arkaplan Resmi Yükle</h3>
              <div className="border-2 border-dashed border-blue-400/50 rounded-2xl p-8 text-center">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-200 mb-6">Resim dosyasını buraya sürükleyin veya seçin</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, backgroundImage: URL.createObjectURL(file) }));
                      setShowImageUpload(false);
                    }
                  }}
                  className="hidden"
                  id="form-image-upload"
                />
                <label
                  htmlFor="form-image-upload"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Resim Seç</span>
                </label>
              </div>
              <div className="flex justify-end mt-6">
                <motion.button
                  onClick={() => setShowImageUpload(false)}
                  className="px-6 py-3 text-blue-300 hover:text-white transition-colors"
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
    </div>
  );
};

export default FormBuilder;


