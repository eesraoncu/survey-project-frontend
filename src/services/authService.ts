import { apiClient } from './api';

// SHA-256 + Base64 hash fonksiyonu (Backend ile uyumlu)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  // Base64 formatına çevir (Backend'de kullanılan format)
  return btoa(String.fromCharCode(...hashArray));
}

// API Response tipleri
export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface AdminLoginRequest {
  adminEmail: string;
  adminPassword: string;
}

export interface User {
  id: number;
  userName: string;
  userSurname: string;
  userEmail: string;
  userAddress: string;
  userAge: number;
  addressId: number;
  roles: string[];
  createdAt: string;
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  admin?: User;
  token: string;
  error: string;
}

export interface RegisterRequest {
  userName: string;
  userSurname: string;
  userEmail: string;
  userPassword: string;
  userAge: number;
  cityName: string;
  districtName: string;
  districtTownshipTownName: string;
  neighbourhoodName: string;
  addressDetails: string;
}

export interface GoogleLoginRequest {
  accessToken: string;
}

export interface GoogleLoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Auth Service fonksiyonları
export const authService = {
  // Normal kullanıcı login fonksiyonu
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 [AUTH SERVICE] Normal login başlatılıyor:', { email: credentials.userEmail });
    
    try {
      // Şifreyi hash'le (güvenlik için)
      const hashedPassword = await hashPassword(credentials.userPassword);
      console.log('🔐 [AUTH SERVICE] Şifre hash\'lendi, uzunluk:', hashedPassword.length);
      
      // Form data formatında gönder
      const formData = `userEmail=${encodeURIComponent(credentials.userEmail)}&userPassword=${encodeURIComponent(hashedPassword)}`;
      console.log('🔐 [AUTH SERVICE] FormData hazırlandı, gönderiliyor...');
      
      const response = await apiClient.post<LoginResponse>('/Auth/login', formData, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      });
      
      console.log('🔐 [AUTH SERVICE] Login response alındı:', {
        success: response.data.success,
        hasUser: !!response.data.user,
        hasAdmin: !!response.data.admin,
        tokenLength: response.data.token?.length || 0
      });
      
      if (response.data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('🔐 [AUTH SERVICE] Token ve user localStorage\'a kaydedildi');
      }
      
      return response.data;
    } catch (error: any) {
      // Hata detaylarını hassas veri olmadan logla
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      console.error('🔐 [AUTH SERVICE] Login error:', { 
        status, 
        message,
        errorType: error.constructor.name,
        hasResponse: !!error.response,
        responseData: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    }
  },

  // Admin login fonksiyonu
  async adminLogin(credentials: AdminLoginRequest): Promise<LoginResponse> {
    console.log('🔐 [AUTH SERVICE] Admin login başlatılıyor:', { email: credentials.adminEmail });
    
    try {
      // Admin şifresi hash'lenmeden gönderiliyor (veritabanında normal string)
      const formData = new FormData();
      formData.append('adminEmail', credentials.adminEmail);
      formData.append('adminPassword', credentials.adminPassword);
      
      console.log('🔐 [AUTH SERVICE] Admin FormData hazırlandı, gönderiliyor...');
      
      const response = await apiClient.post<LoginResponse>('/Auth/admin-login', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      console.log('🔐 [AUTH SERVICE] Admin login response alındı:', {
        success: response.data.success,
        hasUser: !!response.data.user,
        hasAdmin: !!response.data.admin,
        tokenLength: response.data.token?.length || 0
      });
      
      if (response.data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.admin || response.data.user));
        console.log('🔐 [AUTH SERVICE] Admin token ve user localStorage\'a kaydedildi');
      }
      
      return response.data;
    } catch (error: any) {
      // Hata detaylarını hassas veri olmadan logla
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      console.error('🔐 [AUTH SERVICE] Admin login error:', { 
        status, 
        message,
        errorType: error.constructor.name,
        hasResponse: !!error.response,
        responseData: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Admin girişi yapılırken bir hata oluştu');
    }
  },

  // Register fonksiyonu
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      // Şifreyi hash'le (güvenlik için)
      const hashedPassword = await hashPassword(userData.userPassword);
      
      // JSON formatında gönder (backend uyumluluğu için)
      const registerPayload = {
        ...userData,
        userPassword: hashedPassword
      };
      
      console.log('Register payload:', {
        ...registerPayload,
        userPassword: '[HASHED]' // Güvenlik için hash'i gösterme
      });
      
      const response = await apiClient.post<LoginResponse>('/Auth/register', registerPayload);
      
      if (response.data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Register error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message || error?.message,
        data: error?.response?.data
      });
      throw new Error(error.response?.data?.message || 'Kayıt olurken bir hata oluştu');
    }
  },

  // Google Login fonksiyonu
  async loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      console.log('Google login attempt with token');
      const response = await apiClient.post<GoogleLoginResponse>('/Auth/google-login', request);
      console.log('Google login response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token!);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Google login error details:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Google ile giriş yapılırken bir hata oluştu');
    }
  },

  // Logout fonksiyonu
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Kullanıcı bilgilerini al
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Token kontrolü
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Token'ı al
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};

export default authService;
