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
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Star,
  ChevronDown,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Lock,
  Globe
} from 'lucide-react';
import { surveyService, type FormData as SurveyFormData } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import { questionService, type UpsertQuestionRequest } from '../services/questionService';
import { getQuestionTypeIdByFrontendType } from '../services/questionTypeService';
import { ThumbsUp } from 'lucide-react';

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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [showAccessManager, setShowAccessManager] = useState(false);
  const [editorVisibility, setEditorVisibility] = useState<'restricted' | 'anyone'>('restricted');
  const [participantVisibility, setParticipantVisibility] = useState<'link' | 'signedin'>('link');
  const [copyInfo, setCopyInfo] = useState<string | null>(null);
  


  // Mevcut anketi yükle (surveyId varsa) ve AI/Template verilerini yükle
  useEffect(() => {
    console.log('🔍 FormBuilder başladı, veriler kontrol ediliyor...');
    const params = new URLSearchParams(window.location.search);
    const existingSurveyId = params.get('surveyId');

    const loadExisting = async (surveyId: string) => {
      try {
        console.log('🗂️ Mevcut anket yükleniyor:', surveyId);
        const survey = await surveyService.getSurveyById(surveyId);
        // Soruları da çek
        const questions = await questionService.getBySurveyId(surveyId);
        const mappedQuestions: Question[] = (questions || []).map((q, idx) => ({
          id: String(q.id ?? idx),
          type: (q.questionType as any) || 'text',
          title: q.questionsText || 'Soru',
          required: false,
          options: Array.isArray(q.choices) ? q.choices : [],
          placeholder: '',
          description: ''
        }));

        setFormData({
          title: survey.surveyName || '',
          description: survey.surveyDescription || '',
          backgroundImage: survey.backgroundImage || '',
          questions: mappedQuestions,
          settings: survey.settings || {
            allowAnonymous: true,
            showProgressBar: true,
            allowMultipleResponses: false,
            theme: 'light'
          },
          status: survey.status || 'draft',
          category: survey.category || 'Genel',
          tags: survey.tags || []
        });

        setSaveMessage({ type: 'success', message: `Anket yüklendi (${mappedQuestions.length} soru).` });
        setTimeout(() => setSaveMessage(null), 3000);
        return true;
      } catch (e) {
        console.error('❌ Mevcut anket yüklenemedi:', e);
        return false;
      }
    };
    
    // Eğer mevcut anket ID'si varsa önce onu yükle, yoksa template/AI verilerine bak
    if (existingSurveyId) {
      void loadExisting(existingSurveyId);
      return;
    }

    // Template verilerini kontrol et (Home.tsx'den gelen şablonlar)
    const templateData = localStorage.getItem('templateFormData');
    console.log('🔍 Template verisi raw data:', templateData);
    
    if (templateData) {
      try {
        const template = JSON.parse(templateData);
        console.log('📊 Template parse edildi:', template);
        
        // Template verilerini FormBuilder formatına dönüştür
        const templateQuestions: Question[] = template.questions?.map((q: any) => ({
          id: q.id || Date.now().toString(),
          type: q.type,
          title: q.title,
          required: q.required || false,
          options: q.options || [],
          placeholder: q.placeholder || '',
          description: q.description || ''
        })) || [];

        console.log('🔄 Template soruları dönüştürüldü:', templateQuestions);

        setFormData({
          title: template.title || 'Şablon Formu',
          description: template.description || '',
          backgroundImage: '',
          questions: templateQuestions,
          settings: {
            allowAnonymous: true,
            showProgressBar: true,
            allowMultipleResponses: false,
            theme: 'light'
          },
          status: 'draft',
          category: template.category || 'Genel',
          tags: ['Şablon']
        });

        console.log('💾 FormData güncellendi (Template), soru sayısı:', templateQuestions.length);

        // Başarı mesajı göster
        setSaveMessage({ 
          type: 'success', 
          message: `${template.title} şablonu ${templateQuestions.length} soru ile yüklendi!` 
        });

        // localStorage'dan sil
        localStorage.removeItem('templateFormData');
        
        // 5 saniye sonra mesajı kaldır
        setTimeout(() => setSaveMessage(null), 5000);
        
        return; // Template yüklendiyse AI verilerine bakma
        
      } catch (error) {
        console.error('❌ Template parse hatası:', error);
      }
    }
    
    // AI verilerini kontrol et (AI oluşturucudan gelen)
    const aiGeneratedData = localStorage.getItem('aiGeneratedSurvey') || localStorage.getItem('aiGeneratedForm');
    console.log('🔍 AI verisi raw data:', aiGeneratedData);
    
    if (aiGeneratedData) {
      try {
        const aiSurvey = JSON.parse(aiGeneratedData);
        console.log('📊 AI anket parse edildi:', aiSurvey);
        
        // AI verilerini FormBuilder formatına dönüştür
        const aiQuestions: Question[] = aiSurvey.questions?.map((q: any, index: number) => ({
          id: `ai-question-${index}`,
          type: mapAIQuestionType(q.type),
          title: q.title || q.question || '',
          required: q.required || false,
          options: q.options || [],
          placeholder: q.placeholder || '',
          description: q.description || ''
        })) || [];

        console.log('🔄 AI soruları dönüştürüldü:', aiQuestions);

        setFormData({
          title: aiSurvey.title || 'AI ile Oluşturulan Anket',
          description: aiSurvey.description || '',
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
        localStorage.removeItem('aiGeneratedForm');
        
        // 5 saniye sonra mesajı kaldır
        setTimeout(() => setSaveMessage(null), 5000);
        
      } catch (error) {
        console.error('💥 AI verisi parse edilemedi:', error);
        setSaveMessage({ 
          type: 'error', 
          message: 'AI verisi yüklenirken hata oluştu.' 
        });
        localStorage.removeItem('aiGeneratedForm');
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



  // Soru türleri - backend entegrasyonlu ama UI'da her zaman görünür (11 tip)
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

      // 1) Anketi kaydet veya güncelle (surveyId varsa güncelle)
      const params = new URLSearchParams(window.location.search);
      const existingSurveyId = params.get('surveyId');
      const savedSurvey = existingSurveyId
        ? await surveyService.updateSurvey(existingSurveyId, surveyData).catch(async () => {
            // Eğer backend update endpoint'i yoksa create'e düş
            return await surveyService.createSurvey(surveyData)
          })
        : await surveyService.createSurvey(surveyData);
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
      const rawSurveyId: any = existingSurveyId ?? (savedSurvey as any)?.id ?? (savedSurvey as any)?.surveyId ?? (savedSurvey as any)?._id;
      if (!rawSurveyId && formData.questions.length > 0) {
        throw new Error('Anket ID alınamadı, sorular kaydedilemedi.');
      }
      const surveyId: number | string = typeof rawSurveyId === 'string' && /^\d+$/.test(rawSurveyId)
        ? Number(rawSurveyId)
        : rawSurveyId;
      console.log('➡️ Sorular için kullanılacak surveyId:', surveyId);

      // 3) Soruları Questions API'ına yaz
      if (formData.questions.length > 0) {
        console.log('🔄 Question type mapping başlatılıyor...');
        
        // Tüm soruların question type ID'lerini async olarak al
        const payloads: UpsertQuestionRequest[] = await Promise.all(
          formData.questions.map(async (q, index) => {
            const titleTrim = (q.title || '').trim()
            const placeholderTrim = (q.placeholder || '').trim()
            const questionsText = titleTrim ? titleTrim : (placeholderTrim || 'Yeni Soru')
            
            // Frontend tipinden backend question type ID'sini async olarak al
            let questionTypeId: number;
            try {
              questionTypeId = await getQuestionTypeIdByFrontendType(q.type);
            } catch (error) {
              console.warn(`❌ Async mapping failed for ${q.type}, defaulting to ID 1`);
              questionTypeId = 1;
            }
            
            console.log(`🔍 Soru ${index + 1}: "${questionsText}" - Tip: ${q.type} → ID: ${questionTypeId}`);
            
            return {
              questionsText,
              questionType: q.type, // Geriye uyumlu
              questionTypeId, // YENİ: Backend'in beklediği ID
              choices: q.options || [],
              surveysId: surveyId,
              isRequired: q.required,
              order: index + 1
            }
          })
        );

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

  const handlePublishInternal = async (): Promise<string | null> => {
    try {
      // Kaydet ve aktif yap
      // 1) Anketi oluştur/güncelle
      const params = new URLSearchParams(window.location.search);
      const existingSurveyId = params.get('surveyId');

      // Kaydetme için mevcut handleSaveForm içindeki hazır veriyi tekrar oluşturalım
      if (!formData.title.trim() || formData.questions.length === 0) {
        alert('Yayınlamak için başlık ve en az bir soru gereklidir.');
        return null;
      }

      const surveyData: SurveyFormData = {
        surveyName: formData.title,
        surveyDescription: formData.description,
        surveyTypeId: 1,
        isActive: true,
        usersId: user?.id != null ? Number(user.id) : undefined,
        backgroundImage: formData.backgroundImage,
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
        status: 'active',
        category: formData.category,
        tags: formData.tags
      };

      let savedSurvey: any = null
      let createdNew = false
      if (existingSurveyId) {
        try {
          // Mevcut anketi güncellemeyi dene
          savedSurvey = await surveyService.updateSurvey(existingSurveyId, surveyData)
        } catch (err) {
          // Backend update endpoint'i yoksa: yeni oluştur
          createdNew = true
          savedSurvey = await surveyService.createSurvey(surveyData)
        }
      } else {
        createdNew = true
        savedSurvey = await surveyService.createSurvey(surveyData)
      }

      const rawSurveyId: any = existingSurveyId ?? (savedSurvey as any)?.id ?? (savedSurvey as any)?.surveyId ?? (savedSurvey as any)?._id;
      const surveyId: number | string = typeof rawSurveyId === 'string' && /^\d+$/.test(rawSurveyId) ? Number(rawSurveyId) : rawSurveyId;

      // Yeni oluşturulduysa soruları yaz (güncellemede kopya oluşmasını engeller)
      if (createdNew && formData.questions.length > 0) {
        const payloads: UpsertQuestionRequest[] = await Promise.all(
          formData.questions.map(async (q, index) => {
            const titleTrim = (q.title || '').trim();
            const placeholderTrim = (q.placeholder || '').trim();
            const questionsText = titleTrim ? titleTrim : (placeholderTrim || 'Yeni Soru');
            let questionTypeId = 1;
            try { questionTypeId = await getQuestionTypeIdByFrontendType(q.type); } catch {}
            return {
              questionsText,
              questionType: q.type,
              questionTypeId,
              choices: q.options || [],
              surveysId: surveyId,
              isRequired: q.required,
              order: index + 1
            };
          })
        );
        await Promise.all(payloads.map(p => questionService.create(p)));
      }

      const link = `${window.location.origin}/survey/${surveyId}`;
      return link;
    } catch (e) {
      console.error('Yayınlama hatası:', e);
      alert('Yayınlama sırasında hata oluştu.');
      return null;
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
                onClick={() => setShowPublishModal(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Yayınla
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
                        {formData.questions.map((question) => (
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

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full mx-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6">Formu yayınlayın</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-blue-200 mb-1">Katılımcılar</div>
                  <div className="text-white">Bağlantıya sahip olan herkes</div>
                </div>
                {publishedLink && (
                  <div className="bg-white/5 border border-white/20 rounded-xl p-3 text-blue-200 break-all flex items-center justify-between">
                    <span className="truncate mr-3">{publishedLink}</span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(publishedLink);
                          setCopyInfo('Kopyalandı');
                          setTimeout(() => setCopyInfo(null), 2000);
                        } catch {}
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                    >
                      {copyInfo || 'Kopyala'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => setShowPublishModal(false)}
                  className="px-5 py-2 text-blue-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Kapat
                </motion.button>
                <motion.button
                  onClick={async () => {
                    setPublishedLink(null);
                    setIsPublishing(true);
                    const link = await handlePublishInternal();
                    if (link) setPublishedLink(link);
                    setIsPublishing(false);
                  }}
                  disabled={isPublishing}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl disabled:opacity-50"
                  whileHover={{ scale: isPublishing ? 1 : 1.05 }}
                  whileTap={{ scale: isPublishing ? 1 : 0.95 }}
                >
                  {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Manager Modal */}
      <AnimatePresence>
        {showAccessManager && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full mx-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6">"{formData.title || 'Başlıksız form'}" adlı öğeyi paylaş</h3>

              {/* Editor visibility */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-blue-300" />
                    <div>
                      <div className="text-white font-medium">Düzenleyici görünümü</div>
                      <div className="text-blue-200 text-sm">Yalnızca erişimi olan kişiler bu bağlantıyı kullanarak açabilir</div>
                    </div>
                  </div>
                  <select
                    value={editorVisibility}
                    onChange={(e) => setEditorVisibility(e.target.value as 'restricted' | 'anyone')}
                    className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2"
                  >
                    <option value="restricted">Kısıtlanmış</option>
                    <option value="anyone">Herkes</option>
                  </select>
                </div>
              </div>

              {/* Participant visibility */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-green-300" />
                    <div>
                      <div className="text-white font-medium">Katılımcı görünümü</div>
                      <div className="text-blue-200 text-sm">Bu bağlantıya sahip her internet kullanıcısı yanıt verebilir</div>
                    </div>
                  </div>
                  <select
                    value={participantVisibility}
                    onChange={(e) => setParticipantVisibility(e.target.value as 'link' | 'signedin')}
                    className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2"
                  >
                    <option value="link">Bağlantıya sahip olan herkes</option>
                    <option value="signedin">Giriş yapan kullanıcılar</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={() => setShowAccessManager(false)}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bitti
                </motion.button>
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


