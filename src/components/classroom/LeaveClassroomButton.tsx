'use client'

import { useState } from 'react'
import { LogOut, X, AlertCircle } from 'lucide-react'
import { leaveClassroom } from '@/app/actions/classrooms'

export function LeaveClassroomButton({ id, name }: { id: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleLeave = async () => {
    setIsLeaving(true)
    try {
      const result = await leaveClassroom(id)
      if (result.success) {
        // Redirigir inmediatamente y forzar recarga si es necesario
        window.location.href = '/dashboard'
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Error al abandonar el aula')
      setIsLeaving(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-icon"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        }}
        title="Abandonar Aula"
      >
        <LogOut size={16} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)',
          padding: '20.0px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100.0%',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <AlertCircle size={32} color="var(--danger)" />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>¿Abandonar Aula?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Ya no tendrás acceso a los datos de <strong>{name}</strong>. Podrás unirte de nuevo si tienes el link.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={isLeaving}
              >
                Cancelar
              </button>
              <button 
                onClick={handleLeave}
                className="btn btn-danger"
                style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white' }}
                disabled={isLeaving}
              >
                {isLeaving ? 'Saliendo...' : 'Abandonar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
