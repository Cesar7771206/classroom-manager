'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addParticipation(formData: FormData) {
  const studentId = formData.get('student_id') as string
  const evaluationId = formData.get('evaluation_id') as string
  const points = formData.get('points') as string
  const notes = formData.get('notes') as string
  const classroomId = formData.get('classroom_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autorizado' }

  const { error } = await supabase.from('participation_records').insert({
    student_id: studentId,
    evaluation_id: evaluationId,
    points: Number(points),
    notes: notes || null,
    recorded_by: user.id
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function deleteParticipation(participationId: string, classroomId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('participation_records')
    .delete()
    .eq('id', participationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function updateParticipation(formData: FormData) {
  const participationId = formData.get('participation_id') as string
  const studentId = formData.get('student_id') as string
  const evaluationId = formData.get('evaluation_id') as string
  const points = formData.get('points') as string
  const notes = formData.get('notes') as string
  const classroomId = formData.get('classroom_id') as string

  const supabase = await createClient()

  const { error } = await supabase
    .from('participation_records')
    .update({
      student_id: studentId,
      evaluation_id: evaluationId,
      points: Number(points),
      notes: notes || null
    })
    .eq('id', participationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}
