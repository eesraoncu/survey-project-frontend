import { apiClient } from './api';

export interface QuestionType {
  id: number;
  questionTypeName: string;
  questionTypeCode: string;
  requiresChoices: boolean;
  allowsMultipleSelection: boolean;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateQuestionTypeRequest {
  questionTypeName: string;
  questionTypeCode: string;
  requiresChoices: boolean;
  allowsMultipleSelection: boolean;
  description?: string;
  displayOrder?: number;
}

export const questionTypeService = {
  // Aktif soru tiplerini getir
  async getActiveQuestionTypes(): Promise<QuestionType[]> {
    try {
      console.log('[questionTypeService.getActiveQuestionTypes] -> GET /QuestionType/active');
      const response = await apiClient.get<QuestionType[]>('/QuestionType/active');
      console.log('[questionTypeService.getActiveQuestionTypes] <- Başarılı, count:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[questionTypeService.getActiveQuestionTypes] <- Hata:', error);
      throw new Error(error.response?.data?.message || 'Soru tipleri yüklenirken hata oluştu');
    }
  },

  // Tek soru tipi detayı getir
  async getQuestionTypeById(id: number): Promise<QuestionType> {
    try {
      console.log(`[questionTypeService.getQuestionTypeById] -> GET /QuestionType/${id}`);
      const response = await apiClient.get<QuestionType>(`/QuestionType/${id}`);
      console.log('[questionTypeService.getQuestionTypeById] <- Başarılı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[questionTypeService.getQuestionTypeById] <- Hata:', error);
      throw new Error(error.response?.data?.message || 'Soru tipi detayı yüklenirken hata oluştu');
    }
  },

  // Yeni soru tipi oluştur
  async createQuestionType(data: CreateQuestionTypeRequest): Promise<QuestionType> {
    try {
      console.log('[questionTypeService.createQuestionType] -> POST /QuestionType', data);
      const response = await apiClient.post<QuestionType>('/QuestionType', data);
      console.log('[questionTypeService.createQuestionType] <- Başarılı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[questionTypeService.createQuestionType] <- Hata:', error);
      throw new Error(error.response?.data?.message || 'Soru tipi oluşturulurken hata oluştu');
    }
  },

  // Frontend'den backend'e tip dönüşümü
  getQuestionTypeIdByCode(questionTypes: QuestionType[], code: string): number | null {
    const questionType = questionTypes.find(qt => qt.questionTypeCode === code);
    return questionType ? questionType.id : null;
  },

  // Frontend tip kodlarından backend ID'sine mapping
  mapFrontendTypeToId(questionTypes: QuestionType[], frontendType: string): number | null {
    const mapping: { [key: string]: string } = {
      'text': 'short_text',
      'textarea': 'paragraph', 
      'radio': 'multiple_choice',
      'checkbox': 'multi_select',
      'select': 'dropdown',
      'rating': 'rating',
      'date': 'date',
      'location': 'location', 
      'phone': 'phone',
      'email': 'email',
      'name': 'full_name'
    };

    const backendCode = mapping[frontendType];
    if (!backendCode) {
      console.warn(`Frontend tip '${frontendType}' için backend mapping bulunamadı`);
      return null;
    }

    return this.getQuestionTypeIdByCode(questionTypes, backendCode);
  }
};

// Question Type ID Constant'ları (Backend'deki ID'ler)
export const QUESTION_TYPE_IDS = {
  SHORT_TEXT: 1,      // Kısa Yanıt
  PARAGRAPH: 2,       // Paragraf
  MULTIPLE_CHOICE: 3, // Çoktan Seçmeli
  MULTI_SELECT: 4,    // Çoklu Seçim
  DROPDOWN: 5         // Açılır Liste
} as const;

// Dinamik question type mapping - Backend'den gelen aktif question type'ları kullanır
export const getQuestionTypeIdByFrontendType = async (type: string): Promise<number> => {
  try {
    // Aktif question type'ları getir
    const questionTypes = await questionTypeService.getActiveQuestionTypes();
    
    // Frontend tipinden backend code'una mapping
    const typeMap: { [key: string]: string } = {
      'text': 'short_text',
      'textarea': 'paragraph', 
      'radio': 'multiple_choice',
      'checkbox': 'multi_select',
      'select': 'dropdown',
      // Diğer tipler fallback olarak short_text kullanır
      'rating': 'short_text',
      'date': 'short_text',
      'location': 'short_text', 
      'phone': 'short_text',
      'email': 'short_text',
      'name': 'short_text'
    };

    const backendCode = typeMap[type] || 'short_text';
    const questionType = questionTypes.find(qt => qt.questionTypeCode === backendCode);
    
    if (!questionType) {
      console.warn(`Question type code '${backendCode}' not found in backend, using fallback`);
      // Fallback: İlk aktif question type'ı kullan
      return questionTypes[0]?.id || 1;
    }
    
    console.log(`📋 Question Type Mapping: ${type} → ${backendCode} → ID: ${questionType.id}`);
    return questionType.id;
    
  } catch (error) {
    console.error('Question type mapping failed:', error);
    // Hata durumunda fallback ID
    return 1;
  }
};

// Synchronous fallback for quick access (sadece sabit ID'ler için)
export const getQuestionTypeIdByFrontendTypeSync = (type: string): number => {
  const typeMap: { [key: string]: number } = {
    // Backend'deki gerçek ID'ler (migration'dan gelen)
    'text': 1,        // ID: 1 → "Kısa Yanıt" (short_text)
    'textarea': 2,    // ID: 2 → "Paragraf" (paragraph)  
    'radio': 3,       // ID: 3 → "Çoktan Seçmeli" (multiple_choice)
    'checkbox': 4,    // ID: 4 → "Çoklu Seçim" (multi_select)
    'select': 5,      // ID: 5 → "Açılır Liste" (dropdown)
    
    // Yeni tipler için fallback - backend'de henüz yoksa text olarak gönder
    'rating': 1,      // Fallback: Kısa Yanıt
    'date': 1,        // Fallback: Kısa Yanıt
    'location': 1,    // Fallback: Kısa Yanıt
    'phone': 1,       // Fallback: Kısa Yanıt
    'email': 1,       // Fallback: Kısa Yanıt
    'name': 1         // Fallback: Kısa Yanıt
  };
  
  const questionTypeId = typeMap[type];
  if (!questionTypeId) {
    console.warn(`Unsupported question type: ${type}, using fallback`);
    return 1; // Fallback: Kısa Yanıt
  }
  
  console.log(`📋 Question Type Mapping (Sync): ${type} → ID: ${questionTypeId}`);
  return questionTypeId;
};
