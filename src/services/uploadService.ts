import { apiClient } from './api';

export interface UploadResponse {
  message: string;
  fileName: string;
  fileUrl: string;
  originalName: string;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Resim yükleme isteği gönderiliyor...');
    console.log('📁 Dosya adı:', file.name);
    console.log('📏 Dosya boyutu:', file.size, 'bytes');
    console.log('🔗 API URL:', '/upload/image');
    console.log('🔗 Tam URL:', `${apiClient.defaults.baseURL}/upload/image`);
    
    // FormData içeriğini kontrol et
    console.log('📦 FormData alanları:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    try {
      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Resim başarıyla yüklendi:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Resim yükleme hatası:', error);
      console.error('📋 Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Backend'den gelen hata mesajını detaylı göster
      if (error.response?.data) {
        console.error('🔍 Backend hata mesajı:', error.response.data);
        console.error('📝 Backend mesaj detayı:', error.response.data.message);
        
        // Validation errors'ı detaylı göster
        if (error.response.data.errors) {
          console.error('🚨 Validation hataları:', error.response.data.errors);
          Object.keys(error.response.data.errors).forEach(key => {
            console.error(`❌ ${key}:`, error.response.data.errors[key]);
          });
        }
      }
      
      if (error.response?.status === 404) {
        throw new Error('Upload endpoint bulunamadı. Backend\'de /api/upload/image endpoint\'i implement edilmeli.');
      } else if (error.response?.status === 413) {
        throw new Error('Dosya boyutu çok büyük. Maksimum 5MB olmalı.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz dosya formatı');
      } else {
        throw new Error(`Resim yüklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
      }
    }
  },

  async uploadBackgroundImage(file: File): Promise<string> {
    try {
      const result = await this.uploadImage(file);
      console.log('🔍 uploadBackgroundImage - Extracted fileUrl:', result.fileUrl);
      return result.fileUrl;
    } catch (error) {
      console.error('Arka plan resmi yükleme hatası:', error);
      throw error;
    }
  }
};
