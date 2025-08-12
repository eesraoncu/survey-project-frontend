import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Move,
  Type,
  CheckSquare,
  Radio,
  List,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating' | 'date' | 'location' | 'phone' | 'email' | 'name';
  title: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
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
}

const FormBuilder: React.FC = () => {
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
    }
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'settings'>('builder');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  const questionTypes = [
    { type: 'text' as const, label: 'Kısa Metin', icon: <Type className="w-5 h-5" />, color: 'bg-blue-500' },
    { type: 'textarea' as const, label: 'Uzun Metin', icon: <List className="w-5 h-5" />, color: 'bg-green-500' },
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
      title: 'Yeni Soru',
      required: false,
      options: type === 'radio' || type === 'checkbox' || type === 'select' ? ['Seçenek 1', 'Seçenek 2'] : undefined,
      placeholder: type === 'text' || type === 'textarea' ? 'Lütfen yanıtınızı yazın...' : undefined
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
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
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const duplicateQuestion = (id: string) => {
    const question = formData.questions.find(q => q.id === id);
    if (question) {
      const newQuestion = { ...question, id: Date.now().toString() };
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        backgroundImage: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
    setShowImageUpload(false);
  };

  const renderQuestionEditor = (question: Question) => {
    return (
      <motion.div
        key={question.id}
        layout
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <GripVertical className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex items-center space-x-2">
              {questionTypes.find(qt => qt.type === question.type)?.icon}
              <span className="text-sm font-medium text-gray-600">
                {questionTypes.find(qt => qt.type === question.type)?.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => duplicateQuestion(question.id)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteQuestion(question.id)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            placeholder="Soru başlığı..."
            className="w-full text-lg font-medium border-none focus:ring-0 p-0 text-gray-900"
          />
          
          {question.description !== undefined && (
            <input
              type="text"
              value={question.description}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
              placeholder="Soru açıklaması (opsiyonel)..."
              className="w-full text-sm border-none focus:ring-0 p-0 text-gray-600"
            />
          )}

          {question.placeholder !== undefined && (
            <input
              type="text"
              value={question.placeholder}
              onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
              placeholder="Placeholder metni..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          )}

          {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), `Seçenek ${(question.options?.length || 0) + 1}`];
                  updateQuestion(question.id, { options: newOptions });
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                + Seçenek Ekle
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Zorunlu soru</span>
            </label>
          </div>
        </div>
      </motion.div>
    );
  };

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
                onClick={() => console.log('Saving form...')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-xl flex items-center space-x-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
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
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Form Header */}
              <div className="mb-8">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Form başlığı..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-blue-200"
                  />
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
                    <p className="text-blue-200">Sol taraftaki soru türlerinden birini seçerek başlayın</p>
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
                              onClick={() => console.log('Copy question')}
                              className="p-2 hover:bg-white/10 rounded-xl text-blue-300 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => console.log('Delete question')}
                              className="p-2 hover:bg-white/10 rounded-xl text-red-300 hover:text-red-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                          className="w-full text-lg font-semibold bg-transparent border-none outline-none text-white mb-3"
                          placeholder="Soru başlığı..."
                        />
                        
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
                                const newOptions = [...(question.options || []), `Seçenek ${(question.options?.length || 0) + 1}`];
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
          </div>
        </div>
      </main>

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


