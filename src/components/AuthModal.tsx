import type { FormEvent } from 'react'
import { brandName } from '../data/site'

export type AuthMode = 'login' | 'signup' | 'reset' | 'update-password'

type AuthModalProps = {
  mode: AuthMode
  email: string
  password: string
  message: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onSwitch: () => void
  onForgotPassword: () => void
}

const headings: Record<AuthMode, string> = {
  login: 'Welcome back.',
  signup: 'Create your account.',
  reset: 'Reset your password.',
  'update-password': 'Set a new password.',
}

const intros: Record<AuthMode, string> = {
  login: 'Log in to continue your training journey.',
  signup: 'Create an account to buy courses and track your progress.',
  reset: 'Enter your account email and we will send you a secure reset link.',
  'update-password': 'Choose a new password for your account, then you are ready to continue.',
}

const submitLabels: Record<AuthMode, string> = {
  login: 'Log in',
  signup: 'Create account',
  reset: 'Send reset link',
  'update-password': 'Save new password',
}

function AuthModal({
  mode,
  email,
  password,
  message,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onClose,
  onSwitch,
  onForgotPassword,
}: AuthModalProps) {
  const needsEmail = mode !== 'update-password'
  const needsPassword = mode === 'login' || mode === 'signup' || mode === 'update-password'

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close authentication form">
          ×
        </button>
        <span className="eyebrow">{brandName.toUpperCase()}</span>
        <h2 id="auth-title">{headings[mode]}</h2>
        <p className="auth-intro">{intros[mode]}</p>

        <form className="auth-form" onSubmit={onSubmit}>
          {needsEmail && (
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
          )}
          {needsPassword && (
            <label>
              {mode === 'update-password' ? 'New password' : 'Password'}
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>
          )}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : submitLabels[mode]}
          </button>
        </form>

        {mode === 'login' && (
          <button type="button" className="auth-switch" onClick={onForgotPassword}>
            Forgot your password?
          </button>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <button type="button" className="auth-switch" onClick={onSwitch}>
            {mode === 'login' ? 'Need an account? Join now' : 'Already have an account? Log in'}
          </button>
        )}

        {(mode === 'reset' || mode === 'update-password') && (
          <button type="button" className="auth-switch" onClick={onSwitch}>
            Back to log in
          </button>
        )}
      </section>
    </div>
  )
}

export default AuthModal