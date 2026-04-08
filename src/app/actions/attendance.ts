'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Guardar configuración de asistencia
// ============================================
export async function saveAttendanceConfig(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const classroom_id = formData.get('classroom_id') as string
  const weeks_count = parseInt(formData.get('weeks_count') as string)
  const sessions_per_week = parseInt(formData.get('sessions_per_week') as string)

  // Validaciones básicas
  if (!classroom_id || !weeks_count || !sessions_per_week) {
    return { success: false, error: 'Faltan campos requeridos.' }
  }

  if (weeks_count < 1 || weeks_count > 30) {
    return { success: false, error: 'Las semanas deben ser entre 1 y 30.' }
  }

  if (sessions_per_week < 1 || sessions_per_week > 7) {
    return { success: false, error: 'Las sesiones por semana deben ser entre 1 y 7.' }
  }

  const { error } = await supabase
    .from('attendance_config')
    .upsert({
      classroom_id,
      weeks_count,
      sessions_per_week
    }, { onConflict: 'classroom_id' })

  if (error) {
    console.error('Error saving attendance config:', error)
    return { success: false, error: 'Error al guardar la configuración.' }
  }

  revalidatePath(`/dashboard/classroom/${classroom_id}`)
  return { success: true }
}

// ============================================
// Guardar asistencia de una sesión completa
// ============================================
export async function saveAttendanceRecords(
  classroom_id: string,
  week_number: number,
  session_number: number,
  records: { student_id: string; is_present: boolean }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  if (!classroom_id || !week_number || !session_number || records.length === 0) {
    return { success: false, error: 'Datos incompletos.' }
  }

  // Preparamos los registros para upsert masivo
  const upsertData = records.map(r => ({
    classroom_id,
    student_id: r.student_id,
    week_number,
    session_number,
    is_present: r.is_present
  }))

  // Upsert: si el registro ya existe (por el UNIQUE constraint), lo actualiza
  const { error } = await supabase
    .from('attendance_records')
    .upsert(upsertData, {
      onConflict: 'classroom_id,student_id,week_number,session_number'
    })

  if (error) {
    console.error('Error saving attendance records:', error)
    return { success: false, error: 'Error al guardar la asistencia.' }
  }

  revalidatePath(`/dashboard/classroom/${classroom_id}`)
  return { success: true }
}
