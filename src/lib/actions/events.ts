'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Importance, EventLink } from '@/lib/types'

export async function createEvent(data: {
  case_id: string
  event_description: string
  event_date: string
  importance: Importance
  internal_remark?: string
  final_remark?: string
  links?: EventLink[]
}) {
  const supabase = await createClient()
  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { data: event }
}

export async function updateEvent(id: string, data: Partial<{
  event_description: string
  event_date: string
  importance: Importance
  internal_remark: string
  final_remark: string
  links: EventLink[]
}>) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function getEventsByCase(case_id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`*, attachments(*)`)
    .eq('case_id', case_id)
    .order('event_date', { ascending: true })
  if (error) return { error: error.message }
  return { data }
}
