import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, AlertCircle, X, Plus, Trash2, Users, UserCheck, ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback as useDebounce } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import LogoBar from '../components/layout/LogoBar'
import { checkTeamName, registerTeam, getRegistrationStatus, type RegisterTeamPayload } from '../services/api'
import { DEPARTMENTS, SEMESTERS } from '../constants'
import './RegisterPage.css'

// ─── Schemas ────────────────────────────────────────────────────
const participantSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Select gender' }),
  enrollmentNumber: z.string().min(5, 'Enter valid enrollment number').max(20),
  semester: z.coerce.number().int().min(1).max(8),
  department: z.string().min(1, 'Select department'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Enter valid email address'),
})

const step1Schema = z.object({ teamName: z.string().min(2, 'Team name must be at least 2 characters').max(50) })
const step2Schema = z.object({ leader: participantSchema })
const step3Schema = z.object({ members: z.array(participantSchema).min(5).max(5) })

type Step1Form = z.infer<typeof step1Schema>
type Step2Form = z.infer<typeof step2Schema>
type Step3Form = z.infer<typeof step3Schema>

const EMPTY_MEMBER = { fullName: '', gender: 'Male' as const, enrollmentNumber: '', semester: 1, department: '', mobile: '', email: '' }

// ─── Participant Form Fields ─────────────────────────────────────
function ParticipantFields({ prefix, register, errors, watch }: {
  prefix: string
  register: ReturnType<typeof useForm>['register']
  errors: Record<string, { message?: string }>
  watch: ReturnType<typeof useForm>['watch']
}) {
  return (
    <div className="participant-fields">
      <div className="fields-row-2">
        <div className="form-group">
          <label className="form-label">Full Name <span className="required">*</span></label>
          <input {...register(`${prefix}.fullName`)} className={`form-input ${errors?.[`${prefix}.fullName`] ? 'error' : ''}`} placeholder="Priya Patel" />
          {errors?.[`${prefix}.fullName`] && <p className="form-error"><AlertCircle size={12} />{errors[`${prefix}.fullName`]?.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Gender <span className="required">*</span></label>
          <select {...register(`${prefix}.gender`)} className="form-select">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="fields-row-2">
        <div className="form-group">
          <label className="form-label">Enrollment Number <span className="required">*</span></label>
          <input {...register(`${prefix}.enrollmentNumber`)} className="form-input" placeholder="21CE001" style={{ textTransform: 'uppercase' }} />
          {errors?.[`${prefix}.enrollmentNumber`] && <p className="form-error"><AlertCircle size={12} />{errors[`${prefix}.enrollmentNumber`]?.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Semester <span className="required">*</span></label>
          <select {...register(`${prefix}.semester`)} className="form-select">
            <option value="">Select semester</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Department <span className="required">*</span></label>
        <select {...register(`${prefix}.department`)} className="form-select">
          <option value="">Select department</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="fields-row-2">
        <div className="form-group">
          <label className="form-label">Mobile Number <span className="required">*</span></label>
          <input {...register(`${prefix}.mobile`)} className="form-input" placeholder="9876543210" maxLength={10} />
          {errors?.[`${prefix}.mobile`] && <p className="form-error"><AlertCircle size={12} />{errors[`${prefix}.mobile`]?.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Email Address <span className="required">*</span></label>
          <input {...register(`${prefix}.email`)} className="form-input" placeholder="priya@example.com" type="email" />
          {errors?.[`${prefix}.email`] && <p className="form-error"><AlertCircle size={12} />{errors[`${prefix}.email`]?.message}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ regId, teamName, onClose }: { regId: string; teamName: string; onClose: () => void }) {
  const navigate = useNavigate()

  const handleProceed = () => {
    localStorage.setItem('sih2026_reg_id', regId)
    localStorage.setItem('sih2026_team_name', teamName)
    navigate('/')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">🎉</div>
        <h2 className="success-title">Registration Successful!</h2>
        <p className="success-desc">
          Team <strong>{teamName}</strong> has been registered successfully.
        </p>

        <div className="reg-id-box">
          <p className="reg-id-label">Your Registration ID</p>
          <p className="reg-id-value">{regId}</p>
          <p className="reg-id-hint">Save this ID — you'll need it to submit mentor details.</p>
        </div>

        <div className="success-steps">
          <div className="success-step complete">
            <CheckCircle size={16} />
            Phase 1: Team Registration — Complete
          </div>
          <div className="success-step pending">
            <AlertCircle size={16} />
            Phase 2: Mentor Details — Pending
          </div>
        </div>

        <div className="success-actions">
          <button
            className="btn btn-primary btn-full"
            onClick={() => { localStorage.setItem('sih2026_reg_id', regId); localStorage.setItem('sih2026_team_name', teamName); navigate('/mentor') }}
          >
            Submit Mentor Details Now →
          </button>
          <button className="btn btn-ghost btn-full" onClick={handleProceed}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [teamName, setTeamName] = useState('')
  const [leaderData, setLeaderData] = useState<z.infer<typeof participantSchema> | null>(null)
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'forbidden'>('idle')
  const [successData, setSuccessData] = useState<{ regId: string; teamName: string } | null>(null)

  // Check if registration is open
  const { data: statusData } = useQuery({
    queryKey: ['regStatus'],
    queryFn: () => getRegistrationStatus().then((r) => r.data),
  })
  const isOpen = statusData?.data?.isOpen !== false

  // ── Step 1 Form
  const step1Form = useForm<Step1Form>({ resolver: zodResolver(step1Schema) })
  // ── Step 2 Form
  const step2Form = useForm<Step2Form>({ resolver: zodResolver(step2Schema) })
  // ── Step 3 Form
  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      members: Array(5).fill(null).map(() => ({ ...EMPTY_MEMBER })),
    },
  })
  const { fields } = useFieldArray({ control: step3Form.control, name: 'members' })

  // Mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterTeamPayload) => registerTeam(payload).then((r) => r.data),
    onSuccess: (data) => {
      setSuccessData({ regId: data.data.registrationId, teamName: data.data.teamName })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    },
  })

  // Team name check with debounce
  const checkName = useCallback(async (name: string) => {
    if (name.length < 2) { setNameStatus('idle'); return }
    setNameStatus('checking')
    try {
      const res = await checkTeamName(name)
      if (!res.data.available) {
        setNameStatus(res.data.message.includes('institute') ? 'forbidden' : 'taken')
      } else {
        setNameStatus('available')
      }
    } catch {
      setNameStatus('idle')
    }
  }, [])

  const onStep1Submit = (data: Step1Form) => {
    if (nameStatus === 'taken' || nameStatus === 'forbidden') return
    setTeamName(data.teamName)
    setStep(2)
  }

  const onStep2Submit = (data: Step2Form) => {
    setLeaderData(data.leader)
    setStep(3)
  }

  const onStep3Submit = async (data: Step3Form) => {
    if (!leaderData) return
    registerMutation.mutate({ teamName, leader: leaderData, members: data.members })
  }

  const steps = [
    { num: 1, label: 'Team Name', icon: ClipboardList },
    { num: 2, label: 'Leader', icon: UserCheck },
    { num: 3, label: 'Members', icon: Users },
  ]

  if (!isOpen) {
    return (
      <>
        <Navbar />
        <div className="register-closed">
          <div className="closed-card card">
            <div className="closed-icon">🔒</div>
            <h2>Registration Closed</h2>
            <p>The registration deadline has passed. Thank you for your interest in Internal SIH 2026.</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <LogoBar />
      <Navbar />
      {successData && (
        <SuccessModal
          regId={successData.regId}
          teamName={successData.teamName}
          onClose={() => setSuccessData(null)}
        />
      )}

      <main className="register-page">
        <div className="register-hero">
          <div className="container">
            <h1 className="register-title">Register Your Team</h1>
            <p className="register-subtitle">Complete all 3 steps to register for Internal SIH 2026</p>
          </div>
        </div>

        <div className="container register-body">
          {/* Steps bar */}
          <div className="steps-bar">
            {steps.map((s, i) => (
              <div key={s.num} className={`step-item ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}>
                <div className="step-circle">
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className="step-label">{s.label}</span>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Team Name ───────────────────────────── */}
          {step === 1 && (
            <div className="register-card card animate-fade-in-up">
              <div className="step-header">
                <ClipboardList size={28} className="step-icon" />
                <div>
                  <h2 className="step-title">Choose Your Team Name</h2>
                  <p className="step-desc">Pick a creative, unique name. Must not include institute name (VSITR, KSV).</p>
                </div>
              </div>

              <form onSubmit={step1Form.handleSubmit(onStep1Submit)}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Team Name <span className="required">*</span></label>
                  <div className="team-name-input-wrapper">
                    <input
                      {...step1Form.register('teamName', {
                        onChange: (e) => checkName(e.target.value),
                      })}
                      className={`form-input team-name-input ${
                        nameStatus === 'available' ? 'success' : nameStatus === 'taken' || nameStatus === 'forbidden' ? 'error' : ''
                      }`}
                      placeholder="e.g. CodeBreakers, NovaSpark, TechTitans"
                    />
                    <div className="team-name-status">
                      {nameStatus === 'checking' && <div className="spinner spinner-dark" />}
                      {nameStatus === 'available' && <CheckCircle size={18} color="var(--color-success)" />}
                      {(nameStatus === 'taken' || nameStatus === 'forbidden') && <AlertCircle size={18} color="var(--color-error)" />}
                    </div>
                  </div>
                  {step1Form.formState.errors.teamName && (
                    <p className="form-error"><AlertCircle size={12} />{step1Form.formState.errors.teamName.message}</p>
                  )}
                  {nameStatus === 'available' && <p className="form-hint" style={{ color: 'var(--color-success)' }}>✓ Team name is available!</p>}
                  {nameStatus === 'taken' && <p className="form-error"><AlertCircle size={12} />This team name is already taken.</p>}
                  {nameStatus === 'forbidden' && <p className="form-error"><AlertCircle size={12} />Team name must not include the institute name.</p>}
                </div>

                <div className="name-rules">
                  <p className="name-rules-title">Team Name Rules:</p>
                  <ul>
                    <li>✓ Must be unique (not already registered)</li>
                    <li>✓ Must NOT include: VSITR, KSV, Kadi Sarva, Vidush Somany</li>
                    <li>✓ 2–50 characters, English only</li>
                    <li>✓ Be creative — this is your team identity!</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-xl"
                  disabled={nameStatus === 'taken' || nameStatus === 'forbidden' || nameStatus === 'checking'}
                >
                  Continue to Leader Details <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* ── Step 2: Leader ──────────────────────────────── */}
          {step === 2 && (
            <div className="register-card card animate-fade-in-up">
              <div className="step-header">
                <UserCheck size={28} className="step-icon" />
                <div>
                  <h2 className="step-title">Team Leader Details</h2>
                  <p className="step-desc">
                    Team: <strong style={{ color: 'var(--color-red)' }}>{teamName}</strong> — Enter the team leader's information.
                  </p>
                </div>
              </div>

              <form onSubmit={step2Form.handleSubmit(onStep2Submit)}>
                <ParticipantFields
                  prefix="leader"
                  register={step2Form.register}
                  errors={step2Form.formState.errors as Record<string, { message?: string }>}
                  watch={step2Form.watch}
                />

                <div className="step-actions">
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg">
                    Continue to Members <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Step 3: Members ────────────────────────────── */}
          {step === 3 && (
            <div className="register-card card animate-fade-in-up">
              <div className="step-header">
                <Users size={28} className="step-icon" />
                <div>
                  <h2 className="step-title">Team Members (5 members)</h2>
                  <p className="step-desc">Add details for all 5 team members. <strong style={{ color: 'var(--color-warning)' }}>At least 1 female member required.</strong></p>
                </div>
              </div>

              <form onSubmit={step3Form.handleSubmit(onStep3Submit)}>
                {fields.map((field, idx) => (
                  <div key={field.id} className="member-block">
                    <div className="member-block-header">
                      <h3 className="member-title">
                        <span className="member-num">{idx + 1}</span>
                        Member {idx + 1}
                      </h3>
                    </div>
                    <ParticipantFields
                      prefix={`members.${idx}`}
                      register={step3Form.register}
                      errors={step3Form.formState.errors as Record<string, { message?: string }>}
                      watch={step3Form.watch}
                    />
                  </div>
                ))}

                <div className="female-notice">
                  <AlertCircle size={16} />
                  <span>Ensure at least <strong>1 female participant</strong> is included in your team. Teams without a female member will be rejected.</span>
                </div>

                {registerMutation.isError && (
                  <div className="submit-error">
                    <AlertCircle size={16} />
                    {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please check your details and try again.'}
                  </div>
                )}

                <div className="step-actions">
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <><div className="spinner" /> Registering...</>
                    ) : (
                      <>Submit Registration <CheckCircle size={18} /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
