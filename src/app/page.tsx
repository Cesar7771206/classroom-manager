import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Presentation } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import TypingTitle from '@/components/landing/TypingTitle'
import styles from './landing.module.css'

export default async function IndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return redirect('/dashboard')
  }

  return (
    <main className={styles.main}>
      {/* Efecto de fondo premium */}
      <div className={styles.radialGradient} />

      <div className={styles.content}>
        {/* Icono grande centrado con efecto de panel */}
        <div className={styles.logoWrapper}>
          <Presentation size={64} style={{ color: 'white' }} strokeWidth={1.5} />
        </div>

        {/* Título con animación de escritura */}
        <TypingTitle
          text="CLASSROOM MANAGER"
          className={styles.title}
        />

        {/* Descripción corta y elegante */}
        <p className={styles.description}>
          La plataforma definitiva para gestionar tus aulas, evaluaciones, participaciones y asistencia de forma ágil y profesional.
        </p>

        {/* Botones de acción principal */}
        <div className={styles.buttonGroup}>
          <Link href="/login" className="btn btn-primary" style={{ minWidth: '180px', fontSize: '1.1rem', padding: '1rem' }}>
            Iniciar Sesión
          </Link>
          <Link href="/register" className="btn" style={{ minWidth: '180px', fontSize: '1.1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
            Registrarse
          </Link>
        </div>
      </div>

      {/* Detalle decorativo inferior */}
      <div className={styles.footer}>
        © 2026 CLASSROOM MANAGER • QCODE
      </div>
    </main>
  )
}


