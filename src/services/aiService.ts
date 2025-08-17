// AI Service - Backend AI endpoint'leri için servis
export interface AIGeneratedSurvey {
  id: string;
  title: string;
  description: string;
  questions: AIQuestion[];
  estimatedDuration: number;
  category: string;
}

export interface AIQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown';
  question: string;
  options?: string[];
  required: boolean;
  aiGenerated: true;
}

export interface AISurveyAnalysis {
  surveyId: string;
  overallScore: number;
  recommendations: AIRecommendation[];
  insights: AIInsight[];
  optimizationSuggestions: string[];
  expectedResponseRate: number;
}

export interface AIRecommendation {
  type: 'question' | 'flow' | 'targeting' | 'timing';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface AIInsight {
  category: string;
  insight: string;
  confidence: number;
  data?: any;
}

export interface AIQuestionSuggestion {
  question: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown';
  options?: string[];
  reasoning: string;
  confidence: number;
}

export interface AIQuestionContext {
  surveyTitle: string;
  surveyDescription: string;
  existingQuestions: string[];
  category: string;
}

class AIService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Backend soru tipini frontend tipine dönüştür
  private mapBackendQuestionType(backendType: string): 'multiple_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown' {
    console.log('🔍 Backend Question Type Mapping:', backendType);
    
    const typeMapping: { [key: string]: 'multiple_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown' } = {
      'multiple_choice': 'multiple_choice',
      'single_choice': 'multiple_choice',
      'rating': 'rating',
      'scale': 'rating',
      'text': 'text',
      'textarea': 'text',
      'yes_no': 'yes_no',
      'boolean': 'yes_no',
      'dropdown': 'dropdown',
      'select': 'dropdown',
      'checkbox': 'multiple_choice',
      'multiple_select': 'multiple_choice'
    };

    const mappedType = typeMapping[backendType?.toLowerCase()] || 'text';
    console.log(`✅ ${backendType} → ${mappedType}`);
    return mappedType;
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // AI ile tam anket oluşturma
  async generateCompleteSurvey(description: string): Promise<AIGeneratedSurvey> {
    console.log('🚀 generateCompleteSurvey - Request:', {
      url: '/api/AI/generate-complete-survey',
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: { description: description.trim(), language: 'tr' }
    });

    const response = await fetch('/api/AI/generate-complete-survey', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        description: description.trim(),
        language: 'tr' // Varsayılan dil
      })
    });

    console.log('📡 generateCompleteSurvey - Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ generateCompleteSurvey - Error Response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
      }
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Açıklama geçersiz. Lütfen daha detaylı bir açıklama girin.');
        } catch {
          throw new Error('Açıklama geçersiz. Lütfen daha detaylı bir açıklama girin.');
        }
      }
      if (response.status === 404) {
        throw new Error('AI anket oluşturma servisi bulunamadı. Backend kontrolü gerekli.');
      }
      if (response.status === 500) {
        throw new Error('AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
      }
      throw new Error(`API Hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ generateCompleteSurvey - Raw Backend Response:', data);
    
    // AI response'unda questions var ama id yok - direkt kullan
    if (data.questions && data.questions.length > 0) {
      console.log('🎯 AI Response\'unda questions mevcut, direkt kullanılıyor...');
      console.log('📊 Questions Count:', data.questions.length);
      console.log('📝 Questions:', data.questions);
    } else {
      console.log('⚠️ AI Response\'unda questions yok, survey detayını alınıyor...');
      
      if (data.id) {
        try {
          const surveyWithQuestions = await this.getSurveyWithQuestions(data.id);
          console.log('📋 Survey with Questions:', surveyWithQuestions);
          
          // Survey detayından questions'ları al
          data.questions = surveyWithQuestions.questions || [];
          console.log('🔄 Questions from Survey Detail:', data.questions);
        } catch (error) {
          console.error('❌ Survey detayı alınamadı:', error);
        }
      }
    }
    
    // Backend response'unu frontend formatına dönüştür
    const transformedData: AIGeneratedSurvey = {
      id: data.id || `ai-survey-${Date.now()}`,
      title: data.surveyName || data.survey_title || data.title || 'AI ile Oluşturulan Anket',
      description: data.surveyDescription || data.survey_description || data.description || '',
      questions: (data.questions || []).map((q: any, index: number) => ({
        id: q.id || `ai-question-${index}`,
        type: this.mapBackendQuestionType(q.questionType || q.question_type || q.type),
        question: q.questionsText || q.question_text || q.question || '',
        options: q.choices || q.options || [],
        required: q.required || false,
        aiGenerated: true
      })),
      estimatedDuration: data.estimatedDuration || data.estimated_duration || Math.max(2, Math.ceil((data.questions?.length || 0) * 0.5)),
      category: data.category || 'Genel'
    };
    
    console.log('🔄 generateCompleteSurvey - Transformed Response:', transformedData);
    console.log('📊 Final Questions Count:', transformedData.questions.length);
    console.log('📝 Final Questions:', transformedData.questions);
    return transformedData;
  }

  // Survey detayını questions ile birlikte al
  private async getSurveyWithQuestions(surveyId: string): Promise<any> {
    console.log('🔍 Survey detayı alınıyor:', surveyId);
    
    const response = await fetch(`/api/surveys/${surveyId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Survey detayı alınamadı: ${response.status}`);
    }

    const surveyData = await response.json();
    console.log('📋 Survey Data:', surveyData);
    console.log('❓ Questions Count:', surveyData.questions?.length || 0);
    
    return surveyData;
  }

  // Mevcut anket için AI analizi
  async analyzeSurvey(surveyId: string): Promise<AISurveyAnalysis> {
    const response = await fetch(`/api/AI/analyze-survey/${surveyId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
      }
      if (response.status === 404) {
        throw new Error('Anket bulunamadı.');
      }
      if (response.status === 500) {
        throw new Error('AI analiz servisi şu anda kullanılamıyor.');
      }
      throw new Error('Anket analizi yapılırken bir hata oluştu.');
    }

    const data = await response.json();
    return data;
  }

  // AI soru önerileri alma
  async generateQuestions(context: {
    surveyTitle?: string;
    surveyDescription?: string;
    existingQuestions?: string[];
    targetAudience?: string;
    category?: string;
  }): Promise<AIQuestionSuggestion[]> {
    const response = await fetch('/api/AI/generate-questions', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(context)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Geçersiz bağlam bilgisi.');
      }
      if (response.status === 500) {
        throw new Error('AI soru önerisi servisi şu anda kullanılamıyor.');
      }
      throw new Error('Soru önerileri alınırken bir hata oluştu.');
    }

    const data = await response.json();
    return data.suggestions || [];
  }

  // AI destekli anket optimizasyonu
  async optimizeSurvey(surveyId: string, optimizationType: 'response_rate' | 'completion_rate' | 'quality'): Promise<{
    optimizedQuestions: AIQuestion[];
    changes: string[];
    expectedImprovement: number;
  }> {
    const response = await fetch(`/api/AI/optimize-survey/${surveyId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        optimizationType
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      if (response.status === 404) {
        throw new Error('Anket bulunamadı.');
      }
      throw new Error('Anket optimizasyonu yapılırken bir hata oluştu.');
    }

    const data = await response.json();
    return data;
  }

  // Form validasyonu
  validateAIDescription(description: string): { isValid: boolean; message?: string } {
    const trimmed = description.trim();
    
    if (!trimmed) {
      return { isValid: false, message: 'Lütfen anket açıklaması girin.' };
    }
    
    if (trimmed.length < 10) {
      return { isValid: false, message: 'Açıklama en az 10 karakter olmalıdır.' };
    }
    
    if (trimmed.length > 500) {
      return { isValid: false, message: 'Açıklama en fazla 500 karakter olabilir.' };
    }
    
    return { isValid: true };
  }

  // AI insights alma (backend: GET /api/ai/insights/{surveyId})
  async getInsights(surveyId: string): Promise<AIInsight[]> {
    const response = await fetch(`/api/AI/insights/${surveyId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      if (response.status === 404) {
        throw new Error('Anket bulunamadı.');
      }
      throw new Error('AI insights alınırken bir hata oluştu.');
    }

    const data = await response.json();
    return data.insights || [];
  }

  // AI summary alma (backend: GET /api/ai/summary/{surveyId})
  async getSummary(surveyId: string): Promise<{
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  }> {
    const response = await fetch(`/api/AI/summary/${surveyId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      if (response.status === 404) {
        throw new Error('Anket bulunamadı.');
      }
      throw new Error('AI özeti alınırken bir hata oluştu.');
    }

    return await response.json();
  }

  // Sentiment analizi (backend: POST /api/ai/sentiment-analysis)
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: { [key: string]: number };
  }> {
    const response = await fetch('/api/AI/sentiment-analysis', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      throw new Error('Sentiment analizi yapılırken bir hata oluştu.');
    }

    return await response.json();
  }

  // Soru seçenekleri önerisi (backend: POST /api/ai/suggest-choices)
  async suggestChoices(question: string): Promise<string[]> {
    const response = await fetch('/api/AI/suggest-choices', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      throw new Error('Seçenek önerileri alınırken bir hata oluştu.');
    }

    const data = await response.json();
    return data.choices || [];
  }

  // Soru iyileştirme (backend: POST /api/ai/improve-question)
  async improveQuestion(question: string): Promise<{
    improved: string;
    suggestions: string[];
    reasoning: string;
  }> {
    const response = await fetch('/api/AI/improve-question', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      throw new Error('Soru iyileştirme yapılırken bir hata oluştu.');
    }

    return await response.json();
  }

  // Anahtar kelime çıkarma (backend: POST /api/ai/extract-keywords)
  async extractKeywords(text: string): Promise<{
    keywords: string[];
    categories: { [category: string]: string[] };
    confidence: number;
  }> {
    const response = await fetch('/api/AI/extract-keywords', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      throw new Error('Anahtar kelime çıkarma yapılırken bir hata oluştu.');
    }

    return await response.json();
  }

  // Metin çevirisi (backend: POST /api/ai/translate)
  async translateText(text: string, targetLanguage: string): Promise<{
    translated: string;
    sourceLanguage: string;
    confidence: number;
  }> {
    const response = await fetch('/api/AI/translate', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        text, 
        targetLanguage 
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      throw new Error('Çeviri yapılırken bir hata oluştu.');
    }

    return await response.json();
  }

  // AI raporu alma (backend: GET /api/ai/report/{surveyId})
  async getReport(surveyId: string): Promise<{
    overview: string;
    insights: AIInsight[];
    recommendations: AIRecommendation[];
    charts: any[];
    exportUrl?: string;
  }> {
    const response = await fetch(`/api/AI/report/${surveyId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama gerekli.');
      }
      if (response.status === 404) {
        throw new Error('Anket bulunamadı.');
      }
      throw new Error('AI raporu alınırken bir hata oluştu.');
    }

    return await response.json();
  }

  // Genel hata mesajlarını kullanıcı dostu hale getirme
  formatErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    // Network hatası
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    }
    
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

export const aiService = new AIService();
