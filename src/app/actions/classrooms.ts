'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClassroom(formData: FormData) {
  const name = formData.get('name') as string
  const university = formData.get('university') as string
  const period_year = parseInt(formData.get('period_year') as string)
  const period_month = formData.get('period_month') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes estar logueado')

  const { data: newClassroom, error } = await supabase.from('classrooms').insert({
    name,
    university,
    period_year,
    period_month,
    delegado_id: user.id
  }).select().single()

  if (error) {
    return redirect('/dashboard/new-classroom?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard', 'layout')
  return redirect(`/dashboard/classroom/${newClassroom.id}`)
}

export async function updateClassroom(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const university = formData.get('university') as string
  const period_year = parseInt(formData.get('period_year') as string)
  const period_month = formData.get('period_month') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes estar logueado')

  const { error } = await supabase.from('classrooms').update({
    name,
    university,
    period_year,
    period_month
  }).eq('id', id).eq('delegado_id', user.id) // Solo el delegado edita

  if (error) {
    return redirect(`/dashboard?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/classroom/${id}`)
  return { success: true }
}

export async function deleteClassroom(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes estar logueado')

  const { error } = await supabase.from('classrooms')
    .delete()
    .eq('id', id)
    .eq('delegado_id', user.id) // Solo el delegado puede borrar

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return redirect('/dashboard')
}

export async function joinClassroom(formData: FormData) {
  const token = formData.get('token') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes estar logueado')

  // 1. Buscar el aula por token
  const { data: classroom, error: searchError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('access_token', token)
    .single()

  if (searchError || !classroom) {
    return redirect('/dashboard/join-classroom?error=Token inválido o no encontrado')
  }

  // 2. Unirse al aula
  const { error: joinError } = await supabase
    .from('classroom_teachers')
    .insert({
      classroom_id: classroom.id,
      teacher_id: user.id
    })

  if (joinError) {
    if (joinError.code === '23505') {
       return redirect('/dashboard/join-classroom?error=Ya eres docente de este aula')
    }
    return redirect('/dashboard/join-classroom?error=' + encodeURIComponent(joinError.message))
  }

  revalidatePath('/dashboard')
  return redirect('/dashboard')
}
export async function leaveClassroom(classroomId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes estar logueado')

  // Eliminar la relación docente-aula (RLS permite que el docente se borre a sí mismo)
  const { error, count } = await supabase
    .from('classroom_teachers')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('teacher_id', user.id)

  if (error) {
    console.error('Error al salir del aula:', error)
    return { success: false, error: error.message }
  }

  // Forzar revalidación para que el dashboard y el aula se actualicen
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/classroom/${classroomId}`)
  
  return { success: true }
}
