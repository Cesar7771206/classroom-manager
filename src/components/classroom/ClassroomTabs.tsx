'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ClipboardCheck,
  MessageSquarePlus,
  BarChart3,
  UserPlus,
  Trophy,
  Medal,
  Award,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  ChevronRight,
  Info,
  Search
} from 'lucide-react'
import { addStudent, deleteStudent, updateStudent } from '@/app/actions/students'
import { addEvaluation, deleteEvaluation, updateEvaluation } from '@/app/actions/evaluations'
import { addParticipation, deleteParticipation, updateParticipation } from '@/app/actions/participation'
import { TagSelect, TagBadge } from './TagSelect'
import { SearchableSelect } from './SearchableSelect'

type TabType = 'resumen' | 'estudiantes' | 'evaluaciones' | 'participacion'

interface ClassroomTabsProps {
  classroom: any
  students: any[]
  evaluations: any[]
  participationRecords: any[]
  role: string
}

export function ClassroomTabs({ classroom, students, evaluations, participationRecords, role }: ClassroomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('estudiantes')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMSG, setErrorMSG] = useState('')

  // Buscadores generales
  const [studentSearch, setStudentSearch] = useState('')
  const [evalSearch, setEvalSearch] = useState('')

  // Estados para edición
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [editingEvaluation, setEditingEvaluation] = useState<any | null>(null)
  const [editingPart, setEditingPart] = useState<any | null>(null)

  const motivosExistentes = useMemo(() => Array.from(new Set(participationRecords.map(r => r.notes).filter(Boolean))), [participationRecords])

  // Filtrado de listas
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase())
    )
  }, [students, studentSearch])

  const filteredEvaluations = useMemo(() => {
    return (evaluations || []).filter(e => 
      e.name.toLowerCase().includes(evalSearch.toLowerCase())
    )
  }, [evaluations, evalSearch])

  const handleAddStudent = async (formData: FormData) => {
    setIsSubmitting(true)
    setErrorMSG('')

    // Server Action
    const result = await addStudent(formData)

    if (result.success) {
      // Limpiar el form si el user usara un ref, pero FormData limpia campos naturalmente si usamos reset en onSubmit
      const form = document.getElementById('student-form') as HTMLFormElement
      form?.reset()
    } else {
      setErrorMSG(result.error || 'Ocurrió un error al añadir al estudiante.')
    }

    setIsSubmitting(false)
  }

  const handleAddEvaluation = async (formData: FormData) => {
    setIsSubmitting(true)
    setErrorMSG('')

    const result = await addEvaluation(formData)

    if (result.success) {
      const form = document.getElementById('evaluation-form') as HTMLFormElement
      form?.reset()
    } else {
      setErrorMSG(result.error || 'Ocurrió un error al crear la evaluación.')
    }

    setIsSubmitting(false)
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este estudiante?')) return
    setIsSubmitting(true)
    const result = await deleteStudent(id, classroom.id)
    if (!result.success) setErrorMSG(result.error || 'Error al eliminar.')
    if (editingStudent?.id === id) setEditingStudent(null)
    setIsSubmitting(false)
  }

  const handleUpdateStudent = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateStudent(formData)
    if (result.success) setEditingStudent(null)
    else setErrorMSG(result.error || 'Error al actualizar.')
    setIsSubmitting(false)
  }

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evaluación?')) return
    setIsSubmitting(true)
    const result = await deleteEvaluation(id, classroom.id)
    if (!result.success) setErrorMSG(result.error || 'Error al eliminar.')
    if (editingEvaluation?.id === id) setEditingEvaluation(null)
    setIsSubmitting(false)
  }

  const handleUpdateEvaluation = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateEvaluation(formData)
    if (result.success) setEditingEvaluation(null)
    else setErrorMSG(result.error || 'Error al actualizar.')
    setIsSubmitting(false)
  }

  const handleAddParticipation = async (formData: FormData) => {
    setIsSubmitting(true)
    setErrorMSG('')
    const result = await addParticipation(formData)
    if (result.success) {
      const form = document.getElementById('participation-form') as HTMLFormElement
      form?.reset()
    } else {
      setErrorMSG(result.error || 'Error al registrar participacion.')
    }
    setIsSubmitting(false)
  }

  const handleDeleteParticipation = async (id: string) => {
    if (!confirm('¿Eliminar este registro de puntos?')) return
    setIsSubmitting(true)
    const result = await deleteParticipation(id, classroom.id)
    if (!result.success) setErrorMSG(result.error || 'Error al eliminar.')
    if (editingPart?.id === id) setEditingPart(null)
    setIsSubmitting(false)
  }

  const handleUpdateParticipation = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateParticipation(formData)
    if (result.success) setEditingPart(null)
    else setErrorMSG(result.error || 'Error al actualizar.')
    setIsSubmitting(false)
  }

  // ==== LOGICA DEL RESUMEN (CALCULO DE PUNTOS) ====
  const summaryData = useMemo(() => {
    // 1. Iniciamos con todos los estudiantes en 0
    const totals: Record<string, { student: any; points: number; pointsCM: number }> = {}
    students.forEach(s => {
      totals[s.id] = { student: s, points: 0, pointsCM: 0 }
    })

    // 2. Sumamos los puntos de las participaciones
    participationRecords.forEach(rec => {
      if (totals[rec.student_id]) {
        const rawPoints = Number(rec.points || 0)
        // Obtenemos la tasa de conversión definida para esta evaluación (default 1)
        const conversion = Number((rec.evaluation as any)?.points_worth || 1)

        // Sumamos Puntos CM (raw)
        totals[rec.student_id].pointsCM += rawPoints

        // Sumamos Puntos EVAL (según la conversión)
        totals[rec.student_id].points += (rawPoints / conversion)
      }
    })

    // 3. Convertimos a arreglo, formateamos y ordenamos por Puntos de Evaluación (reales)
    const data = Object.values(totals).map(item => ({
      ...item,
      points: Number(item.points.toFixed(2)), // Redondeo para evitar errores de coma flotante
      pointsCM: Number(item.pointsCM.toFixed(1))
    }))

    return data.sort((a, b) => b.points - a.points)
  }, [students, participationRecords])

  // Componentes memorizados para las filas de las tablas
  const StudentRow = useMemo(() => ({ student, index }: { student: any, index: number }) => (
    <tr key={student.id} style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: editingStudent?.id === student.id ? 'rgba(255,255,255,0.05)' : 'transparent'
    }}>
      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{index + 1}</td>
      <td style={{ padding: '1rem', fontWeight: 500 }}>{student.first_name}</td>
      <td style={{ padding: '1rem', fontWeight: 500 }}>{student.last_name}</td>
      <td style={{ padding: '1rem', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button onClick={() => {
            setEditingStudent(student)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }} className="btn-icon" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => handleDeleteStudent(student.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} /></button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
            {new Date(student.created_at).toLocaleDateString()}
          </span>
        </div>
      </td>
    </tr>
  ), [editingStudent, handleDeleteStudent])

  const EvaluationRow = useMemo(() => ({ evalItem }: { evalItem: any }) => (
    <tr key={evalItem.id} style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: editingEvaluation?.id === evalItem.id ? 'rgba(255,255,255,0.05)' : 'transparent'
    }}>
      <td style={{ padding: '1rem', fontWeight: 600 }}>{evalItem.name}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <span style={{ fontWeight: 800 }}>{evalItem.points_worth}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>pts CM</span>
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 800, color: 'var(--accent)' }}>1.0</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>pt EVAL</span>
        </div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button onClick={() => {
            setEditingEvaluation(evalItem)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }} className="btn-icon" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => handleDeleteEvaluation(evalItem.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} /></button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
            {new Date(evalItem.created_at).toLocaleDateString()}
          </span>
        </div>
      </td>
    </tr>
  ), [editingEvaluation, handleDeleteEvaluation])

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Navegación por pestañas ESTILO SCROLLXUI */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        marginBottom: '2.5rem',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.3rem',
        borderRadius: 'var(--radius-lg)',
        width: 'fit-content',
        border: '1px solid var(--border-muted)'
      }}>
        {(['resumen', 'estudiantes', 'evaluaciones', 'participacion'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab
          const icons = {
            resumen: <BarChart3 size={18} />,
            estudiantes: <Users size={18} />,
            evaluaciones: <ClipboardCheck size={18} />,
            participacion: <MessageSquarePlus size={18} />
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                position: 'relative',
                padding: '0.6rem 1.25rem',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                transition: 'color 0.3s ease',
                zIndex: 1
              }}
            >
              {icons[tab as keyof typeof icons]}
              <span style={{ textTransform: 'capitalize' }}>{tab}</span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >

          {/* TAB: ESTUDIANTES */}
          {activeTab === 'estudiantes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Estudiantes</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {students.length}</span>
                </div>
                
                {/* BUSCADOR GENERAL ESTUDIANTES */}
                <div style={{ position: 'relative', minWidth: '250px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar estudiante por nombre..." 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* CRUD: Disponible para ambos ahora */}
              {(role === 'docente' || role === 'delegado') && (
                <form
                  id="student-form"
                  key={editingStudent ? editingStudent.id : 'new-student'}
                  action={editingStudent ? handleUpdateStudent : handleAddStudent}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: editingStudent ? '1fr 1fr auto auto' : '1fr 1fr auto',
                    gap: '1rem',
                    marginBottom: '2rem',
                    alignItems: 'end',
                    background: editingStudent ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: editingStudent ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid transparent',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {editingStudent && <input type="hidden" name="student_id" value={editingStudent.id} />}
                  <input type="hidden" name="classroom_id" value={classroom.id} />

                  <div>
                    <label className="label-text" htmlFor="first_name">Nombres</label>
                    <input type="text" id="first_name" name="first_name" className="input-field" placeholder="Juan Carlos" defaultValue={editingStudent?.first_name} required />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="last_name">Apellidos</label>
                    <input type="text" id="last_name" name="last_name" className="input-field" placeholder="Perez Gomez" defaultValue={editingStudent?.last_name} required />
                  </div>

                  {editingStudent && (
                    <button type="button" onClick={() => setEditingStudent(null)} className="btn" style={{ height: '42px', padding: '0 1rem', background: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)' }}>
                      Cancelar
                    </button>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                    {isSubmitting ? '...' : editingStudent ? <><Save size={18} /> Actualizar</> : <><Plus size={18} /> Añadir Alumno</>}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              {/* Lista de Estudiantes */}
              <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>#</th>
                      <th style={{ padding: '1rem' }}>Nombres</th>
                      <th style={{ padding: '1rem' }}>Apellidos</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {studentSearch ? 'No se encontraron estudiantes con ese nombre.' : 'Aún no hay estudiantes en esta aula.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <StudentRow key={student.id} student={student} index={index} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: EVALUACIONES */}
          {activeTab === 'evaluaciones' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Evaluaciones</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {evaluations?.length || 0}</span>
                </div>

                {/* BUSCADOR GENERAL EVALUACIONES */}
                <div style={{ position: 'relative', minWidth: '250px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar evaluación..." 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={evalSearch}
                    onChange={(e) => setEvalSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* CRUD: Disponible para ambos ahora */}
              {(role === 'docente' || role === 'delegado') && (
                <form
                  id="evaluation-form"
                  key={editingEvaluation ? editingEvaluation.id : 'new-eval'}
                  action={editingEvaluation ? handleUpdateEvaluation : handleAddEvaluation}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: editingEvaluation ? '1.5fr 1fr auto auto' : '1.5fr 1fr auto',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    alignItems: 'end',
                    background: editingEvaluation ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: editingEvaluation ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid transparent',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {editingEvaluation && <input type="hidden" name="evaluation_id" value={editingEvaluation.id} />}
                  <input type="hidden" name="classroom_id" value={classroom.id} />

                  <div>
                    <label className="label-text" htmlFor="name">Nombre de la Evaluación</label>
                    <input type="text" id="name" name="name" className="input-field" placeholder='PC1, Examen Parcial...' defaultValue={editingEvaluation?.name} required />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <label className="label-text" style={{ marginBottom: 0 }}>Equivalencia Puntos</label>
                      <div className="tooltip-container">
                        <Info size={14} style={{ color: 'var(--text-secondary)', cursor: 'help' }} />
                        <span className="tooltip-text">Puntos Classroom Manager (CM) = 1 Punto Evaluación</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          step="0.1"
                          name="points_worth"
                          className="input-field"
                          style={{ border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1rem', fontWeight: 800 }}
                          defaultValue={editingEvaluation?.points_worth || 2}
                          required
                        />
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase', marginTop: '-4px' }}>pts CM</div>
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>=</div>

                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>1.0</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>pt EVAL</div>
                      </div>
                    </div>
                  </div>

                  {editingEvaluation && (
                    <button type="button" onClick={() => setEditingEvaluation(null)} className="btn" style={{ height: '42px', padding: '0 1rem', background: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)' }}>
                      Cancelar
                    </button>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                    {isSubmitting ? '...' : editingEvaluation ? <><Save size={18} /> Guardar</> : <><Plus size={18} /> Crear</>}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              {/* Lista de Evaluaciones */}
              <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Evaluación</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Convertidor de Puntos</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvaluations.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {evalSearch ? 'No se encontró la evaluación buscada.' : 'No hay evaluaciones registradas.'}
                        </td>
                      </tr>
                    ) : (
                      filteredEvaluations.map((evalItem) => (
                        <EvaluationRow key={evalItem.id} evalItem={evalItem} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'participacion' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Participación</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {participationRecords.length} registros</span>
              </div>

              {(role === 'delegado' || role === 'docente') && (
                <form
                  id="participation-form"
                  key={editingPart ? editingPart.id : 'new-part'}
                  action={editingPart ? handleUpdateParticipation : handleAddParticipation}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: editingPart ? '1.2fr 1fr 100px 1.2fr auto auto' : '1.2fr 1fr 100px 1.2fr auto',
                    gap: '1rem',
                    marginBottom: '2rem',
                    alignItems: 'end',
                    background: editingPart ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: editingPart ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid transparent',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {editingPart && <input type="hidden" name="participation_id" value={editingPart.id} />}
                  <input type="hidden" name="classroom_id" value={classroom.id} />
                  
                  <div>
                    <label className="label-text">Estudiante</label>
                    <SearchableSelect 
                      name="student_id"
                      placeholder="Buscar alumno..."
                      options={students.map(s => ({ value: s.id, label: `${s.last_name}, ${s.first_name}` }))}
                      defaultValue={editingPart?.student_id}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label-text">Evaluación</label>
                    <SearchableSelect 
                      name="evaluation_id"
                      placeholder="Seleccionar PC..."
                      options={(evaluations || []).map(e => ({ value: e.id, label: e.name }))}
                      defaultValue={editingPart?.evaluation_id}
                      required
                    />
                  </div>

                  <div>
                    <label className="label-text">Puntos CM</label>
                    <input type="number" name="points" className="input-field" defaultValue={editingPart?.points || 1} required />
                  </div>
                  <div>
                    <label className="label-text">Motivo</label>
                    <TagSelect name="notes" existingTags={motivosExistentes} defaultValue={editingPart?.notes} />
                  </div>

                  {editingPart && (
                    <button type="button" onClick={() => setEditingPart(null)} className="btn" style={{ height: '42px', padding: '0 1rem', background: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)' }}>
                      Cancelar
                    </button>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                    {isSubmitting ? '...' : editingPart ? <><Save size={18} /> Actualizar</> : <><Plus size={18} /> Registro</>}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Estudiante</th>
                      <th style={{ padding: '1rem' }}>Evaluación</th>
                      <th style={{ padding: '1rem' }}>Motivo</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Puntos CM</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participationRecords.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin registros.</td></tr>
                    ) : (
                      participationRecords.map((rec) => (
                        <tr key={rec.id} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: editingPart?.id === rec.id ? 'rgba(234, 179, 8, 0.05)' : 'transparent'
                        }}>
                          <td style={{ padding: '1rem' }}>{rec.student?.last_name}, {rec.student?.first_name}</td>
                          <td style={{ padding: '1rem' }}>{rec.evaluation?.name}</td>
                          <td style={{ padding: '1rem' }}>
                            {rec.notes ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {rec.notes}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-primary)' }}>+{rec.points}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>CM</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button onClick={() => {
                                setEditingPart(rec)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }} className="btn-icon" title="Editar"><Pencil size={16} /></button>
                              <button onClick={() => handleDeleteParticipation(rec.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} /></button>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{new Date(rec.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: RESUMEN (FINAL) */}
          {activeTab === 'resumen' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Resumen General de Puntos</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alumnos: {students.length}</span>
              </div>

              {/* TOP 3 PODIUM */}
              {summaryData.length > 0 && summaryData[0].points > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {summaryData.slice(0, 3).map((item, index) => (
                    <div key={item.student.id} style={{
                      background: index === 0 ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1))' : 'rgba(255,255,255,0.03)',
                      border: index === 0 ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.student.first_name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{item.student.last_name}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{item.points} pts</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Puntos de Evaluación</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>{item.pointsCM} <small style={{ color: 'var(--text-secondary)' }}>CM</small></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLA GENERAL RECAPITULATORIA */}
              <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem', width: '80px' }}>Rank</th>
                      <th style={{ padding: '1rem' }}>Estudiante</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total CM</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Puntos de Evaluación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin registros.</td></tr>
                    ) : (
                      summaryData.map((item, index) => (
                        <tr key={item.student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>#{index + 1}</td>
                          <td style={{ padding: '1rem' }}>{item.student.last_name}, {item.student.first_name}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                            {item.pointsCM}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: item.points > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {item.points}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
