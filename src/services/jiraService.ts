import apiClient from './api'
import type { User } from './authService'

const JIRA_CLIENT_ID = import.meta.env.VITE_JIRA_CLIENT_ID
const JIRA_REDIRECT_URI = import.meta.env.VITE_JIRA_REDIRECT_URI


export interface JiraLoginResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
  error?: string
}

// Jira OAuth URL'ini oluştur
export const getJiraAuthUrl = (): string => {
  console.log('JIRA_CLIENT_ID:', JIRA_CLIENT_ID);
  console.log('JIRA_REDIRECT_URI:', JIRA_REDIRECT_URI);
  
  const params = new URLSearchParams({
    client_id: JIRA_CLIENT_ID,
    redirect_uri: JIRA_REDIRECT_URI,
    scope: 'read:me read:jira-user read:jira-work write:jira-work read:servicedesk-request write:servicedesk-request',
    response_type: 'code', // Jira code flow kullanıyor
    state: Math.random().toString(36).substring(7), // CSRF koruması için
    prompt: 'consent' // Her zaman izin iste
  })
  
  const authUrl = `https://auth.atlassian.com/authorize?${params.toString()}`;
  console.log('Generated Jira Auth URL:', authUrl);
  
  return authUrl;
}

// Jira callback'ten authorization code al
export const getJiraCode = (): string | null => {
  // URL'den code parametresini kontrol et
  const urlParams = new URLSearchParams(window.location.search)
  let code = urlParams.get('code')
  
  // Eğer URL'de yoksa, hash'ten kontrol et
  if (!code) {
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)
    code = hashParams.get('code')
  }
  
  return code
}

// OAuth state parametresini URL'den al
export const getJiraState = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  let state = urlParams.get('state')

  if (!state) {
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)
    state = hashParams.get('state')
  }

  return state
}

// Backend'e Jira login isteği gönder
export const loginWithJira = async (jiraCode: string): Promise<JiraLoginResponse> => {
  try {
    console.log('Code received in loginWithJira:', jiraCode)
    console.log('Code length:', jiraCode?.length)
    console.log('Code is empty:', !jiraCode || jiraCode.trim() === '')
    
    if (!jiraCode || jiraCode.trim() === '') {
      throw new Error('Jira authorization code boş!')
    }
    
    const state = getJiraState()
    console.log('State received in loginWithJira:', state)

    const requestBody = { code: jiraCode, state }
    console.log('Sending request body:', requestBody)
    
    const response = await apiClient.post<JiraLoginResponse>('/Auth/jira-callback', requestBody)
    
    console.log('Backend response:', response.data)
    
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token!)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  } catch (error: unknown) {
    console.error('Jira login error:', error)
    const axiosError = error as { response?: { data?: { message?: string } } }
    throw new Error(axiosError.response?.data?.message || 'Jira ile giriş yapılırken bir hata oluştu')
  }
}

// Jira test endpoint'ini çağır
export const testJiraConnection = async (token: string): Promise<JiraLoginResponse> => {
  try {
    console.log('Testing Jira connection with token:', token);
    const response = await apiClient.post<JiraLoginResponse>('/Auth/jira-test', { token })
    return response.data
  } catch (error: unknown) {
    console.error('Jira test error:', error)
    const axiosError = error as { response?: { data?: { message?: string } } }
    throw new Error(axiosError.response?.data?.message || 'Jira bağlantı testi başarısız')
  }
}

export default {
  getJiraAuthUrl,
  getJiraCode,
  loginWithJira,
  testJiraConnection
}
