import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 30000,
})

export const uploadFiles = async (files: File[]) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const response = await api.post('/api/upload', formData)
  return response.data
}

export const getBooks = async () => {
  const response = await api.get('/api/books')
  return response.data
}

export const buildKG = async (bookId: string) => {
  const response = await api.post(`/api/books/${bookId}/build-kg`)
  return response.data
}

export const getKG = async (bookId: string) => {
  const response = await api.get(`/api/books/${bookId}/kg`)
  return response.data
}

export const getMergedKG = async () => {
  const response = await api.get('/api/kg/merged')
  return response.data
}

export const triggerMerge = async () => {
  const response = await api.post('/api/merge')
  return response.data
}

export const getDecisions = async () => {
  const response = await api.get('/api/merge/decisions')
  return response.data
}

export const triggerCompress = async () => {
  const response = await api.post('/api/compress')
  return response.data
}

export const getCompressResult = async () => {
  const response = await api.get('/api/compress/result')
  return response.data
}

export const getCompressStats = async () => {
  const response = await api.get('/api/compress/stats')
  return response.data
}

export const queryRAG = async (question: string) => {
  const response = await api.post('/api/rag/query', { question })
  return response.data
}

export const getRAGStatus = async () => {
  const response = await api.get('/api/rag/status')
  return response.data
}

export const teacherChat = async (message: string, sessionId: string) => {
  const response = await api.post('/api/teacher/chat', { message, session_id: sessionId })
  return response.data
}

export const getTeacherHistory = async (sessionId: string) => {
  const response = await api.get(`/api/teacher/history/${sessionId}`)
  return response.data
}

export default api
