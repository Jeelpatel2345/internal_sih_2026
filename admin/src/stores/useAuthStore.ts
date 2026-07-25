import { create } from 'zustand'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthStore {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AdminUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('sih2026_admin_user') || 'null') }
    catch { return null }
  })(),
  token: localStorage.getItem('sih2026_admin_token'),
  isAuthenticated: !!localStorage.getItem('sih2026_admin_token'),

  login: (user, token) => {
    localStorage.setItem('sih2026_admin_token', token)
    localStorage.setItem('sih2026_admin_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('sih2026_admin_token')
    localStorage.removeItem('sih2026_admin_user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
