import axios from 'axios';

// SHA-256 + Base64 hash fonksiyonu (Backend ile uyumlu)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  // Base64 formatına çevir (Backend'de kullanılan format)
  return btoa(String.fromCharCode(...hashArray));
}

// API Base URL - Proxy kullanarak
const API_BASE_URL = '/api'; // Vite proxy kullanıyor

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS için önemli
  timeout: 120000, // 2 dakika timeout (60 saniye yerine)
});

// Request interceptor - her istekte token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı logout yap
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response tipleri
export interface LoginRequest {
  userEmail: string;
  userPassword: string;
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
  user: User;
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
  // Login fonksiyonu
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Şifreyi hash'le (güvenlik için)
      const hashedPassword = await hashPassword(credentials.userPassword);
      
      // Form data formatında gönder
      const formData = `userEmail=${encodeURIComponent(credentials.userEmail)}&userPassword=${encodeURIComponent(hashedPassword)}`;
      
      const response = await apiClient.post<LoginResponse>('/Auth/login', formData, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      });
      
      if (response.data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      // Hata detaylarını hassas veri olmadan logla
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      console.error('Login error:', { status, message });
      throw new Error(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
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
