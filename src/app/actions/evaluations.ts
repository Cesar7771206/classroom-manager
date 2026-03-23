'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addEvaluation(formData: FormData) {
  const classroomId = formData.get('classroom_id') as string
  const name = formData.get('name') as string
  const pointsWorth = Number(formData.get('points_worth')) || 1
  
  const supabase = await createClient()

  // Seguridad y Validaciones RLS protegidas
  const { error } = await supabase.from('evaluations').insert({
    classroom_id: classroomId,
    name: name,
    points_worth: pointsWorth
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Refrescamos la ruta para renderizar la nueva evaluación al instante
  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function deleteEvaluation(evaluationId: string, classroomId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', evaluationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function updateEvaluation(formData: FormData) {
  const evaluationId = formData.get('evaluation_id') as string
  const classroomId = formData.get('classroom_id') as string
  const name = formData.get('name') as string
  const pointsWorth = Number(formData.get('points_worth')) || 1

  const supabase = await createClient()

  const { error } = await supabase
    .from('evaluations')
    .update({ 
      name,
      points_worth: pointsWorth
    })
    .eq('id', evaluationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}
