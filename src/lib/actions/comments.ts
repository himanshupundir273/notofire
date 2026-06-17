'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function addComment(event_id: string, content: string, author: string = 'Admin') {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('event_comments')
    .insert({ event_id, content, author: author.trim() || 'Anonymous' })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function deleteComment(id: string) {
  // Only authenticated users (admin) can delete
  const supabase = await createClient()
  const { error } = await supabase.from('event_comments').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
