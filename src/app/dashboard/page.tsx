import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EditClassroomModal } from '@/components/classroom/EditClassroomModal'
import { DeleteClassroomButton } from '@/components/classroom/DeleteClassroomButton'
import { LeaveClassroomButton } from '@/components/classroom/LeaveClassroomButton'
import { CopyButton } from '@/components/classroom/CopyButton'
import { InvitePreviewModal } from '@/components/classroom/InvitePreviewModal'
import { Plus, Building2, UserCircle, LogOut, ChevronRight, Hash, Copy, Search, Info, Users, MapPin, Calendar, Share2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Obtener sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Ahora sí las aulas con el rol ya conocido
  const { data: classroomsData } = await (profile.role === 'delegado'
    ? supabase
      .from('classrooms')
      .select('*, students(id), delegado:profiles!classrooms_delegado_id_fkey(full_name), classroom_teachers(profiles(id, full_name, role))')
      .eq('delegado_id', user.id)
      .order('created_at', { ascending: false })
    : supabase
      .from('classrooms')
      .select(`
          *,
          students(id),
          delegado:profiles!classrooms_delegado_id_fkey(full_name),
          classroom_teachers!inner(
            profiles(id, full_name, role)
          )
        `)
      .eq('classroom_teachers.teacher_id', user.id)
      .order('created_at', { ascending: false }))

  const classrooms = classroomsData || []

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Navbar userName={profile.full_name} role={profile.role} />

      <main style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '0 0.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Mis Aulas</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {profile.role === 'delegado'
                ? 'Administra las clases donde eres delegado'
                : 'Supervisa el progreso de tus estudiantes'}
            </p>
          </div>

          {profile.role === 'delegado' ? (
            <Link href="/dashboard/new-classroom" className="btn btn-primary">
              + Nueva Aula
            </Link>
          ) : (
            <Link href="/dashboard/join-classroom" className="btn btn-primary">
              + Unirse a un Aula
            </Link>
          )}
        </header>

        {classrooms.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No tienes aulas registradas aún.</p>
            <p>Empieza {profile.role === 'delegado' ? 'creando tu primera aula' : 'uniéndote a una con el token que te dio tu delegado'}.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {classrooms.map((room) => (
              <div key={room.id} className="glass-panel" style={{
                padding: '2rem',
                transition: 'transform 0.2s',
                display: 'block',
                position: 'relative'
              }}>
                <Link href={`/dashboard/classroom/${room.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        background: 'rgba(234, 179, 8, 0.1)',
                        color: 'var(--accent)',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>AULA ACTIVA</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{room.name}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                    {/* Uni */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <MapPin size={14} />
                      <span style={{ fontWeight: 500 }}>{room.university}</span>
                    </div>
                    {/* Periodo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Calendar size={14} />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>{room.period_year}</span>
                        <span>•</span>
                        <span style={{ color: '#a855f7', fontWeight: 700, textTransform: 'uppercase' }}>{room.period_month}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--border-muted)',
                    paddingTop: '0.8rem',
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* Delegado */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <UserCircle size={14} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delegado Responsable:</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {(Array.isArray(room.delegado) ? room.delegado[0] : room.delegado)?.full_name || 'Sin asignar'}
                      </p>
                    </div>

                    {/* Docentes */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Docentes Asignados:</span>
                      </div>

                      {room.classroom_teachers && room.classroom_teachers.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {room.classroom_teachers.map((teacher: any) => (
                            <span key={teacher.profiles?.id} style={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: 'var(--text-secondary)',
                              background: 'rgba(255,255,255,0.03)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {teacher.profiles?.full_name || 'Docente sin nombre'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Sin otros docentes
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                <div style={{ 
                  position: 'absolute', 
                  top: '1.5rem', 
                  right: '1.5rem', 
                  display: 'flex', 
                  gap: '0.3rem',
                  zIndex: 20 
                }}>
                  {profile.role === 'delegado' && (
                    <>
                      <EditClassroomModal classroom={room} />
                      <DeleteClassroomButton id={room.id} name={room.name} />
                    </>
                  )}
                  {profile.role === 'docente' && (
                    <LeaveClassroomButton id={room.id} name={room.name} />
                  )}
                </div>

                {profile.role === 'delegado' && (
                  <div style={{ 
                    marginTop: '1.25rem', 
                    paddingTop: '0.75rem', 
                    borderTop: '1px solid rgba(255,255,255,0.03)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Invitación para docentes
                      </span>
                    </div>
                    <InvitePreviewModal classroom={room} delegadoName={profile.full_name} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
