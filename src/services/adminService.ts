import { apiClient } from './api';

export interface ActivityLog {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  resourceId: number;
  resourceType: string;
  additionalData: Record<string, string>;
  createdAt: string;
  isSuccessful: boolean;
  errorMessage: string;
  userName: string;
  userEmail: string;
}

export interface ActivityLogResponse {
  activities: ActivityLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const adminService = {
  // Tüm aktivite loglarını getir
  async getActivityLogs(page: number = 1, pageSize: number = 20): Promise<ActivityLogResponse> {
    try {
      const response = await apiClient.get<ActivityLogResponse>('/ActivityLog', {
        params: { page, pageSize }
      });
      console.log('🔍 [ADMIN SERVICE] Raw API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Activity logs fetch error:', error);
      throw new Error(error.response?.data?.message || 'Aktivite logları yüklenirken bir hata oluştu');
    }
  },

  // Belirli bir kullanıcının loglarını getir
  async getUserLogs(userId: number): Promise<ActivityLogResponse> {
    try {
      const response = await apiClient.get<ActivityLogResponse>(`/ActivityLog/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('User logs fetch error:', error);
      throw new Error(error.response?.data?.message || 'Kullanıcı logları yüklenirken bir hata oluştu');
    }
  },

  // Belirli bir aktivite türüne göre logları getir
  async getLogsByType(activityType: string): Promise<ActivityLogResponse> {
    try {
      const response = await apiClient.get<ActivityLogResponse>(`/ActivityLog/type/${activityType}`);
      return response.data;
    } catch (error: any) {
      console.error('Activity type logs fetch error:', error);
      throw new Error(error.response?.data?.message || 'Aktivite türü logları yüklenirken bir hata oluştu');
    }
  },

  // Tarih aralığına göre logları getir
  async getLogsByDateRange(startDate: string, endDate: string): Promise<ActivityLogResponse> {
    try {
      const response = await apiClient.get<ActivityLogResponse>('/ActivityLog/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error('Date range logs fetch error:', error);
      throw new Error(error.response?.data?.message || 'Tarih aralığı logları yüklenirken bir hata oluştu');
    }
  },

  // Log sayısını getir
  async getLogCount(): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number; message?: string }>('/ActivityLog/count');
      return response.data;
    } catch (error: any) {
      console.error('Log count fetch error:', error);
      throw new Error(error.response?.data?.message || 'Log sayısı alınırken bir hata oluştu');
    }
  },

  // Belirli bir logu sil
  async deleteLog(logId: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🗑️ [ADMIN SERVICE] Log silme isteği gönderiliyor:', logId);
      const response = await apiClient.delete<{ success: boolean; message?: string }>(`/ActivityLog/${logId}`);
      console.log('🗑️ [ADMIN SERVICE] Log silme başarılı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🗑️ [ADMIN SERVICE] Log silme hatası:', error);
      console.error('🗑️ [ADMIN SERVICE] Error response:', error.response?.data);
      console.error('🗑️ [ADMIN SERVICE] Error status:', error.response?.status);
      
      // 404 hatası için özel kontrol
      if (error.response?.status === 404) {
        throw new Error(`Log ID: ${logId} bulunamadı. Bu log zaten silinmiş olabilir.`);
      }
      
      throw new Error(error.response?.data?.message || 'Log silinirken bir hata oluştu');
    }
  }
};

export default adminService;


