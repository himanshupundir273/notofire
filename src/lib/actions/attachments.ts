'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadAttachment(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  const event_id = formData.get('event_id') as string

  if (!file || !event_id) return { error: 'Missing file or event_id' }

  const ext = file.name.split('.').pop()
  const path = `${event_id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('case-files')
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('case-files')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('attachments')
    .insert({
      event_id,
      file_name: file.name,
      file_type: file.type,
      file_url: publicUrl,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { data }
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
