'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { saveAttachmentRecord } from '@/lib/actions/attachments'
import { createClient } from '@/lib/supabase/client'
import { VoiceRecorder } from '@/components/voice-recorder'
import { toast } from 'sonner'
import type { Event, Importance } from '@/lib/types'
import { Loader2, Camera, X, ImageIcon, Music } from 'lucide-react'
import { format } from 'date-fns'

interface PendingFile {
  id: string
  file: File
  preview?: string // for images
}

interface Props {
  caseId: string
  existing?: Event
  onSuccess?: () => void
}

export function EventForm({ caseId, existing, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [importance, setImportance] = useState<Importance>(existing?.importance ?? 'medium')
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<PendingFile[]>([])
  const [audioFiles, setAudioFiles] = useState<PendingFile[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  function addImages(files: FileList | null) {
    if (!files?.length) return
    const newFiles: PendingFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    setImageFiles(prev => [...prev, ...newFiles])
  }

  function addAudioFiles(files: FileList | null) {
    if (!files?.length) return
    const newFiles: PendingFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
    }))
    setAudioFiles(prev => [...prev, ...newFiles])
  }

  function removeAudioFile(id: string) {
    setAudioFiles(prev => prev.filter(f => f.id !== id))
  }

  function removeImage(id: string) {
    setImageFiles(prev => {
      const item = prev.find(f => f.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  async function uploadPendingFiles(eventId: string) {
    const supabase = createClient()
    const allFiles: File[] = [
      ...imageFiles.map(f => f.file),
      ...audioFiles.map(f => f.file),
      ...(voiceFile ? [voiceFile] : []),
    ]
    for (const file of allFiles) {
      const path = `${eventId}/${Date.now()}-${file.name}`
      const { error: storageError } = await supabase.storage
        .from('case-files')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (storageError) {
        toast.error(`Failed to upload ${file.name}: ${storageError.message}`)
        continue
      }
      const { data: { publicUrl } } = supabase.storage.from('case-files').getPublicUrl(path)
      const result = await saveAttachmentRecord({
        event_id: eventId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
      })
      if (result.error) toast.error(`DB record failed for ${file.name}`)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const data = {
      case_id: caseId,
      event_description: fd.get('event_description') as string,
      event_date: fd.get('event_date') as string,
      importance,
      internal_remark: fd.get('internal_remark') as string || undefined,
      final_remark: fd.get('final_remark') as string || undefined,
    }

    const result = existing
      ? await updateEvent(existing.id, data)
      : await createEvent(data)

    if ('error' in result && result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    // Upload pending files if any
    const eventId = existing?.id ?? (result as { data: { id: string } }).data?.id
    const hasPending = imageFiles.length > 0 || audioFiles.length > 0 || voiceFile
    if (eventId && hasPending) {
      toast.loading('Uploading files…', { id: 'upload' })
      await uploadPendingFiles(eventId)
      toast.dismiss('upload')
    }

    toast.success(existing ? 'Event updated' : 'Event added')
    setLoading(false)
    onSuccess?.()
  }

  const defaultDate = existing?.event_date ?? format(new Date(), 'yyyy-MM-dd')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="event_description">Event Description *</Label>
        <Textarea
          id="event_description"
          name="event_description"
          defaultValue={existing?.event_description}
          required
          rows={3}
          placeholder="Describe the event in detail…"
        />
      </div>

      {/* Date + Importance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event_date">Event Date *</Label>
          <Input id="event_date" name="event_date" type="date" defaultValue={defaultDate} required />
        </div>
        <div className="space-y-1.5">
          <Label>Importance</Label>
          <Select value={importance} onValueChange={v => setImportance(v as Importance)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Remarks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="internal_remark">Internal Remark</Label>
          <Textarea
            id="internal_remark"
            name="internal_remark"
            defaultValue={existing?.internal_remark ?? ''}
            rows={2}
            placeholder="Internal notes (not visible publicly)…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="final_remark">Final Remark</Label>
          <Textarea
            id="final_remark"
            name="final_remark"
            defaultValue={existing?.final_remark ?? ''}
            rows={2}
            placeholder="Final conclusion or outcome…"
          />
        </div>
      </div>

      {/* Attachments section — only for new events */}
      {!existing && (
        <div className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Attach Files (optional)
          </p>

          {/* Voice recorder */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Voice Note</p>
            <VoiceRecorder
              recording={voiceFile}
              onRecorded={setVoiceFile}
              onRemove={() => setVoiceFile(null)}
            />
          </div>

          {/* Image / photo capture */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Photos / Images</p>
            <div className="flex flex-wrap gap-2">
              {/* Camera capture (mobile) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-dashed"
                onClick={() => {
                  if (imageInputRef.current) {
                    imageInputRef.current.setAttribute('capture', 'environment')
                    imageInputRef.current.click()
                  }
                }}
              >
                <Camera className="h-4 w-4 text-blue-500" />
                Take Photo
              </Button>
              {/* Gallery picker */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-dashed"
                onClick={() => {
                  if (imageInputRef.current) {
                    imageInputRef.current.removeAttribute('capture')
                    imageInputRef.current.click()
                  }
                }}
              >
                <ImageIcon className="h-4 w-4 text-purple-500" />
                Choose Images
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="hidden"
                onChange={e => addImages(e.target.files)}
              />
            </div>

            {/* Image previews */}
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imageFiles.map(f => (
                  <div key={f.id} className="relative group">
                    {f.preview ? (
                      <img
                        src={f.preview}
                        alt={f.file.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500 text-center px-1">
                        {f.file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(f.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-gray-400 truncate max-w-[5rem] mt-0.5 text-center">
                      {f.file.name.split('.')[0].slice(0, 8)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {(imageFiles.length > 0 || voiceFile) && (
            <p className="text-xs text-blue-600 font-medium">
              {[
                imageFiles.length > 0 && `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`,
                voiceFile && '1 voice note',
              ].filter(Boolean).join(' + ')} will be uploaded after saving
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {existing ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </form>
  )
}
