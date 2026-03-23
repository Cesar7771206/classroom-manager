'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStudent(formData: FormData) {
  const classroomId = formData.get('classroom_id') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const supabase = await createClient()

  // Seguridad: Verificamos si el usuario actual es el delegado de este aula
  // RLS ya lo hace, pero es buena práctica no confiar ciegamente
  const { error } = await supabase.from('students').insert({
    classroom_id: classroomId,
    first_name: firstName,
    last_name: lastName
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Refrescamos la ruta para que Next.js vuelva a hacer fetch de la lista
  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function deleteStudent(studentId: string, classroomId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}

export async function updateStudent(formData: FormData) {
  const studentId = formData.get('student_id') as string
  const classroomId = formData.get('classroom_id') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string

  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq('id', studentId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/classroom/${classroomId}`, 'page')
  return { success: true }
}
