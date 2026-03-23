'use client'

import { Trash2 } from 'lucide-react'
import { deleteClassroom } from '@/app/actions/classrooms'
import { useState } from 'react'

export function DeleteClassroomButton({ id, name }: { id: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm(`¿Estás seguro de que deseas eliminar el aula "${name}"? Esta acción no se puede deshacer.`)) {
      setIsDeleting(true)
      try {
        await deleteClassroom(id)
      } catch (err) {
        alert('Error al eliminar: ' + (err as Error).message)
        setIsDeleting(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn-icon"
      style={{ color: isDeleting ? 'var(--text-secondary)' : 'var(--danger)', opacity: isDeleting ? 0.5 : 1 }}
      title="Eliminar Aula"
    >
      <Trash2 size={16} />
    </button>
  )
}
