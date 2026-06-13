'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { ACCEPTED_TYPES } from '@/lib/utils/file'
import { saveAttachmentRecord } from '@/lib/actions/attachments'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UploadStatus {
  name: string
  status: 'uploading' | 'done' | 'error'
}

interface Props {
  eventId: string
  onUploaded: () => void
}

export function FileUploader({ eventId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [statuses, setStatuses] = useState<UploadStatus[]>([])

  const uploading = statuses.some(s => s.status === 'uploading')

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    const supabase = createClient()
    const fileArray = Array.from(files)
    setStatuses(fileArray.map(f => ({ name: f.name, status: 'uploading' })))

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      try {
        const path = `${eventId}/${Date.now()}-${file.name}`

        // Upload directly from browser — no Next.js body limit
        const { error: storageError } = await supabase.storage
          .from('case-files')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (storageError) throw new Error(storageError.message)

        const { data: { publicUrl } } = supabase.storage
          .from('case-files')
          .getPublicUrl(path)

        const result = await saveAttachmentRecord({
          event_id: eventId,
          file_name: file.name,
          file_type: file.type,
          file_url: publicUrl,
        })

        if (result.error) throw new Error(result.error)

        setStatuses(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setStatuses(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s))
        toast.error(`${file.name}: ${message}`)
      }
    }

    if (inputRef.current) inputRef.current.value = ''

    // Show final states briefly then reload
    await new Promise(r => setTimeout(r, 700))
    setStatuses([])
    onUploaded()
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4 mr-2" />
        )}
        {uploading ? 'Uploading...' : 'Attach Files'}
      </Button>

      {statuses.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 text-sm w-72">
          {statuses.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              {s.status === 'uploading' && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 flex-shrink-0" />}
              {s.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
              {s.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
              <span className="truncate text-gray-700">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
