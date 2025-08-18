import { apiClient } from './api'

// Backend Questions API veri modeli
export interface QuestionApiModel {
	id: number
	questionsText: string
	questionType: string
	choices: string[]
	surveysId: number | string
	createdAt?: string
}

// Create/Update istekleri için model
export interface UpsertQuestionRequest {
	questionsText: string
	questionType: string
	choices: string[]
	surveysId: number | string
}

export const questionService = {
	// Tüm soruları getir
	async getAll(): Promise<QuestionApiModel[]> {
		console.log('[questionService.getAll] -> GET /Questions')
		const res = await apiClient.get<QuestionApiModel[]>('/Questions')
		console.log('[questionService.getAll] <-', Array.isArray(res.data) ? `count=${res.data.length}` : res.data)
		return res.data
	},

	// ID ile soru getir
	async getById(id: number | string): Promise<QuestionApiModel> {
		const res = await apiClient.get<QuestionApiModel>(`/Questions/${id}`)
		return res.data
	},

	// Survey ID'ye göre soruları getir
	async getBySurveyId(surveyId: number | string): Promise<QuestionApiModel[]> {
		try {
			const path = `/Questions/by-survey/${surveyId}`
			console.log('[questionService.getBySurveyId] -> GET', path, { surveyId })
			const res = await apiClient.get<QuestionApiModel[] | QuestionApiModel>(path)
			console.log('[questionService.getBySurveyId] <- status', (res as any).status, 'data:', res.data)
			// Bazı backendler tek öğe/array dönebilir; güvenli hale getir
			const data: any = res.data as any
			return Array.isArray(data) ? data : (data ? [data] : [])
		} catch (error: any) {
			console.error('[questionService.getBySurveyId] ERROR', {
				surveyId,
				status: error?.response?.status,
				data: error?.response?.data,
				message: error?.message
			})
			throw error
		}
	},

	// Soru oluştur
	async create(payload: UpsertQuestionRequest): Promise<QuestionApiModel> {
		console.log('[questionService.create] -> POST /Questions', payload)
		// Bazı backendler surveys_id bekleyebilir; her iki alanı da gönderelim
		const body: any = { ...payload, surveys_id: payload.surveysId }
		const res = await apiClient.post<QuestionApiModel>('/Questions', body)
		console.log('[questionService.create] <- status', (res as any).status, 'data:', res.data)
		return res.data
	},

	// Soru güncelle
	async update(id: number | string, payload: UpsertQuestionRequest): Promise<QuestionApiModel> {
		const res = await apiClient.put<QuestionApiModel>(`/Questions/${id}`, payload)
		return res.data
	},

	// Soru sil
	async remove(id: number | string): Promise<void> {
		await apiClient.delete(`/Questions/${id}`)
	},
}

export default questionService


