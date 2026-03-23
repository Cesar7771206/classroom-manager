'use client'

import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Presentation, ArrowLeft } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          <Presentation size={36} strokeWidth={2.5} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>CLASSROOM MANAGER</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 400, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Sign in to Classroom Manager</h1>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-muted)',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form action={login}>
          <input type="hidden" name="redirectTo" value={searchParams.get('returnTo') || ''} />
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="label-text" htmlFor="email" style={{ fontSize: '0.85rem' }}>Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              placeholder="Ej: cesar@gmail.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="label-text" htmlFor="password" style={{ fontSize: '0.85rem', marginBottom: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                style={{ paddingRight: '3rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            SIGN IN
          </button>
        </form>
      </div>

      <div style={{
        marginTop: '1.25rem',
        padding: '1rem',
        border: '1px solid var(--border-muted)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.875rem'
      }}>
        New to Classroom Manager? <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Create an account</Link>.
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem',
      width: '100%',
      position: 'relative'
    }}>
      <Link
        href="/"
        className="back-link"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-muted)',
          transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={18} />
        <span>Volver al inicio</span>
      </Link>
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
