import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || 'https://internal-sih-2026-nv5t.vercel.app/api/v1').replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Registration APIs ────────────────────────────────────────
export const checkTeamName = (name: string) =>
  api.get<{ success: boolean; available: boolean; message: string }>(`/teams/check-name?name=${encodeURIComponent(name)}`)

export const getRegistrationStatus = () =>
  api.get<{ success: boolean; data: { isOpen: boolean; deadline: string } }>('/teams/status')

export const registerTeam = (data: RegisterTeamPayload) =>
  api.post<{ success: boolean; message: string; data: { registrationId: string; teamName: string } }>(
    '/teams/register',
    data
  )

export const getTeamStatus = (registrationId: string) =>
  api.get<{ success: boolean; data: { registrationId: string; teamName: string; status: string; hasMentor: boolean } }>(
    `/teams/${registrationId}`
  )

// ─── Mentor APIs ──────────────────────────────────────────────
export const submitMentor = (data: MentorPayload) =>
  api.post<{ success: boolean; message: string; data: { registrationId: string; status: string } }>(
    '/mentor/submit',
    data
  )

// ─── Types ───────────────────────────────────────────────────
export interface Participant {
  fullName: string
  gender: 'Male' | 'Female' | 'Other'
  enrollmentNumber: string
  semester: number
  department: string
  mobile: string
  email: string
}

export interface RegisterTeamPayload {
  teamName: string
  leader: Participant
  members: Participant[]
}

export interface MentorPayload {
  registrationId: string
  mentor: {
    fullName: string
    contactNumber: string
    email: string
    department: string
    institute: string
    officeAddress: string
  }
}
