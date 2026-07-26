import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Attach JWT token ─────────────────────────────────────────
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih2026_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Handle 401 ───────────────────────────────────────────────
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sih2026_admin_token')
      localStorage.removeItem('sih2026_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth APIs ─────────────────────────────────────────────────
export const authLogin = (email: string, password: string, selectedRole: string) =>
  adminApi.post('/auth/login', { email, password, selectedRole })

export const authLogout = (refreshToken?: string) =>
  adminApi.post('/auth/logout', { refreshToken })

export const getMe = () => adminApi.get('/auth/me')

export const forgotPassword = (email: string) =>
  adminApi.post('/auth/forgot-password', { email })

export const verifyResetOTP = (email: string, otp: string) =>
  adminApi.post('/auth/verify-reset-otp', { email, otp })

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  adminApi.post('/auth/reset-password', { email, otp, newPassword })


// ─── Teams APIs ────────────────────────────────────────────────
export interface TeamsQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  department?: string
  sort?: string
}

export const getTeams = (params: TeamsQuery = {}) =>
  adminApi.get('/admin/teams', { params })

export const getTeamById = (id: string) =>
  adminApi.get(`/admin/teams/${id}`)

export const updateTeam = (id: string, data: Record<string, unknown>) =>
  adminApi.put(`/admin/teams/${id}`, data)

export const deleteTeam = (id: string) =>
  adminApi.delete(`/admin/teams/${id}`)

// ─── Mentors ───────────────────────────────────────────────────
export const getMentors = () => adminApi.get('/admin/mentors')

// ─── Dashboard ─────────────────────────────────────────────────
export const getDashboardStats = () => adminApi.get('/admin/dashboard/stats')

// ─── Logs ──────────────────────────────────────────────────────
export const getLogs = (params: { page?: number; limit?: number; action?: string } = {}) =>
  adminApi.get('/admin/logs', { params })

// ─── Settings ──────────────────────────────────────────────────
export const getSettings = () => adminApi.get('/admin/settings')
export const updateSettings = (data: Record<string, unknown>) =>
  adminApi.put('/admin/settings', data)

// ─── Export ────────────────────────────────────────────────────
export const exportExcel = () =>
  adminApi.get('/admin/export/excel', { responseType: 'blob' })

export const exportCSV = () =>
  adminApi.get('/admin/export/csv', { responseType: 'blob' })

export const exportPDFData = () =>
  adminApi.get('/admin/export/pdf')

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Admin User Management ────────────────────────────────────
export const getAdminUsers = () => adminApi.get('/admin/users')
export const createAdminUser = (data: { name: string; email: string; password: string; role: string }) =>
  adminApi.post('/admin/users', data)
export const deleteAdminUserApi = (id: string) => adminApi.delete(`/admin/users/${id}`)
