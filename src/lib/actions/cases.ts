'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { generateCaseCode } from '@/lib/utils/case-id'
import type { Importance } from '@/lib/types'

export async function createCase(data: {
  title: string
  client_name: string
  contact_number?: string
  address?: string
  description?: string
  party_details?: string
  next_update?: string
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
  party_details: string
  next_update: string
  remark: string
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

export async function duplicateCase(id: string) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Fetch original case
  const { data: original, error: fetchError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError || !original) return { error: 'Case not found' }

  // Fetch original events with their attachments
  const { data: events } = await supabase
    .from('events')
    .select('*, attachments(*)')
    .eq('case_id', id)
    .order('event_date', { ascending: true })

  // Create new case with a fresh code and "Copy of" prefix
  const newCode = generateCaseCode()
  const { data: newCase, error: caseError } = await supabase
    .from('cases')
    .insert({
      case_code: newCode,
      title: `Copy of ${original.title}`,
      client_name: original.client_name,
      contact_number: original.contact_number,
      address: original.address,
      description: original.description,
      importance: original.importance,
      party_details: original.party_details,
      next_update: original.next_update,
      remark: original.remark,
    })
    .select()
    .single()
  if (caseError || !newCase) return { error: caseError?.message ?? 'Failed to create copy' }

  // Duplicate events + attachments (including storage files)
  for (const event of events ?? []) {
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        case_id: newCase.id,
        event_description: event.event_description,
        event_date: event.event_date,
        importance: event.importance,
        internal_remark: event.internal_remark,
        final_remark: event.final_remark,
        links: event.links ?? [],
      })
      .select()
      .single()
    if (eventError || !newEvent) continue

    const attachments = (event.attachments as { id: string; file_name: string; file_type: string; file_url: string }[]) ?? []
    for (const att of attachments) {
      try {
        // Extract storage path from URL (everything after /case-files/)
        const srcPath = att.file_url.split('/case-files/')[1]
        if (!srcPath) continue

        // Download the file from storage
        const { data: fileData, error: downloadError } = await admin.storage
          .from('case-files')
          .download(srcPath)
        if (downloadError || !fileData) continue

        // Upload to new path under new event id
        const ext = att.file_name.includes('.') ? att.file_name.split('.').pop() : ''
        const newPath = `${newEvent.id}/${att.file_name}`
        const { error: uploadError } = await admin.storage
          .from('case-files')
          .upload(newPath, fileData, { contentType: att.file_type, upsert: true })
        if (uploadError) continue

        // Get public URL for new file
        const { data: { publicUrl } } = admin.storage
          .from('case-files')
          .getPublicUrl(newPath)

        // Save attachment record
        await admin.from('attachments').insert({
          event_id: newEvent.id,
          file_name: att.file_name,
          file_type: att.file_type,
          file_url: publicUrl,
        })
      } catch {
        // Skip files that fail — don't abort the whole copy
      }
    }
  }

  revalidatePath('/admin')
  return { data: newCase }
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
