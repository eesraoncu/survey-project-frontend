import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined

export const apiClient = axios.create({
  baseURL: baseURL ?? 'http://localhost:5000/api',
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
  (response) => response,
  (error) => Promise.reject(error)
)

export default apiClient


