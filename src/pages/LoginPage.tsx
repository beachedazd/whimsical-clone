import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session } = useAuth()

  // Redirect to home if already authenticated
  if (session) {
    return <Navigate to="/home" replace />
  }

  const isSignup = searchParams.get('mode') === 'signup'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setConfirmationMessage(null)
    setLoading(true)

    try {
      if (isSignup) {
        // Sign up
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        })

        if (signupError) {
          setError(signupError.message)
        } else if (data.user && !data.session) {
          // User created but no session (needs email confirmation)
          setConfirmationMessage('Check your email to confirm your account.')
        } else if (data.session) {
          // User created and logged in immediately
          navigate('/home')
        }
      } else {
        // Sign in
        const { data, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signinError) {
          setError(signinError.message)
        } else if (data.session) {
          navigate('/home')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    const newMode = isSignup ? '' : 'signup'
    navigate(`/login${newMode ? `?mode=${newMode}` : ''}`)
    setError(null)
    setConfirmationMessage(null)
    setDisplayName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo-mark"></div>
          <div className="login-wordmark">breeze</div>
        </div>

        {/* Heading */}
        <h1 className="login-heading">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Display name field (signup only) */}
          {isSignup && (
            <div className="login-field">
              <label htmlFor="displayName" className="login-label">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="login-input"
                disabled={loading}
              />
            </div>
          )}

          {/* Email field */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="login-input"
              disabled={loading}
              required
            />
          </div>

          {/* Password field */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
              disabled={loading}
              required
            />
          </div>

          {/* Error message */}
          {error && <div className="login-error">{error}</div>}

          {/* Confirmation message */}
          {confirmationMessage && (
            <div className="login-confirmation">{confirmationMessage}</div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        {/* Toggle mode link */}
        <div className="login-toggle">
          {isSignup
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="login-toggle-link"
            disabled={loading}
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
