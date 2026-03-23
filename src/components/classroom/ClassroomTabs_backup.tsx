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
  Plus
} from 'lucide-react'
import { addStudent, deleteStudent, updateStudent } from '@/app/actions/students'
import { addEvaluation, deleteEvaluation, updateEvaluation } from '@/app/actions/evaluations'
import { addParticipation, deleteParticipation, updateParticipation } from '@/app/actions/participation'

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

  // Estados para edición
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null)
  const [editingPartId, setEditingPartId] = useState<string | null>(null)

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
    setIsSubmitting(false)
  }

  const handleUpdateStudent = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateStudent(formData)
    if (result.success) setEditingStudentId(null)
    else setErrorMSG(result.error || 'Error al actualizar.')
    setIsSubmitting(false)
  }

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evaluación?')) return
    setIsSubmitting(true)
    const result = await deleteEvaluation(id, classroom.id)
    if (!result.success) setErrorMSG(result.error || 'Error al eliminar.')
    setIsSubmitting(false)
  }

  const handleUpdateEvaluation = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateEvaluation(formData)
    if (result.success) setEditingEvaluationId(null)
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
    setIsSubmitting(false)
  }

  const handleUpdateParticipation = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateParticipation(formData)
    if (result.success) setEditingPartId(null)
    else setErrorMSG(result.error || 'Error al actualizar.')
    setIsSubmitting(false)
  }

  // ==== LOGICA DEL RESUMEN (CALCULO DE PUNTOS) ====
  const summaryData = useMemo(() => {
    // 1. Iniciamos con todos los estudiantes en 0
    const totals: Record<string, { student: any; points: number }> = {}
    students.forEach(s => {
      totals[s.id] = { student: s, points: 0 }
    })

    // 2. Sumamos los puntos de las participaciones
    participationRecords.forEach(rec => {
      if (totals[rec.student_id]) {
        totals[rec.student_id].points += Number(rec.points || 0)
      }
    })

    // 3. Convertimos a arreglo y ordenamos de mayor a menor
    return Object.values(totals).sort((a, b) => b.points - a.points)
  }, [students, participationRecords])

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
          initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >

          {/* TAB: ESTUDIANTES */}
          {activeTab === 'estudiantes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Estudiantes</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {students.length}</span>
              </div>

              {/* Solo el Delegado puede añadir */}
              {role === 'delegado' && (
                <form id="student-form" action={handleAddStudent} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '1rem',
                  marginBottom: '2rem',
                  alignItems: 'end',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <input type="hidden" name="classroom_id" value={classroom.id} />

                  <div>
                    <label className="label-text" htmlFor="first_name">Nombres</label>
                    <input type="text" id="first_name" name="first_name" className="input-field" placeholder="Juan Carlos" required />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="last_name">Apellidos</label>
                    <input type="text" id="last_name" name="last_name" className="input-field" placeholder="Perez Gomez" required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isSubmitting ? 'Añadiendo...' : <><Plus size={18} /> Añadir Alumno</>}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              {/* Lista de Estudiantes */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
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
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={role === 'delegado' ? 4 : 4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          Aún no hay estudiantes en esta aula.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{index + 1}</td>
                          {editingStudentId === student.id ? (
                            <td colSpan={2} style={{ padding: '1rem' }}>
                              <form action={handleUpdateStudent} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="hidden" name="student_id" value={student.id} />
                                <input type="hidden" name="classroom_id" value={classroom.id} />
                                <input type="text" name="first_name" defaultValue={student.first_name} className="input-field-small" required />
                                <input type="text" name="last_name" defaultValue={student.last_name} className="input-field-small" required />
                                <button type="submit" className="btn-icon" title="Guardar"><Save size={16} /></button>
                                <button type="button" onClick={() => setEditingStudentId(null)} className="btn-icon" title="Cancelar"><X size={16} /></button>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td style={{ padding: '1rem', fontWeight: 500 }}>{student.first_name}</td>
                              <td style={{ padding: '1rem', fontWeight: 500 }}>{student.last_name}</td>
                            </>
                          )}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {role === 'delegado' && editingStudentId !== student.id && (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingStudentId(student.id)} className="btn-icon" title="Editar"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteStudent(student.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} /></button>
                              </div>
                            )}
                            {role === 'docente' && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {new Date(student.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Evaluaciones</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {evaluations?.length || 0}</span>
              </div>

              {/* Solo el Delegado puede añadir */}
              {role === 'delegado' && (
                <form id="evaluation-form" action={handleAddEvaluation} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1rem',
                  marginBottom: '2rem',
                  alignItems: 'end',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <input type="hidden" name="classroom_id" value={classroom.id} />

                  <div>
                    <label className="label-text" htmlFor="name">Nombre de la Evaluación</label>
                    <input type="text" id="name" name="name" className="input-field" placeholder="Examen 1" required />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isSubmitting ? 'Creando...' : <><Plus size={18} /> Crear Evaluación</>}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              {/* Lista de Evaluaciones */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Evaluación</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!evaluations || evaluations.length === 0) ? (
                      <tr>
                        <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No hay evaluaciones registradas.
                        </td>
                      </tr>
                    ) : (
                      evaluations.map((evalItem) => (
                        <tr key={evalItem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {editingEvaluationId === evalItem.id ? (
                            <td style={{ padding: '1rem' }}>
                              <form action={handleUpdateEvaluation} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="hidden" name="evaluation_id" value={evalItem.id} />
                                <input type="hidden" name="classroom_id" value={classroom.id} />
                                <input type="text" name="name" defaultValue={evalItem.name} className="input-field-small" style={{ flex: 1 }} required />
                                <button type="submit" className="btn-icon" title="Guardar"><Save size={16} /></button>
                                <button type="button" onClick={() => setEditingEvaluationId(null)} className="btn-icon" title="Cancelar"><X size={16} /></button>
                              </form>
                            </td>
                          ) : (
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{evalItem.name}</td>
                          )}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {role === 'delegado' && editingEvaluationId !== evalItem.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingEvaluationId(evalItem.id)} className="btn-icon" title="Editar"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteEvaluation(evalItem.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} /></button>
                              </div>
                            ) : (
                              role === 'docente' && (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                  {new Date(evalItem.created_at).toLocaleDateString()}
                                </span>
                              )
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PARTICIPACION */}
          {activeTab === 'participacion' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Participación</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: {participationRecords.length} registros</span>
              </div>

              {role === 'delegado' && (
                <form id="participation-form" action={handleAddParticipation} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'end',
                  background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)'
                }}>
                  <input type="hidden" name="classroom_id" value={classroom.id} />
                  <div>
                    <label className="label-text">Estudiante</label>
                    <select name="student_id" className="input-field" required>
                      <option value="">Seleccionar...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Evaluación</label>
                    <select name="evaluation_id" className="input-field" required>
                      <option value="">Seleccionar...</option>
                      {evaluations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Puntos</label>
                    <input type="number" name="points" className="input-field" defaultValue={1} required />
                  </div>
                  <div>
                    <label className="label-text">Notas (Opcional)</label>
                    <input type="text" name="notes" className="input-field" placeholder="Explicación..." />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? '...' : '+ Registro'}
                  </button>
                </form>
              )}

              {errorMSG && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMSG}</p>}

              <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Estudiante</th>
                      <th style={{ padding: '1rem' }}>Evaluación</th>
                      <th style={{ padding: '1rem' }}>Puntos</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participationRecords.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin registros.</td></tr>
                    ) : (
                      participationRecords.map((rec) => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {editingPartId === rec.id ? (
                            <td colSpan={3} style={{ padding: '1rem' }}>
                              <form action={handleUpdateParticipation} style={{ display: 'flex', gap: '0.4rem' }}>
                                <input type="hidden" name="participation_id" value={rec.id} />
                                <input type="hidden" name="classroom_id" value={classroom.id} />
                                <select name="student_id" className="input-field-small" defaultValue={rec.student_id}>
                                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name}</option>)}
                                </select>
                                <select name="evaluation_id" className="input-field-small" defaultValue={rec.evaluation_id}>
                                  {evaluations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <input type="number" name="points" defaultValue={rec.points} className="input-field-small" style={{ width: '60px' }} />
                                <button type="submit" className="btn-icon"><Save size={16} /></button>
                                <button type="button" onClick={() => setEditingPartId(null)} className="btn-icon"><X size={16} /></button>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td style={{ padding: '1rem' }}>{rec.student?.last_name}, {rec.student?.first_name}</td>
                              <td style={{ padding: '1rem' }}>{rec.evaluation?.name}</td>
                              <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 700 }}>+{rec.points}</td>
                            </>
                          )}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {role === 'delegado' && editingPartId !== rec.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingPartId(rec.id)} className="btn-icon"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteParticipation(rec.id)} className="btn-icon"><Trash2 size={16} /></button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(rec.created_at).toLocaleDateString()}</span>
                            )}
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
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{item.points} pts</div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLA GENERAL RECAPITULATORIA */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem', width: '80px' }}>Rank</th>
                      <th style={{ padding: '1rem' }}>Estudiante</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay estudiantes registrados.</td></tr>
                    ) : (
                      summaryData.map((item, index) => (
                        <tr key={item.student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>#{index + 1}</td>
                          <td style={{ padding: '1rem' }}>{item.student.last_name}, {item.student.first_name}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: item.points > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
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
