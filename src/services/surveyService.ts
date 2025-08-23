import { apiClient } from './api';

// Anket veri tipleri
export interface Survey {
  id: string; // MongoDB ObjectId string olarak gelir
  surveyName: string;
  surveyDescription: string;
  surveyTypeId: number;
  createdAt: string;
  isActive: boolean;
  // Backend artık döndürüyor
  usersId?: number | string;
  // Frontend için ek alanlar (backend'den gelmeyebilir)
  responses?: number;
  lastModified?: string;
  status?: 'active' | 'draft' | 'archived';
  backgroundImage?: string;
  surveyBackgroundImage?: string; // Backend'den gelen alan
  questions?: number;
  views?: number;
  completionRate?: number;
  aiScore?: number;
  trendScore?: number;
  category?: string;
  tags?: string[];
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating' | 'date' | 'location' | 'phone' | 'email' | 'name';
  title: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface FormData {
  id?: string; // MongoDB ObjectId string olarak gelir
  surveyName: string;
  surveyDescription: string;
  surveyTypeId: number;
  isActive: boolean;
  // Sahiplik alanları (backend uyumluluğu için farklı adlar)
  usersId?: number | string;
  users_id?: number | string;
  
  // YENİ: Anket özellikleri (Backend'den gelen)
  allowsAnonymousResponses?: boolean;
  requiresLogin?: boolean;
  maxResponses?: number | null;
  expiresAt?: string | null;
  allowsEditing?: boolean;
  showsResults?: boolean;
  
  // YENİ: 6 özellik aktivasyonu
  enablesRating?: boolean;
  ratingScaleMax?: number;
  ratingScaleMin?: number;
  
  enablesDateFields?: boolean;
  dateFormat?: string;
  
  enablesLocation?: boolean;
  locationPrecision?: string;
  
  enablesPhone?: boolean;
  phoneFormat?: string;
  
  enablesEmail?: boolean;
  emailVerification?: boolean;
  
  enablesFullName?: boolean;
  nameFormat?: string;
  
  // Frontend için ek alanlar
  backgroundImage?: string;
  surveyBackgroundImage?: string; // Backend'den gelen alan
  questions?: Question[];
  settings?: {
    allowAnonymous: boolean;
    showProgressBar: boolean;
    allowMultipleResponses: boolean;
    theme: 'light' | 'dark' | 'custom';
  };
  status?: 'active' | 'draft' | 'archived';
  category?: string;
  tags?: string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  responses: {
    questionId: string;
    answer: string | string[];
  }[];
  submittedAt: string;
  submittedBy?: string;
}

export interface SurveyStats {
  totalResponses: number;
  completionRate: number;
  totalViews: number;
  averageTimeToComplete: number;
  questionStats: {
    questionId: string;
    questionTitle: string;
    responseCount: number;
    answers: {
      answer: string;
      count: number;
      percentage: number;
    }[];
  }[];
}

// Anket servisi
export const surveyService = {
  // Tüm anketleri getir
  async getAllSurveys(): Promise<Survey[]> {
    try {
      console.log('🔍 Anketler getiriliyor...');
      const response = await apiClient.get<Survey[]>('/Surveys/get-all');
      console.log('✅ Anketler başarıyla getirildi:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Anketler getirilirken hata:', error);
      console.error('📋 Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Anketler yüklenirken bir hata oluştu');
    }
  },

  // Esnek: Kullanıcıya göre anketleri getir (çeşitli backend yollarını dener)
  async getSurveysByUserFlexible(userId: number | string): Promise<Survey[]> {
    const id = String(userId)
    // Denenecek yol ve yöntemler
    const attempts: Array<() => Promise<Survey[]>> = [
      // 1) /Surveys/get-by-user/{id}
      async () => (await apiClient.get<Survey[]>(`/Surveys/get-by-user/${id}`)).data,
      // 2) /Surveys/by-user/{id}
      async () => (await apiClient.get<Survey[]>(`/Surveys/by-user/${id}`)).data,
      // 3) /Survey/get-by-user/{id}
      async () => (await apiClient.get<Survey[]>(`/Survey/get-by-user/${id}`)).data,
      // 4) /Survey/by-user/{id}
      async () => (await apiClient.get<Survey[]>(`/Survey/by-user/${id}`)).data,
      // 5) /Surveys/get-all?users_id=ID
      async () => (await apiClient.get<Survey[]>(`/Surveys/get-all`, { params: { users_id: id } })).data,
      // 6) /Surveys/get-all?usersId=ID
      async () => (await apiClient.get<Survey[]>(`/Surveys/get-all`, { params: { usersId: id } })).data,
      // 7) /Surveys/get-all?userId=ID
      async () => (await apiClient.get<Survey[]>(`/Surveys/get-all`, { params: { userId: id } })).data,
    ]


    for (let i = 0; i < attempts.length; i += 1) {
      try {
        console.log(`[surveyService.getSurveysByUserFlexible] Attempt ${i + 1}`)
        const data = await attempts[i]()
        if (Array.isArray(data)) {
          console.log('[surveyService.getSurveysByUserFlexible] Success count =', data.length)
          return data
        }
      } catch (err) {
        // bir sonraki denemeye geç
      }
    }

    console.warn('[surveyService.getSurveysByUserFlexible] All attempts failed; falling back to getAllSurveys + client-side filter')
    // Tamamen başarısızsa, tümünü çek ve client-side filtre uygula
    const all = await this.getAllSurveys()
    const filtered = all.filter((s: any) => {
      const owner = s.UsersId ?? s.users_id ?? s.usersId ?? s.userId ?? s.user_id ?? s.createdBy ?? s.ownerId ?? s.user?.id
      return owner ? String(owner) === id : false
    })
    return filtered
  },

  // Anket detayını getir
  async getSurveyById(id: string): Promise<FormData> {
    try {
      const response = await apiClient.get<FormData>(`/Surveys/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching survey:', error);
      throw new Error(error.response?.data?.message || 'Anket yüklenirken bir hata oluştu');
    }
  },

  // Yeni anket oluştur
  async createSurvey(surveyData: FormData): Promise<FormData> {
    try {
      console.log('📝 Anket oluşturuluyor...');
      console.log('📤 Gönderilen veri:', surveyData);
      const normalized = { ...surveyData } as any
      // Gereksiz alias'ı kaldır (users_id gönderme)
      delete normalized.users_id
      const response = await apiClient.post<FormData>('/Surveys', normalized);
      console.log('✅ Anket başarıyla oluşturuldu:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Anket oluşturulurken hata:', error);
      console.error('📋 Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Anket oluşturulurken bir hata oluştu');
    }
  },

  // Anket güncelle
  async updateSurvey(id: string, surveyData: FormData): Promise<FormData> {
    try {
      const response = await apiClient.put<FormData>(`/Surveys/${id}`, surveyData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating survey:', error);
      throw new Error(error.response?.data?.message || 'Anket güncellenirken bir hata oluştu');
    }
  },

  // Anket sil
  async deleteSurvey(id: string): Promise<void> {
    try {
      await apiClient.delete(`/Surveys/${id}`);
    } catch (error: any) {
      console.error('Error deleting survey:', error);
      throw new Error(error.response?.data?.message || 'Anket silinirken bir hata oluştu');
    }
  },

  // Anket yanıtını gönder
  async submitResponse(surveyId: string, responseData: Omit<SurveyResponse, 'id' | 'surveyId' | 'submittedAt'>): Promise<void> {
    try {
      await apiClient.post(`/Surveys/${surveyId}/complete`, responseData);
    } catch (error: any) {
      console.error('Error submitting response:', error);
      throw new Error(error.response?.data?.message || 'Yanıt gönderilirken bir hata oluştu');
    }
  },

  // Anket istatistiklerini getir
  async getSurveyStats(id: string): Promise<SurveyStats> {
    try {
      const response = await apiClient.get<SurveyStats>(`/Surveys/stats/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching survey stats:', error);
      throw new Error(error.response?.data?.message || 'Anket istatistikleri yüklenirken bir hata oluştu');
    }
  },

  // Kategoriye göre anketleri getir
  async getSurveysByCategory(category: string): Promise<Survey[]> {
    try {
      const response = await apiClient.get<Survey[]>(`/Survey/get-by-category/${category}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching surveys by category:', error);
      throw new Error(error.response?.data?.message || 'Kategori anketleri yüklenirken bir hata oluştu');
    }
  },

  // Duruma göre anketleri getir
  async getSurveysByStatus(status: 'active' | 'draft' | 'archived'): Promise<Survey[]> {
    try {
      const response = await apiClient.get<Survey[]>(`/Survey/get-by-status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching surveys by status:', error);
      throw new Error(error.response?.data?.message || 'Durum anketleri yüklenirken bir hata oluştu');
    }
  }
};

export default surveyService;
