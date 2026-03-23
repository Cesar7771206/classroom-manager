'use client'

import { useState } from 'react'
import { Pencil, X, Save } from 'lucide-react'
import { updateClassroom } from '@/app/actions/classrooms'

export function EditClassroomModal({ classroom }: { classroom: any }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
        className="btn-icon"
        title="Editar Aula"
      >
        <Pencil size={16} />
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}
    onClick={() => setIsOpen(false)}
    >
      <div 
        className="glass-panel" 
        style={{ padding: '2rem', width: '100%', maxWidth: '500px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Editar Aula</h2>

        <form action={async (formData) => {
          await updateClassroom(formData)
          setIsOpen(false)
        }}>
          <input type="hidden" name="id" value={classroom.id} />
          
          <div className="form-group">
            <label className="label-text">Nombre del Aula</label>
            <input name="name" defaultValue={classroom.name} className="input-field" required />
          </div>

          <div className="form-group">
            <label className="label-text">Universidad</label>
            <input name="university" defaultValue={classroom.university} className="input-field" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label-text">Año</label>
              <input name="period_year" type="number" defaultValue={classroom.period_year} className="input-field" required />
            </div>
            <div className="form-group">
              <label className="label-text">Periodo / Mes</label>
              <input name="period_month" defaultValue={classroom.period_month} className="input-field" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
