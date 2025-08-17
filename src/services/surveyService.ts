import { apiClient } from './api';

// Anket veri tipleri
export interface Survey {
  id: string; // MongoDB ObjectId string olarak gelir
  surveyName: string;
  surveyDescription: string;
  surveyTypeId: number;
  createdAt: string;
  isActive: boolean;
  // Frontend için ek alanlar (backend'den gelmeyebilir)
  responses?: number;
  lastModified?: string;
  status?: 'active' | 'draft' | 'archived';
  backgroundImage?: string;
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
  // Frontend için ek alanlar
  backgroundImage?: string;
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
      const response = await apiClient.post<FormData>('/Surveys/create', surveyData);
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
      const response = await apiClient.get<SurveyStats>(`/Survey/stats/${id}`);
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
