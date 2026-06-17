'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Called after client-side direct upload to Supabase Storage
// Uses admin client so public (unauthenticated) uploads work too
export async function saveAttachmentRecord(data: {
  event_id: string
  file_name: string
  file_type: string
  file_url: string
}) {
  try {
    const supabase = createAdminClient()
    const { data: record, error } = await supabase
      .from('attachments')
      .insert(data)
      .select()
      .single()
    if (error) return { error: error.message }
    try { revalidatePath('/admin') } catch {}
    return { data: record }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to save attachment record' }
  }
}

// Keep for backwards compat but route through client-side upload instead
export async function uploadAttachment(formData: FormData) {
  return { error: 'Use client-side upload instead' }
}

export async function deleteAttachment(id: string, file_url: string) {
  const supabase = await createClient()

  // Extract storage path from URL
  const url = new URL(file_url)
  const pathParts = url.pathname.split('/case-files/')
  if (pathParts[1]) {
    await supabase.storage.from('case-files').remove([pathParts[1]])
  }

  const { error } = await supabase.from('attachments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
