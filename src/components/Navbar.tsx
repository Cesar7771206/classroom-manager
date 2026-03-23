'use client'

import { signout } from '@/app/actions/auth'
import { Presentation } from 'lucide-react'

export function Navbar({ userName, role }: { userName: string, role: string }) {
  return (
    <nav className="glass-panel" style={{ 
      margin: '1.5rem', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
        <Presentation size={28} strokeWidth={2.5} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>CLASSROOM MANAGER</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{userName}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{role}</p>
        </div>
        
        <form action={signout}>
          <button type="submit" className="btn" style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--danger)',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem'
          }}>
            Cerrar Sesión
          </button>
        </form>
      </div>
    </nav>
  )
}
