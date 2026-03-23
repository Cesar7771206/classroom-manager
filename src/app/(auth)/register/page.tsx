'use client'

import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Presentation, ArrowLeft } from 'lucide-react'

function RegisterForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [role, setRole] = useState<'delegado' | 'docente'>('delegado')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 400, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Sign up to Classroom Manager</h1>
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

        <form action={signup}>
          <input type="hidden" name="redirectTo" value={searchParams.get('returnTo') || ''} />
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="label-text" htmlFor="full_name" style={{ fontSize: '0.85rem' }}>Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="input-field"
              placeholder="Juan Perez"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="label-text" htmlFor="email" style={{ fontSize: '0.85rem' }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              placeholder="juan@ejemplo.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label-text" htmlFor="password" style={{ fontSize: '0.85rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="input-field"
                placeholder="Min. 6 caracteres"
                minLength={6}
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

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="label-text" style={{ fontSize: '0.85rem' }}>Select Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="radio"
                  name="role"
                  id="role-delegado"
                  value="delegado"
                  style={{ position: 'absolute', opacity: 0 }}
                  checked={role === 'delegado'}
                  onChange={() => setRole('delegado')}
                  required
                />
                <label
                  htmlFor="role-delegado"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${role === 'delegado' ? 'var(--accent)' : 'var(--border-muted)'}`,
                    background: role === 'delegado' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                    color: role === 'delegado' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🎓</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Delegado</span>
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="radio"
                  name="role"
                  id="role-docente"
                  value="docente"
                  style={{ position: 'absolute', opacity: 0 }}
                  checked={role === 'docente'}
                  onChange={() => setRole('docente')}
                />
                <label
                  htmlFor="role-docente"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${role === 'docente' ? 'var(--accent)' : 'var(--border-muted)'}`,
                    background: role === 'docente' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                    color: role === 'docente' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🧑‍🏫</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Docente</span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            CREATE ACCOUNT
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
        Already have an account? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>.
      </div>
    </div>
  )
}

export default function RegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </main>
  )
}
