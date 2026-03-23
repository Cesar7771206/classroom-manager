'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/dashboard'
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const errorUrl = `/login?error=${encodeURIComponent(error.message)}&returnTo=${encodeURIComponent(redirectTo)}`
    return redirect(errorUrl)
  }

  return redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string // 'delegado' o 'docente'
  const redirectTo = formData.get('redirectTo') as string || '/dashboard'
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    const errorUrl = `/register?error=${encodeURIComponent(error.message)}&returnTo=${encodeURIComponent(redirectTo)}`
    return redirect(errorUrl)
  }

  return redirect(redirectTo)
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
