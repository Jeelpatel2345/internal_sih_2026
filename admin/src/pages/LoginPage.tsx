import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { authLogin, forgotPassword, verifyResetOTP, resetPassword } from '../services/adminApi'
import { useAuthStore } from '../stores/useAuthStore'
import './LoginPage.css'

// ─── Schemas ──────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter valid email'),
  password: z.string().min(1, 'Password is required'),
  selectedRole: z.enum(['super_admin', 'admin'], { message: 'Select your role' }),
  rememberMe: z.boolean(),
})
type LoginForm = z.infer<typeof loginSchema>

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type ForgotForm = z.infer<typeof forgotSchema>

const resetSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type ResetForm = z.infer<typeof resetSchema>

// ─── Password Strength ─────────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length >= 12) score++

  if (score <= 1) return { score, label: 'Weak', color: 'weak' }
  if (score <= 2) return { score, label: 'Fair', color: 'fair' }
  if (score <= 3) return { score, label: 'Good', color: 'good' }
  return { score, label: 'Strong', color: 'strong' }
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = getPasswordStrength(password)
  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`strength-bar ${i <= score ? color : ''}`}
          />
        ))}
      </div>
      <span className="strength-label" style={{
        color: color === 'weak' ? '#ef4444' : color === 'fair' ? '#f59e0b' : color === 'good' ? '#3b82f6' : '#16a34a'
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── OTP 6-Cell Input ──────────────────────────────────────
function OTPInput({ onComplete }: { onComplete: (otp: string) => void }) {
  const [cells, setCells] = useState(['', '', '', '', '', ''])
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCells = [...cells]
    newCells[idx] = digit
    setCells(newCells)

    if (digit && idx < 5) {
      refs.current[idx + 1]?.focus()
    }

    const otp = newCells.join('')
    if (otp.length === 6 && !newCells.includes('')) {
      onComplete(otp)
    }
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cells[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCells = Array(6).fill('')
    text.split('').forEach((ch, i) => { newCells[i] = ch })
    setCells(newCells)
    if (text.length === 6) onComplete(text)
    const focusIdx = Math.min(text.length, 5)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div className="otp-cells">
      {cells.map((cell, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={cell}
          className={`otp-cell ${cell ? 'filled' : ''}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  )
}

// ─── Forgot Password Flow ──────────────────────────────────
type ForgotStep = 'email' | 'otp' | 'reset' | 'done'

function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email')
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otpValue, setOtpValue] = useState('')

  const emailForm = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })
  const newPassword = resetForm.watch('newPassword') || ''

  const sendOtpMutation = useMutation({
    mutationFn: (data: ForgotForm) => forgotPassword(data.email),
    onSuccess: (_r, data) => {
      setFpEmail(data.email)
      toast.success('OTP sent! Check your email inbox.')
      setStep('otp')
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Failed to send OTP. Please try again.'),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => verifyResetOTP(fpEmail, otp),
    onSuccess: (_response, otp) => {
      setFpOtp(otp)
      setStep('reset')
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP.'),
  })

  const resetMutation = useMutation({
    mutationFn: (data: ResetForm) => resetPassword(fpEmail, fpOtp, data.newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully!')
      setStep('done')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message || 'Invalid or expired OTP. Please start over.'
      toast.error(msg)
      if (msg.toLowerCase().includes('otp')) {
        setStep('otp')
      }
    },
  })

  if (step === 'done') {
    return (
      <div className="fp-done">
        <div className="fp-done-icon">✅</div>
        <h3>Password Reset!</h3>
        <p>Your password has been updated successfully. You can now log in with your new password.</p>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onBack}>
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="fp-flow">
      {/* Step indicator */}
      <div className="fp-steps">
        {(['email', 'otp', 'reset'] as ForgotStep[]).map((s, i) => (
          <div key={s} className={`fp-step ${step === s ? 'active' : ['otp', 'reset', 'done'].indexOf(step) > i ? 'done' : ''}`}>
            <div className="fp-step-circle">{['otp', 'reset', 'done'].indexOf(step) > i ? '✓' : i + 1}</div>
            <span className="fp-step-label">{['Email', 'OTP', 'Reset'][i]}</span>
            {i < 2 && <div className="fp-step-line" />}
          </div>
        ))}
      </div>

      {/* Step 1: Email */}
      {step === 'email' && (
        <div className="fp-panel">
          <div className="fp-panel-header">
            <Mail size={28} className="fp-panel-icon" />
            <h3>Forgot Password</h3>
            <p>Enter your admin email address. We'll send you a 6-digit OTP.</p>
          </div>
          <form onSubmit={emailForm.handleSubmit((d) => sendOtpMutation.mutate(d))} className="login-form">
            <div className="form-group">
              <label className="form-label">Admin Email Address</label>
              <input
                {...emailForm.register('email')}
                type="email"
                className="form-input"
                placeholder="admin@sih2026.ac.in"
                autoComplete="email"
              />
              {emailForm.formState.errors.email && (
                <p className="form-error">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? <><div className="spinner" /> Sending OTP...</> : 'Send OTP →'}
            </button>
          </form>
          <button className="fp-back-link" onClick={onBack}>
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </div>
      )}

      {/* Step 2: OTP Cells */}
      {step === 'otp' && (
        <div className="fp-panel">
          <div className="fp-panel-header">
            <KeyRound size={28} className="fp-panel-icon" />
            <h3>Enter OTP</h3>
            <p>We sent a 6-digit code to <strong>{fpEmail}</strong></p>
          </div>

          <OTPInput onComplete={(otp) => setOtpValue(otp)} />

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={verifyOtpMutation.isPending || otpValue.length < 6}
            onClick={() => verifyOtpMutation.mutate(otpValue)}
          >
            {verifyOtpMutation.isPending ? <><div className="spinner" /> Verifying...</> : 'Verify OTP →'}
          </button>

          <div className="fp-resend-row">
            <span>Didn't receive it?</span>
            <button
              className="fp-resend-btn"
              onClick={() => sendOtpMutation.mutate({ email: fpEmail })}
              disabled={sendOtpMutation.isPending}
            >
              Resend OTP
            </button>
          </div>
          <button className="fp-back-link" onClick={() => setStep('email')}>
            <ArrowLeft size={14} /> Change Email
          </button>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === 'reset' && (
        <div className="fp-panel">
          <div className="fp-panel-header">
            <ShieldCheck size={28} className="fp-panel-icon" />
            <h3>Set New Password</h3>
            <p>Choose a strong password for your admin account.</p>
          </div>
          <form onSubmit={resetForm.handleSubmit((d) => resetMutation.mutate(d))} className="login-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-wrapper">
                <input
                  {...resetForm.register('newPassword')}
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)} aria-label="Toggle">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthMeter password={newPassword} />
              {resetForm.formState.errors.newPassword && (
                <p className="form-error">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-wrapper">
                <input
                  {...resetForm.register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="form-error">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? <><div className="spinner" /> Resetting...</> : 'Reset Password →'}
            </button>
          </form>
          <button className="fp-back-link" onClick={() => setStep('otp')}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Login Page ───────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { selectedRole: 'admin', rememberMe: true },
  })

  const selectedRole = watch('selectedRole')

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authLogin(data.email, data.password, data.selectedRole).then((r) => r.data),
    onSuccess: (data) => {
      login(data.data.admin, data.data.accessToken)
      toast.success(`Welcome back, ${data.data.admin.name}!`)
      navigate('/dashboard')
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      const msg = err?.response?.data?.message || err?.message || 'Unable to connect to backend server.'
      toast.error(msg)
    },
  })

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data)

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-content">
          <div className="login-logo">
            <div className="login-logo-badge">SIH<br />2026</div>
            <div>
              <p className="login-logo-title">Admin Panel</p>
              <p className="login-logo-sub">KSV / VSITR</p>
            </div>
          </div>
          <h1 className="login-headline">
            Manage the<br />
            <span className="gradient-text">SIH 2026</span><br />
            Portal
          </h1>
          <p className="login-desc">
            Access the internal administration panel to manage team registrations, mentor details, activity logs, and portal settings.
          </p>

          <div className="login-feature-list">
            {[
              { icon: '🏆', text: 'Monitor team registrations' },
              { icon: '👨‍🏫', text: 'Manage mentor submissions' },
              { icon: '📊', text: 'Real-time dashboard analytics' },
              { icon: '⚙️', text: 'Control portal settings' },
            ].map((f) => (
              <div key={f.text} className="login-feature-item">
                <span className="login-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          {showForgot ? (
            <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
          ) : (
            <>
              <div className="login-card-header">
                <h2>Admin Sign In</h2>
                <p>Enter your credentials to access the admin panel.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="selectedRole">Select Role</label>
                  <select
                    id="selectedRole"
                    {...register('selectedRole')}
                    className="form-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {errors.selectedRole && <p className="form-error">{errors.selectedRole.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="form-input"
                    placeholder="admin@sih2026.ac.in"
                    autoComplete="email"
                  />
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-wrapper">
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPass(!showPass)}
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>

                <div className="forgot-link-row">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <input {...register('rememberMe')} type="checkbox" className="remember-checkbox" /> Remember me
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                {loginMutation.isError && (
                  <div className="login-error">
                    <AlertCircle size={16} />
                    {(loginMutation.error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                     (loginMutation.error as { message?: string })?.message ||
                     'Unable to connect to backend server. Ensure backend server is running on port 5000.'}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <><div className="spinner" /> Signing in...</> : 'Sign In →'}
                </button>
              </form>

              <p className="login-footer-note">
                This panel is restricted to authorized administrators only.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
