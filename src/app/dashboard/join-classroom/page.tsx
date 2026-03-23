'use client'

import { joinClassroom } from '@/app/actions/classrooms'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function JoinClassroomForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '540px', margin: '3rem auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unirse a un Aula</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Introduce el Token compartido por el delegado</p>
      </header>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--danger)', 
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form action={joinClassroom}>
        <div className="form-group">
          <label className="label-text" htmlFor="token">Token de Acceso</label>
          <input 
            type="text" 
            id="token" 
            name="token" 
            className="input-field" 
            placeholder="Ej: 8a7b9c" 
            style={{ 
              textAlign: 'center', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              letterSpacing: '0.25rem',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              border: '1px dashed var(--accent)'
            }}
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
           <Link href="/dashboard" className="btn" style={{ 
            flex: 1, 
            textAlign: 'center', 
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            Atrás
          </Link>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            Conectarse al Aula
          </button>
        </div>
      </form>
    </div>
  )
}

export default function JoinClassroomPage() {
  return (
    <main style={{ padding: '1.5rem' }}>
      <Suspense fallback={<div>Cargando...</div>}>
         <JoinClassroomForm />
      </Suspense>
    </main>
  )
}
