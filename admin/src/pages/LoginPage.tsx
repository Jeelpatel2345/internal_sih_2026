import { useState } from 'react'
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

// ─── Schemas ──────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter valid email'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof loginSchema>

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type ForgotForm = z.infer<typeof forgotSchema>

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})
type OTPForm = z.infer<typeof otpSchema>

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

// ─── Forgot Password Steps ─────────────────────────────────────
type ForgotStep = 'email' | 'otp' | 'reset' | 'done'

function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email')
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const emailForm = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })
  const otpForm = useForm<OTPForm>({ resolver: zodResolver(otpSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  // Step 1: Send OTP
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

  // Step 2: Verify OTP (just store it, verification happens on reset)
  const verifyOtpMutation = useMutation({
    mutationFn: (data: OTPForm) => verifyResetOTP(fpEmail, data.otp),
    onSuccess: (_response, data) => {
      // We store the OTP and proceed — actual verification is on reset
      setFpOtp(data.otp)
      setStep('reset')
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP.'),
  })

  // Step 3: Reset Password
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
        otpForm.reset()
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

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <div className="fp-panel">
          <div className="fp-panel-header">
            <KeyRound size={28} className="fp-panel-icon" />
            <h3>Enter OTP</h3>
            <p>We sent a 6-digit code to <strong>{fpEmail}</strong></p>
          </div>
          <form onSubmit={otpForm.handleSubmit((d) => verifyOtpMutation.mutate(d))} className="login-form">
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <input
                {...otpForm.register('otp')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="form-input otp-input"
                placeholder="123456"
                autoComplete="one-time-code"
              />
              {otpForm.formState.errors.otp && (
                <p className="form-error">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={verifyOtpMutation.isPending}
            >
              Verify OTP →
            </button>
          </form>
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

// ─── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authLogin(data.email, data.password).then((r) => r.data),
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
      <div className="login-left">
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

          <div className="login-stats">
            {[
              { label: 'Total Teams', val: '—' },
              { label: 'Completed', val: '—' },
              { label: 'Pending', val: '—' },
            ].map((s) => (
              <div key={s.label} className="login-stat">
                <span className="login-stat-val">{s.val}</span>
                <span className="login-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

                {/* Forgot password link */}
                <div className="forgot-link-row">
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
