'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateCaseCode } from '@/lib/utils/case-id'
import type { Importance } from '@/lib/types'

export async function createCase(data: {
  title: string
  client_name: string
  contact_number?: string
  address?: string
  description?: string
  importance: Importance
  case_code?: string
}) {
  const supabase = await createClient()

  const { case_code: customCode, ...rest } = data

  let case_code = customCode?.toUpperCase().replace(/[^A-Z0-9]/g, '') || generateCaseCode()

  // Ensure uniqueness — if custom code already taken, append suffix
  const { data: existing } = await supabase
    .from('cases')
    .select('id')
    .eq('case_code', case_code)
    .single()
  if (existing) {
    return { error: `Case ID "${case_code}" is already taken. Please choose a different one.` }
  }

  const { data: newCase, error } = await supabase
    .from('cases')
    .insert({ ...rest, case_code })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { data: newCase }
}

export async function updateCase(id: string, data: Partial<{
  title: string
  client_name: string
  contact_number: string
  address: string
  description: string
  importance: Importance
  case_code: string
}>) {
  const supabase = await createClient()
  const { error } = await supabase.from('cases').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath(`/case/${id}`)
  return { success: true }
}

export async function updateCaseImportance(id: string, importance: Importance) {
  const supabase = await createClient()
  const { error } = await supabase.from('cases').update({ importance }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteCase(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function getCases() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function getCaseByCode(case_code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('case_code', case_code)
    .single()
  if (error) return { error: error.message }
  return { data }
}
