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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default apiClient


