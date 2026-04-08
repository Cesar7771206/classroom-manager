'use client'

import { useState, useMemo, useCallback } from 'react'
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
  Search,
  CalendarCheck,
  Settings,
  Check,
  XCircle,
  Download
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { addStudent, deleteStudent, updateStudent } from '@/app/actions/students'
import { addEvaluation, deleteEvaluation, updateEvaluation } from '@/app/actions/evaluations'
import { addParticipation, deleteParticipation, updateParticipation } from '@/app/actions/participation'
import { saveAttendanceConfig, saveAttendanceRecords } from '@/app/actions/attendance'
import { TagSelect, TagBadge } from './TagSelect'
import { SearchableSelect } from './SearchableSelect'

type TabType = 'resumen' | 'estudiantes' | 'evaluaciones' | 'participacion' | 'asistencia'

function CircularProgress({ percentage, size = 60 }: { percentage: number, size?: number }) {
  const radius = (size / 2) - 5
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={percentage >= 90 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800 }}>{percentage}%</span>
    </div>
  )
}

interface ClassroomTabsProps {
  classroom: any
  students: any[]
  evaluations: any[]
  participationRecords: any[]
  attendanceConfig: any | null
  attendanceRecords: any[]
  role: string
}

export function ClassroomTabs({ classroom, students, evaluations, participationRecords, attendanceConfig, attendanceRecords, role }: ClassroomTabsProps) {
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

  // === ASISTENCIA ===
  // Helper: calcula el estado de asistencia a partir de los datos del server (props)
  const computeAttendance = (week: number, session: number) => {
    const state: Record<string, boolean> = {}
    const existingRecords = attendanceRecords.filter(
      (r: any) => r.week_number === week && r.session_number === session
    )

    if (existingRecords.length > 0) {
      existingRecords.forEach((r: any) => {
        state[r.student_id] = r.is_present
      })
      // Estudiantes nuevos sin registro → presentes
      students.forEach(s => {
        if (!(s.id in state)) state[s.id] = true
      })
    } else {
      // Sin registros → todos presentes por defecto
      students.forEach(s => { state[s.id] = true })
    }
    return state
  }

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedSession, setSelectedSession] = useState(1)
  // Inicializar directamente desde los datos del server (Semana 1, Sesión 1)
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>(
    () => attendanceConfig ? computeAttendance(1, 1) : {}
  )
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [attendanceMsg, setAttendanceMsg] = useState('')

  // Recalcular asistencia al cambiar de semana/sesión
  const handleWeekChange = (week: number) => {
    setSelectedWeek(week)
    setAttendanceMsg('')
    setAttendanceState(computeAttendance(week, selectedSession))
  }

  const handleSessionChange = (session: number) => {
    setSelectedSession(session)
    setAttendanceMsg('')
    setAttendanceState(computeAttendance(selectedWeek, session))
  }

  // Toggle asistencia de un estudiante
  const toggleAttendance = (studentId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }))
  }

  // Guardar asistencia de la sesión actual
  const handleSaveAttendance = async () => {
    setSavingAttendance(true)
    setAttendanceMsg('')

    const records = Object.entries(attendanceState).map(([student_id, is_present]) => ({
      student_id,
      is_present
    }))

    const result = await saveAttendanceRecords(
      classroom.id,
      selectedWeek,
      selectedSession,
      records
    )

    if (result.success) {
      setAttendanceMsg('✅ Asistencia guardada correctamente.')
    } else {
      setAttendanceMsg(`❌ ${result.error}`)
    }

    setSavingAttendance(false)
  }

  // Guardar config de asistencia
  const handleSaveConfig = async (formData: FormData) => {
    setIsSubmitting(true)
    setErrorMSG('')
    const result = await saveAttendanceConfig(formData)
    if (!result.success) {
      setErrorMSG(result.error || 'Error al guardar configuración.')
    }
    setIsSubmitting(false)
  }

  // Estadísticas de asistencia por sesión
  const attendanceStats = useMemo(() => {
    const presentCount = Object.values(attendanceState).filter(v => v).length
    const absentCount = Object.values(attendanceState).filter(v => !v).length
    return { presentCount, absentCount, total: presentCount + absentCount }
  }, [attendanceState])

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

  // ==== LOGICA DEL RESUMEN (CALCULO DE PUNTOS, NOTAS POR EVAL Y ASISTENCIA) ====
  const summaryData = useMemo(() => {
    // 1. Iniciamos con todos los estudiantes
    const totals: Record<string, {
      student: any;
      pointsCM: number;
      presentCount: number;
      evalGrades: Record<string, { pointsCM: number; realPoints: number }>
    }> = {}
    students.forEach(s => {
      totals[s.id] = { student: s, pointsCM: 0, presentCount: 0, evalGrades: {} }
    })

    // 2. Sumamos puntos CM por participación Y agrupamos por evaluación
    participationRecords.forEach(rec => {
      if (totals[rec.student_id]) {
        const pts = Number(rec.points || 0)
        totals[rec.student_id].pointsCM += pts

        // Agrupar por evaluación para desglose
        const evalId = rec.evaluation_id
        if (evalId) {
          if (!totals[rec.student_id].evalGrades[evalId]) {
            totals[rec.student_id].evalGrades[evalId] = { pointsCM: 0, realPoints: 0 }
          }
          totals[rec.student_id].evalGrades[evalId].pointsCM += pts
        }
      }
    })

    // 2.5 Calculamos puntos reales por evaluación
    // Creamos un mapa rápido de evaluaciones para lookup
    const evalMap: Record<string, any> = {}
    ;(evaluations || []).forEach(e => { evalMap[e.id] = e })

    Object.values(totals).forEach(item => {
      Object.keys(item.evalGrades).forEach(evalId => {
        const evalDef = evalMap[evalId]
        const pointsWorth = evalDef?.points_worth || 2
        item.evalGrades[evalId].realPoints = Number(
          (item.evalGrades[evalId].pointsCM / pointsWorth).toFixed(2)
        )
      })
    })

    // 3. Calculamos asistencia
    const totalCourseSessions = attendanceConfig 
      ? (attendanceConfig.weeks_count * attendanceConfig.sessions_per_week)
      : 0

    // Contamos inasistencias (faltas) por estudiante
    attendanceRecords.forEach(rec => {
      if (totals[rec.student_id] && !rec.is_present) {
        totals[rec.student_id].presentCount += 1
      }
    })

    // 4. Convertimos a arreglo y calculamos porcentaje
    const data = Object.values(totals).map(item => {
      const absentCount = item.presentCount
      const attendancePercentage = totalCourseSessions > 0 
        ? Math.round(((totalCourseSessions - absentCount) / totalCourseSessions) * 100)
        : 100

      return {
        ...item,
        attendancePercentage: Math.max(0, attendancePercentage),
        pointsCM: Number(item.pointsCM.toFixed(1))
      }
    })

    // Ordenamos por Puntaje CM para el podio
    return data.sort((a, b) => b.pointsCM - a.pointsCM)
  }, [students, evaluations, participationRecords, attendanceRecords, attendanceConfig])

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
        {(['resumen', 'estudiantes', 'evaluaciones', 'participacion', 'asistencia'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab
          const icons = {
            resumen: <BarChart3 size={18} />,
            estudiantes: <Users size={18} />,
            evaluaciones: <ClipboardCheck size={18} />,
            participacion: <MessageSquarePlus size={18} />,
            asistencia: <CalendarCheck size={18} />
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
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Puntos Reales</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participationRecords.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin registros.</td></tr>
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
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontWeight: 800 }}>
                                <span>+{(rec.points / (rec.evaluation?.points_worth || 2)).toFixed(2)}</span>
                                <Trophy size={12} />
                              </div>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>pts reales</span>
                            </div>
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

          {/* TAB: ASISTENCIA */}
          {activeTab === 'asistencia' && (
            <div>
              {/* Si NO hay config, mostrar formulario de configuración */}
              {!attendanceConfig ? (
                <div>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Settings size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Configurar Asistencia</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                      Para comenzar a registrar asistencia, define cuántas semanas y sesiones por semana tiene este curso.
                    </p>
                  </div>

                  <form
                    action={handleSaveConfig}
                    style={{
                      maxWidth: '400px',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '2rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-muted)'
                    }}
                  >
                    <input type="hidden" name="classroom_id" value={classroom.id} />

                    <div>
                      <label className="label-text" htmlFor="weeks_count">¿Cuántas semanas tiene el curso?</label>
                      <input
                        type="number"
                        id="weeks_count"
                        name="weeks_count"
                        className="input-field"
                        placeholder="Ej: 16"
                        min={1}
                        max={30}
                        required
                      />
                    </div>

                    <div>
                      <label className="label-text" htmlFor="sessions_per_week">¿Cuántas sesiones por semana?</label>
                      <input
                        type="number"
                        id="sessions_per_week"
                        name="sessions_per_week"
                        className="input-field"
                        placeholder="Ej: 2"
                        min={1}
                        max={7}
                        required
                      />
                    </div>

                    {errorMSG && <p style={{ color: 'var(--danger)' }}>{errorMSG}</p>}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {isSubmitting ? '...' : <><Save size={18} /> Guardar Configuración</>}
                    </button>
                  </form>
                </div>
              ) : (
                /* Si SÍ hay config, mostrar la vista de asistencia */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registro de Asistencia</h2>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {attendanceConfig.weeks_count} semanas · {attendanceConfig.sessions_per_week} sesiones/semana
                      </span>
                    </div>
                  </div>

                  {/* Selectores de Semana y Sesión */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'end'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label className="label-text">Semana</label>
                      <select
                        className="input-field"
                        value={selectedWeek}
                        onChange={(e) => handleWeekChange(Number(e.target.value))}
                        style={{ cursor: 'pointer' }}
                      >
                        {Array.from({ length: attendanceConfig.weeks_count }, (_, i) => i + 1).map(w => (
                          <option key={w} value={w}>Semana {w}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label className="label-text">Sesión</label>
                      <select
                        className="input-field"
                        value={selectedSession}
                        onChange={(e) => handleSessionChange(Number(e.target.value))}
                        style={{ cursor: 'pointer' }}
                      >
                        {Array.from({ length: attendanceConfig.sessions_per_week }, (_, i) => i + 1).map(s => (
                          <option key={s} value={s}>Sesión {s}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Estadísticas rápidas */}
                  <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{attendanceStats.presentCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Presentes</div>
                      </div>
                      <div style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{attendanceStats.absentCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ausentes</div>
                      </div>
                      <div style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-muted)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{attendanceStats.total}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</div>
                      </div>
                    </div>

                  {/* Tabla de asistencia */}
                  <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <tr>
                              <th style={{ padding: '1rem', width: '60px' }}>#</th>
                              <th style={{ padding: '1rem' }}>Estudiante</th>
                              <th style={{ padding: '1rem', textAlign: 'center', width: '120px' }}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length === 0 ? (
                              <tr>
                                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                  No hay estudiantes registrados.
                                </td>
                              </tr>
                            ) : (
                              students.map((student, index) => {
                                const isPresent = attendanceState[student.id] ?? true
                                return (
                                  <tr
                                    key={student.id}
                                    onClick={() => toggleAttendance(student.id)}
                                    style={{
                                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                                      cursor: 'pointer',
                                      background: isPresent ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                                      transition: 'background 0.2s ease'
                                    }}
                                  >
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{index + 1}</td>
                                    <td style={{
                                      padding: '1rem',
                                      fontWeight: 500,
                                      textDecoration: isPresent ? 'none' : 'line-through',
                                      opacity: isPresent ? 1 : 0.5,
                                      transition: 'all 0.2s ease'
                                    }}>
                                      {student.last_name}, {student.first_name}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                      <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background: isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: isPresent ? '#10b981' : '#ef4444',
                                        transition: 'all 0.2s ease'
                                      }}>
                                        {isPresent ? <Check size={14} /> : <XCircle size={14} />}
                                        {isPresent ? 'Presente' : 'Ausente'}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                  </div>

                  {/* Mensaje de feedback */}
                  {attendanceMsg && (
                    <p style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: attendanceMsg.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: attendanceMsg.startsWith('✅') ? '#10b981' : '#ef4444',
                      fontSize: '0.9rem'
                    }}>
                      {attendanceMsg}
                    </p>
                  )}

                  {/* Botón de guardar */}
                  <button
                    onClick={handleSaveAttendance}
                    className="btn btn-primary"
                    disabled={savingAttendance}
                    style={{
                      marginTop: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.75rem'
                    }}
                  >
                    {savingAttendance ? 'Guardando...' : <><Save size={18} /> Guardar Asistencia — Semana {selectedWeek}, Sesión {selectedSession}</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: RESUMEN (FINAL) */}
          {activeTab === 'resumen' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Resumen Académico</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alumnos: {students.length}</span>
                </div>
                <button
                  onClick={() => {
                    // 1. Construir los headers
                    const evalList = evaluations || []
                    const headers = [
                      '#',
                      'Estudiante',
                      ...evalList.map(ev => `${ev.name} (Nota Real)`),
                      ...evalList.map(ev => `${ev.name} (Pts CM)`),
                      'Total CM',
                      'Asistencia %'
                    ]

                    // 2. Construir las filas con datos
                    const rows = summaryData.map((item, index) => {
                      const realGrades = evalList.map(ev => {
                        const grade = item.evalGrades[ev.id]
                        return grade && grade.pointsCM > 0 ? grade.realPoints : 0
                      })
                      const cmGrades = evalList.map(ev => {
                        const grade = item.evalGrades[ev.id]
                        return grade ? grade.pointsCM : 0
                      })
                      return [
                        index + 1,
                        `${item.student.last_name}, ${item.student.first_name}`,
                        ...realGrades,
                        ...cmGrades,
                        item.pointsCM,
                        item.attendancePercentage
                      ]
                    })

                    // 3. Crear el worksheet y workbook
                    const wsData = [headers, ...rows]
                    const ws = XLSX.utils.aoa_to_sheet(wsData)

                    // Ajustar ancho de columnas automáticamente
                    const colWidths = headers.map((h, i) => {
                      const maxLen = Math.max(
                        h.length,
                        ...rows.map(r => String(r[i]).length)
                      )
                      return { wch: Math.min(maxLen + 2, 30) }
                    })
                    ws['!cols'] = colWidths

                    const wb = XLSX.utils.book_new()
                    XLSX.utils.book_append_sheet(wb, ws, 'Resumen')

                    // 4. Descargar el archivo
                    const fileName = `${classroom.name.replace(/\s+/g, '_')}_Resumen.xlsx`
                    XLSX.writeFile(wb, fileName)
                  }}
                  className="btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1.25rem',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Download size={16} />
                  Exportar Excel
                </button>
              </div>

              {/* TOP 3 PODIUM */}
              {summaryData.length > 0 && (summaryData[0].pointsCM > 0 || summaryData[0].attendancePercentage > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {summaryData.slice(0, 3).map((item, index) => (
                    <div key={item.student.id} style={{
                      background: index === 0 ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1))' : 'rgba(255,255,255,0.03)',
                      border: index === 0 ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.student.first_name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{item.student.last_name}</p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
                         <div style={{ textAlign: 'center' }}>
                           <CircularProgress percentage={item.attendancePercentage} size={50} />
                           <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.2rem' }}>Asistencia</span>
                         </div>
                         <div style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>{item.pointsCM}</div>
                           <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Puntos CM</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLA GENERAL RECAPITULATORIA CON NOTAS POR EVALUACIÓN */}
              <div style={{ background: 'transparent', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: evaluations && evaluations.length > 3 ? `${600 + evaluations.length * 120}px` : 'auto' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '1rem', width: '60px', position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 1 }}>Rank</th>
                      <th style={{ padding: '1rem', position: 'sticky', left: '60px', background: 'var(--bg-primary)', zIndex: 1, minWidth: '180px' }}>Estudiante</th>
                      {(evaluations || []).map(ev => (
                        <th key={ev.id} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'center',
                          minWidth: '110px',
                          borderLeft: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ev.name}</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {ev.points_worth} CM = 1 pt
                          </div>
                        </th>
                      ))}
                      <th style={{ padding: '1rem', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Asistencia</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.length === 0 ? (
                      <tr><td colSpan={4 + (evaluations?.length || 0)} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin registros.</td></tr>
                    ) : (
                      summaryData.map((item, index) => (
                        <tr key={item.student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 1 }}>#{index + 1}</td>
                          <td style={{ padding: '1rem', position: 'sticky', left: '60px', background: 'var(--bg-primary)', zIndex: 1 }}>{item.student.last_name}, {item.student.first_name}</td>
                          {(evaluations || []).map(ev => {
                            const grade = item.evalGrades[ev.id]
                            const hasGrade = grade && grade.pointsCM > 0
                            return (
                              <td key={ev.id} style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'center',
                                borderLeft: '1px solid rgba(255,255,255,0.05)'
                              }}>
                                {hasGrade ? (
                                  <div>
                                    <div style={{
                                      fontSize: '1rem',
                                      fontWeight: 800,
                                      color: 'var(--accent)'
                                    }}>
                                      {grade.realPoints.toFixed(2)}
                                    </div>
                                    <div style={{
                                      fontSize: '0.6rem',
                                      color: 'var(--text-secondary)',
                                      marginTop: '2px'
                                    }}>
                                      {grade.pointsCM} CM
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}>—</span>
                                )}
                              </td>
                            )
                          })}
                          <td style={{ padding: '1rem', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <CircularProgress percentage={item.attendancePercentage} size={40} />
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800 }}>
                            {item.pointsCM}
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
