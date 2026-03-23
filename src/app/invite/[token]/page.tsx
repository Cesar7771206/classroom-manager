import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { X } from 'lucide-react'
import Link from 'next/link'
import styles from './invite.module.css'
import { InviteCard } from '@/components/classroom/InviteCard'

export default async function InvitePage({ params }: { params: { token: string } }) {
  const { token } = await params
  const supabase = await createClient()

  // 1. Fetch classroom data
  const { data: classroom, error } = await supabase
    .from('classrooms')
    .select(`
      id,
      name,
      university,
      period_year,
      period_month,
      delegado:delegado_id(full_name),
      students(id)
    `)
    .eq('access_token', token)
    .maybeSingle() // Usar maybeSingle para evitar errores de 0 filas

  if (error || !classroom) {
    if (error) console.error('Error fetching invite:', error)
    return (
      <main className={styles.container}>
        <div className={styles.bgBlur} />
        <div className={styles.card}>
          <div className={styles.errorIcon}>
            <X size={48} />
          </div>
          <h1>Invitación Inválida</h1>
          <p>Este enlace de invitación ha expirado o es incorrecto.</p>
          {error && <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>{error.message}</p>}
          <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Volver al Inicio</Link>
        </div>
      </main>
    )
  }

  // 2. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  // Extraer el nombre del delegado de forma segura
  const delegadoData = Array.isArray(classroom.delegado) ? classroom.delegado[0] : classroom.delegado
  const delegadoName = delegadoData?.full_name || 'Alguien'

  return (
    <main className={styles.container}>
      {/* Background effect */}
      <div className={styles.bgBlur} />
      
      {!user ? (
        <InviteCard 
          classroomName={classroom.name}
          delegadoName={delegadoName}
          university={classroom.university}
          period={`${classroom.period_year} • ${classroom.period_month}`}
          studentCount={classroom.students?.length || 0}
          token={token}
          isPreview={false}
        >
          <div className={styles.authRequired}>
            <p>Debes iniciar sesión para unirte a esta clase.</p>
            <Link href={`/login?returnTo=/invite/${token}`} className={styles.btnJoin}>
              Iniciar Sesión para Unirme
            </Link>
          </div>
        </InviteCard>
      ) : (
        <InviteCard 
          classroomName={classroom.name}
          delegadoName={delegadoName}
          university={classroom.university}
          period={`${classroom.period_year} • ${classroom.period_month}`}
          studentCount={classroom.students?.length || 0}
          token={token}
          isPreview={false}
        >
          <form action={async (formData: FormData) => {
            'use server'
            const { joinClassroom } = await import('@/app/actions/classrooms')
            await joinClassroom(formData)
          }}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className={styles.btnJoin}>
              Aceptar como {userProfile?.full_name || 'Docente'}
            </button>
          </form>
          <Link href="/dashboard" className={styles.btnReject}>
             No, gracias (Rechazar)
          </Link>
        </InviteCard>
      )}
    </main>
  )
}

