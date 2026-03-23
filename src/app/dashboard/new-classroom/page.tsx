'use client'

import { createClassroom } from '@/app/actions/classrooms'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CreateClassroomForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '540px', margin: '3rem auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Crear Nueva Aula</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configura el espacio para tus alumnos</p>
      </header>

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

      <form action={createClassroom}>
        <div className="form-group">
          <label className="label-text" htmlFor="name">Nombre del Aula / Curso</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="input-field" 
            placeholder="Ej: Programación Avanzada 2024-1" 
            required 
          />
        </div>

        <div className="form-group">
          <label className="label-text" htmlFor="university">Universidad</label>
          <input 
            type="text" 
            id="university" 
            name="university" 
            className="input-field" 
            placeholder="Ej: Universidad Nacional" 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label-text" htmlFor="period_year">Año</label>
            <input 
              type="number" 
              id="period_year" 
              name="period_year" 
              className="input-field" 
              placeholder="2025" 
              defaultValue={new Date().getFullYear()}
              required 
            />
          </div>

          <div className="form-group">
            <label className="label-text" htmlFor="period_month">Mes / Periodo Referencia</label>
            <input 
              type="text" 
              id="period_month" 
              name="period_month" 
              className="input-field" 
              placeholder="Ej: Marzo" 
              required 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link href="/dashboard" className="btn" style={{ 
            flex: 1, 
            textAlign: 'center', 
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            Crear Aula
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewClassroomPage() {
  return (
    <main style={{ padding: '1.5rem' }}>
      <Suspense fallback={<div>Cargando...</div>}>
         <CreateClassroomForm />
      </Suspense>
    </main>
  )
}
