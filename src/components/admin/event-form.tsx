'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { toast } from 'sonner'
import type { Event, Importance } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  caseId: string
  existing?: Event
  onSuccess?: () => void
}

export function EventForm({ caseId, existing, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [importance, setImportance] = useState<Importance>(existing?.importance ?? 'medium')

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

    setLoading(false)
    if ('error' in result && result.error) {
      toast.error(result.error)
    } else {
      toast.success(existing ? 'Event updated' : 'Event added')
      onSuccess?.()
    }
  }

  const defaultDate = existing?.event_date
    ? existing.event_date
    : format(new Date(), 'yyyy-MM-dd')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="event_description">Event Description *</Label>
        <Textarea
          id="event_description"
          name="event_description"
          defaultValue={existing?.event_description}
          required
          rows={3}
          placeholder="Describe the event in detail..."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event_date">Event Date *</Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Importance</Label>
          <Select value={importance} onValueChange={(v) => setImportance(v as Importance)}>
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
      <div className="space-y-1.5">
        <Label htmlFor="internal_remark">Internal Remark</Label>
        <Textarea
          id="internal_remark"
          name="internal_remark"
          defaultValue={existing?.internal_remark ?? ''}
          rows={2}
          placeholder="Internal notes (not visible publicly)..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="final_remark">Final Remark</Label>
        <Textarea
          id="final_remark"
          name="final_remark"
          defaultValue={existing?.final_remark ?? ''}
          rows={2}
          placeholder="Final conclusion or outcome..."
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {existing ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </form>
  )
}
