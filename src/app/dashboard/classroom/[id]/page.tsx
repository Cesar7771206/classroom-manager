import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClassroomTabs } from '@/components/classroom/ClassroomTabs'
import Link from 'next/link'
import { EditClassroomModal } from '@/components/classroom/EditClassroomModal'
import { CopyButton } from '@/components/classroom/CopyButton'
import { Hash, User, Calendar, MapPin, ArrowUpRight, Info, UserCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Obtener rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return redirect('/login')

  // Obtener datos del aula usando RLS (si no es suya o no es su docente, fallará o retornará null)
  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('*, delegado:profiles!classrooms_delegado_id_fkey(full_name), classroom_teachers(profiles(full_name))')
    .eq('id', id)
    .single()

  if (classError || !classroom) {
    console.error('Error fetching classroom:', classError)
    return redirect('/dashboard')
  }

  // Ejecutar el resto de las consultas en paralelo para ganar velocidad
  const [studentsRes, evaluationsRes, participationRes, attendanceConfigRes, attendanceRecordsRes] = await Promise.all([
    supabase
      .from('students')
      .select('*')
      .eq('classroom_id', id)
      .order('last_name', { ascending: true }),
    supabase
      .from('evaluations')
      .select('*')
      .eq('classroom_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('participation_records')
      .select(`
        *,
        student:students!inner(first_name, last_name, classroom_id),
        evaluation:evaluations(name, points_worth)
      `)
      .eq('student.classroom_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('attendance_config')
      .select('*')
      .eq('classroom_id', id)
      .single(),
    supabase
      .from('attendance_records')
      .select('*')
      .eq('classroom_id', id)
  ])

  const students = studentsRes.data
  const evaluations = evaluationsRes.data
  const participationRecords = participationRes.data || []
  const attendanceConfig = attendanceConfigRes.data // puede ser null si no se ha configurado
  const attendanceRecords = attendanceRecordsRes.data || []

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Navegación y Header ESTILO NOTION */}
      <header style={{ marginBottom: '3rem' }}>
        <Link
          href="/dashboard"
          className="back-link"
          style={{ marginBottom: '1.5rem' }}
        >
          ← Volver al Dashboard
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em', 
                lineHeight: 1.1,
                textTransform: 'uppercase' 
              }}>
                {classroom.name}
              </h1>
              {profile.role === 'delegado' && (
                <div style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  <EditClassroomModal classroom={classroom} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Propiedad: Universidad */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Universidad</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{classroom.university}</span>
              </div>

              {/* Propiedad: Delegado (Nuevo) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <UserCircle size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Delegado</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {(Array.isArray(classroom.delegado) ? classroom.delegado[0] : classroom.delegado)?.full_name || 'Sin asignar'}
                </span>
              </div>

              {/* Propiedad: Docente */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <User size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Docente</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {classroom.classroom_teachers && classroom.classroom_teachers.length > 0 ? (
                    classroom.classroom_teachers.map((t: any, i: number) => (
                      <span key={i} style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {t.profiles.full_name}{i < classroom.classroom_teachers.length - 1 ? ',' : ''}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin asignar acceso</span>
                  )}
                </div>
              </div>

              {/* Propiedad: Año / Periodo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Periodo</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    color: '#10b981', 
                    padding: '0.15rem 0.6rem', 
                    borderRadius: '4px' 
                  }}>
                    {classroom.period_year}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                    color: '#a855f7', 
                    padding: '0.15rem 0.6rem', 
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {classroom.period_month}
                  </span>
                </div>
              </div>

              {/* Propiedad: Token Access (Solo Delegado) */}
              {profile.role === 'delegado' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Hash size={16} />
                    <span style={{ fontSize: '0.9rem' }}>Token</span>
                    <div className="tooltip-container">
                      <Info size={12} style={{ color: 'var(--text-secondary)', cursor: 'help' }} />
                      <span className="tooltip-text">Código único de acceso para que los alumnos se unan a esta aula.</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1px' }}>
                      {classroom.access_token}
                    </code>
                    <CopyButton text={classroom.access_token} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Componente Cliente que maneja Tabs Interactivos y Formularios */}
      <ClassroomTabs
        classroom={classroom}
        students={students || []}
        evaluations={evaluations || []}
        participationRecords={participationRecords || []}
        attendanceConfig={attendanceConfig}
        attendanceRecords={attendanceRecords}
        role={profile.role}
      />

    </div>
  )
}
