import axios from 'axios'

const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined
// Geliştirme ortamında Vite proxy'sini kullanmak için varsayılanı '/api' yap
const baseURL = envBase ?? '/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})

// DELETE istekleri için Content-Type header'ını koruyan interceptor (body var)
apiClient.interceptors.request.use(
  (config) => {
    // DELETE isteklerinde body varsa Content-Type header'ını koru
    if (config.method === 'delete' && config.data) {
      console.log('🔧 DELETE isteği body ile gönderiliyor, Content-Type korunuyor');
    } else if (config.method === 'delete' && !config.data) {
      // Body yoksa Content-Type header'ını kaldır
      delete config.headers['Content-Type'];
      console.log('🔧 DELETE isteği body olmadan, Content-Type header\'ı kaldırıldı');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('🔐 [API CLIENT] Response alındı:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('🔐 [API CLIENT] Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    });
    
    // 401 hatası durumunda sayfa yenilemeyi engelle, sadece log'la
    if (error.response?.status === 401) {
      console.log('🔐 [API CLIENT] 401 Unauthorized hatası - sayfa yenilenmeyecek');
      // localStorage temizleme ve sayfa yenileme işlemini kaldırdık
    }
    
    return Promise.reject(error);
  }
)

// Tüm isteklerde bearer token ekle
apiClient.interceptors.request.use((config) => {
  console.log('🔐 [API CLIENT] Request gönderiliyor:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL
  });
  
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
    console.log('🔐 [API CLIENT] Token eklendi, uzunluk:', token.length);
  } else {
    console.log('🔐 [API CLIENT] Token bulunamadı');
  }
  return config
})

export default apiClient


