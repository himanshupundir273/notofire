'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(event_id: string, content: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_comments')
    .insert({ event_id, content, author: 'Admin' })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { data }
}

export async function deleteComment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('event_comments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
