import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, AlertCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import LogoBar from '../components/layout/LogoBar'
import { submitMentor, getTeamStatus } from '../services/api'
import { DEPARTMENTS } from '../constants'
import './MentorPage.css'

const mentorSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required'),
  mentor: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
    email: z.string().email('Enter valid email address'),
    department: z.string().min(1, 'Select department'),
    institute: z.string().min(2, 'Institute name is required'),
    officeAddress: z.string().min(5, 'Office address is required'),
  }),
})

type MentorForm = z.infer<typeof mentorSchema>

export default function MentorPage() {
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const [teamInfo, setTeamInfo] = useState<{ teamName: string; status: string; hasMentor: boolean } | null>(null)
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [successData, setSuccessData] = useState<{ regId: string; teamName: string } | null>(null)

  const savedRegId = localStorage.getItem('sih2026_reg_id') || ''

  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm<MentorForm>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      registrationId: savedRegId,
      mentor: { fullName: '', contactNumber: '', email: '', department: '', institute: 'KSV / Vidush Somany Institute of Technology and Research', officeAddress: '' },
    },
  })

  const verifyRegistration = async () => {
    const regId = getValues('registrationId')
    if (!regId) { setVerifyError('Please enter a Registration ID'); return }
    setVerifyLoading(true)
    setVerifyError('')
    try {
      const res = await getTeamStatus(regId.toUpperCase())
      const team = res.data.data
      if (team.hasMentor) {
        setVerifyError('Mentor details have already been submitted for this team. Registration is complete!')
        setVerified(false)
      } else {
        setTeamInfo({ teamName: team.teamName, status: team.status, hasMentor: team.hasMentor })
        setVerified(true)
        setValue('registrationId', team.registrationId)
      }
    } catch {
      setVerifyError('Registration ID not found. Please check and try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  const submitMutation = useMutation({
    mutationFn: (data: MentorForm) => submitMentor({ registrationId: data.registrationId, mentor: data.mentor }).then((r) => r.data),
    onSuccess: (data, vars) => {
      setSuccessData({ regId: vars.registrationId, teamName: teamInfo?.teamName || '' })
      localStorage.setItem('sih2026_mentor_status', 'completed')
      toast.success('Mentor details submitted successfully!')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Submission failed. Please try again.')
    },
  })

  const onSubmit = (data: MentorForm) => submitMutation.mutate(data)

  if (successData) {
    return (
      <>
        <LogoBar />
        <Navbar />
        <div className="mentor-page">
          <div className="mentor-hero">
            <div className="container">
              <h1 className="mentor-title">Mentor Submitted! 🎉</h1>
            </div>
          </div>
          <div className="container mentor-body">
            <div className="mentor-card card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Registration Complete!
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Team <strong>{successData.teamName}</strong> — all registration phases are now complete.
                You will receive a confirmation email at your registered address.
              </p>
              <div className="reg-id-box" style={{ marginBottom: '2rem' }}>
                <p className="reg-id-label">Registration ID</p>
                <p className="reg-id-value">{successData.regId}</p>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
                Return to Home →
              </button>
            </div>
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
      <main className="mentor-page">
        <div className="mentor-hero">
          <div className="container">
            <h1 className="mentor-title">Submit Mentor Details</h1>
            <p className="mentor-subtitle">Phase 2 of 2 — Complete your team registration</p>
          </div>
        </div>

        <div className="container mentor-body">
          <div className="mentor-card card animate-fade-in-up">
            {/* Info banner */}
            <div className="mentor-info-banner">
              <AlertCircle size={16} />
              <span>You need your <strong>Registration ID</strong> from Phase 1. Verify it below before submitting mentor details.</span>
            </div>

            {/* Registration ID Verification */}
            <div className="form-group">
              <label className="form-label">Registration ID <span className="required">*</span></label>
              <div className="verify-row">
                <input
                  {...register('registrationId')}
                  className="form-input"
                  placeholder="SIH2026-001"
                  style={{ textTransform: 'uppercase' }}
                  readOnly={verified}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-md"
                  onClick={verifyRegistration}
                  disabled={verifyLoading || verified}
                >
                  {verifyLoading ? <div className="spinner spinner-dark" /> : <><Search size={16} /> Verify</>}
                </button>
              </div>
              {verifyError && <p className="form-error"><AlertCircle size={12} />{verifyError}</p>}
            </div>

            {/* Verified team info */}
            {verified && teamInfo && (
              <div className="team-verified-card">
                <CheckCircle size={20} color="var(--color-success)" />
                <div>
                  <p className="team-verified-name">{teamInfo.teamName}</p>
                  <p className="team-verified-status">Phase 1 complete — Awaiting mentor details</p>
                </div>
              </div>
            )}

            {/* Mentor Form */}
            {verified && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="divider" />
                <h3 className="mentor-section-title">Faculty Mentor Information</h3>

                <div className="fields-row-2-mentor">
                  <div className="form-group">
                    <label className="form-label">Mentor Full Name <span className="required">*</span></label>
                    <input {...register('mentor.fullName')} className="form-input" placeholder="Dr. Rajesh Kumar Patel" />
                    {errors.mentor?.fullName && <p className="form-error"><AlertCircle size={12} />{errors.mentor.fullName.message}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number <span className="required">*</span></label>
                    <input {...register('mentor.contactNumber')} className="form-input" placeholder="9876543210" maxLength={10} />
                    {errors.mentor?.contactNumber && <p className="form-error"><AlertCircle size={12} />{errors.mentor.contactNumber.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <input {...register('mentor.email')} className="form-input" placeholder="faculty@vsitr.ac.in" type="email" />
                  {errors.mentor?.email && <p className="form-error"><AlertCircle size={12} />{errors.mentor.email.message}</p>}
                </div>

                <div className="fields-row-2-mentor">
                  <div className="form-group">
                    <label className="form-label">Department <span className="required">*</span></label>
                    <select {...register('mentor.department')} className="form-select">
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.mentor?.department && <p className="form-error"><AlertCircle size={12} />{errors.mentor.department.message}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Institute <span className="required">*</span></label>
                    <input {...register('mentor.institute')} className="form-input" placeholder="VSITR / KSV" />
                    {errors.mentor?.institute && <p className="form-error"><AlertCircle size={12} />{errors.mentor.institute.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Office Address <span className="required">*</span></label>
                  <textarea
                    {...register('mentor.officeAddress')}
                    className="form-textarea"
                    placeholder="Room no., Department name, Building, Campus..."
                    rows={3}
                  />
                  {errors.mentor?.officeAddress && <p className="form-error"><AlertCircle size={12} />{errors.mentor.officeAddress.message}</p>}
                </div>

                {submitMutation.isError && (
                  <div className="submit-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: '0.875rem', color: 'var(--color-error)', marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    {(submitMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed.'}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-xl"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <><div className="spinner" /> Submitting...</>
                  ) : (
                    <>Submit Mentor Details <CheckCircle size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
