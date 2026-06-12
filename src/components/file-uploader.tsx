'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, Loader2 } from 'lucide-react'
import { ACCEPTED_TYPES } from '@/lib/utils/file'
import { uploadAttachment } from '@/lib/actions/attachments'
import { toast } from 'sonner'

interface Props {
  eventId: string
  onUploaded: () => void
}

export function FileUploader({ eventId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('event_id', eventId)
      const result = await uploadAttachment(fd)
      if (result.error) {
        toast.error(`Failed to upload ${file.name}: ${result.error}`)
      } else {
        toast.success(`${file.name} uploaded`)
      }
    }
    setUploading(false)
    onUploaded()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
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
    </div>
  )
}
