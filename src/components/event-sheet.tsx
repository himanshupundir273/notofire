'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { AttachmentViewer } from '@/components/attachment-viewer'
import { FileUploader } from '@/components/file-uploader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventForm } from '@/components/admin/event-form'
import { deleteEvent } from '@/lib/actions/events'
import { deleteAttachment } from '@/lib/actions/attachments'
import { toast } from 'sonner'
import type { Event, Case, SortOrder } from '@/lib/types'
import {
  ArrowUpDown, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  FileText, MessageSquare
} from 'lucide-react'

interface Props {
  caseData: Case
  events: Event[]
  isAdmin?: boolean
}

export function EventSheet({ caseData, events: initialEvents, isAdmin }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [events] = useState<Event[]>(initialEvents)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<Event | null>(null)

  const sorted = [...events].sort((a, b) => {
    const diff = a.event_date.localeCompare(b.event_date)
    return sortOrder === 'asc' ? diff : -diff
  })

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Delete this event and all its attachments?')) return
    const result = await deleteEvent(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Event deleted')
      window.location.reload()
    }
  }

  async function handleDeleteAttachment(attachmentId: string, fileUrl: string) {
    if (!confirm('Delete this attachment?')) return
    const result = await deleteAttachment(attachmentId, fileUrl)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Attachment deleted')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
        </Button>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddEventOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      {/* Event Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_8rem_8rem] bg-gray-800 text-white text-sm font-semibold">
          <div className="px-4 py-3 text-center">S.No</div>
          <div className="px-4 py-3">Event Description</div>
          <div className="px-4 py-3 text-center">Event Date</div>
          <div className="px-4 py-3 text-center">Documents</div>
        </div>

        {sorted.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No events yet</p>
            {isAdmin && <p className="text-sm mt-1">Click "Add Event" to get started</p>}
          </div>
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.internal_remark || event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="border-t border-gray-100">
                {/* Main row */}
                <div
                  className={`grid grid-cols-[3rem_1fr_8rem_8rem] items-center hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <div className="px-4 py-3 text-center">
                    <span className="text-sm font-mono text-gray-500 font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {event.event_description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <ImportanceBadge importance={event.importance} />
                          {attachments.length > 0 && (
                            <span className="text-xs text-gray-400">
                              {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {(event.internal_remark || event.final_remark) && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Remarks
                            </span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditEvent(event)}
                            className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 font-medium">
                      {format(parseISO(event.event_date), 'dd-MMM-yyyy')}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-center">
                    {(hasDetails || isAdmin) ? (
                      <button
                        onClick={() => toggleRow(event.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors"
                      >
                        {attachments.length > 0 ? 'View' : 'Details'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-blue-50/30 px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Remarks */}
                      {(event.internal_remark || event.final_remark || isAdmin) && (
                        <div className="space-y-3">
                          {event.internal_remark && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Internal Remark
                              </p>
                              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                                {event.internal_remark}
                              </p>
                            </div>
                          )}
                          {event.final_remark && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Final Remark
                              </p>
                              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                                {event.final_remark}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Attachments */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Attachments ({attachments.length})
                          </p>
                          {isAdmin && (
                            <FileUploader
                              eventId={event.id}
                              onUploaded={() => window.location.reload()}
                            />
                          )}
                        </div>
                        {attachments.length > 0 ? (
                          <div className="space-y-1.5">
                            {attachments.map(att => (
                              <AttachmentViewer
                                key={att.id}
                                attachment={att}
                                isAdmin={isAdmin}
                                onDelete={handleDeleteAttachment}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No attachments</p>
                        )}
                      </div>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-blue-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditEvent(event)}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Event
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Event
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Event Dialog */}
      {isAdmin && (
        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <EventForm
              caseId={caseData.id}
              onSuccess={() => {
                setAddEventOpen(false)
                window.location.reload()
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Event Dialog */}
      {isAdmin && editEvent && (
        <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm
              caseId={caseData.id}
              existing={editEvent}
              onSuccess={() => {
                setEditEvent(null)
                window.location.reload()
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
