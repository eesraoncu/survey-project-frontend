import apiClient from './api'
import type { User } from './authService'

const TRELLO_API_KEY = import.meta.env.VITE_TRELLO_API_KEY
const TRELLO_REDIRECT_URI = import.meta.env.VITE_TRELLO_REDIRECT_URI

export interface TrelloLoginResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
  error?: string
}

// Trello OAuth URL'ini oluştur
export const getTrelloAuthUrl = (): string => {
  const params = new URLSearchParams({
    key: TRELLO_API_KEY,
    name: 'Survey App',
    return_url: TRELLO_REDIRECT_URI,
    scope: 'read,write',
    expiration: 'never',
    response_type: 'token'
  })
  
  return `https://trello.com/1/authorize?${params.toString()}`
}

// Trello callback'ten token al
export const getTrelloToken = (): string | null => {
  // Önce URL'den token'ı kontrol et
  const urlParams = new URLSearchParams(window.location.search)
  let token = urlParams.get('token')
  
  // Eğer URL'de yoksa, hash'ten kontrol et
  if (!token) {
    const hash = window.location.hash.substring(1) // # işaretini kaldır
    const hashParams = new URLSearchParams(hash)
    token = hashParams.get('token') // Trello 'token' parametresi kullanıyor
  }
  
  return token
}

// Trello kullanıcı bilgilerini al
export const getTrelloUserInfo = async (token: string): Promise<any> => {
  const response = await fetch(`https://api.trello.com/1/members/me?key=${TRELLO_API_KEY}&token=${token}`)
  const data = await response.json()
  
  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    avatarUrl: data.avatarUrl
  }
}

// Backend'e Trello login isteği gönder
export const loginWithTrello = async (trelloToken: string): Promise<TrelloLoginResponse> => {
  try {
    // Debug: Token'ın boş olup olmadığını kontrol et
    console.log('Token received in loginWithTrello:', trelloToken)
    console.log('Token length:', trelloToken?.length)
    console.log('Token is empty:', !trelloToken || trelloToken.trim() === '')
    
    if (!trelloToken || trelloToken.trim() === '') {
      throw new Error('Trello token boş!')
    }
    
    const requestBody = { token: trelloToken }
    console.log('Sending request body:', requestBody)
    
    const response = await apiClient.post<TrelloLoginResponse>('/Auth/trello-callback', requestBody)
    
    console.log('Backend response:', response.data)
    
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token!)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  } catch (error: any) {
    console.error('Trello login error:', error)
    console.error('Error response:', error.response?.data)
    throw new Error(error.response?.data?.message || 'Trello ile giriş yapılırken bir hata oluştu')
  }
}

export default {
  getTrelloAuthUrl,
  getTrelloToken,
  getTrelloUserInfo,
  loginWithTrello
}
