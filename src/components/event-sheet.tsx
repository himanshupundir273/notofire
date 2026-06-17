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
import type { Event, Case, SortOrder, EventComment } from '@/lib/types'
import {
  ArrowUpDown, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  FileText, MessageSquare, Paperclip, Calendar, Link2, ExternalLink
} from 'lucide-react'
import { EventComments } from '@/components/event-comments'

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
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
          className="gap-2 text-xs sm:text-sm"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          <span className="xs:hidden">{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
        </Button>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddEventOpen(true)} className="gap-2 text-xs sm:text-sm">
            <Plus className="h-3.5 w-3.5" />
            Add Event
          </Button>
        )}
      </div>

      {/* ── DESKTOP TABLE (md+) ── */}
      <div className="hidden md:block rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[3rem_9rem_1fr_8rem] bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm font-semibold">
          <div className="px-4 py-3.5 text-center">#</div>
          <div className="px-4 py-3.5 text-center">Date</div>
          <div className="px-4 py-3.5">Event Description</div>
          <div className="px-4 py-3.5 text-center">Details</div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState isAdmin={isAdmin} onAdd={() => setAddEventOpen(true)} />
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.internal_remark || event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="border-t border-gray-100">
                <div className={`grid grid-cols-[3rem_9rem_1fr_8rem] items-center hover:bg-blue-50/40 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                }`}>
                  <div className="px-4 py-3.5 text-center">
                    <span className="text-sm font-mono text-gray-400 font-semibold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="px-4 py-3.5 text-center">
                    <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                      {format(parseISO(event.event_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{event.event_description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <ImportanceBadge importance={event.importance} />
                          {attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Paperclip className="h-3 w-3" />
                              {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {(event.internal_remark || event.final_remark) && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <MessageSquare className="h-3 w-3" /> Remarks
                            </span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditEvent(event)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 text-center">
                    {(hasDetails || isAdmin) ? (
                      <button
                        onClick={() => toggleRow(event.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-full transition-colors border border-blue-100"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <ExpandedDetails
                    event={event}
                    attachments={attachments}
                    comments={event.event_comments ?? []}
                    isAdmin={isAdmin}
                    onEdit={() => setEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onDeleteAttachment={handleDeleteAttachment}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── MOBILE CARDS (< md) ── */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white">
            <EmptyState isAdmin={isAdmin} onAdd={() => setAddEventOpen(true)} />
          </div>
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.internal_remark || event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold font-mono flex items-center justify-center mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {event.event_description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <ImportanceBadge importance={event.importance} />
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(event.event_date), 'dd MMM yyyy')}
                        </span>
                        {attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Paperclip className="h-3 w-3" />
                            {attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditEvent(event)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggle */}
                {(hasDetails || isAdmin) && (
                  <button
                    onClick={() => toggleRow(event.id)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border-t border-blue-100 transition-colors"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details & Files'}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                )}

                {isExpanded && (
                  <ExpandedDetails
                    event={event}
                    attachments={attachments}
                    comments={event.event_comments ?? []}
                    isAdmin={isAdmin}
                    onEdit={() => setEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onDeleteAttachment={handleDeleteAttachment}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Event Dialog */}
      {isAdmin && (
        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
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
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
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

function ExpandedDetails({
  event, attachments, comments, isAdmin, onEdit, onDelete, onDeleteAttachment
}: {
  event: Event
  attachments: NonNullable<Event['attachments']>
  comments: EventComment[]
  isAdmin?: boolean
  onEdit: () => void
  onDelete: () => void
  onDeleteAttachment: (id: string, url: string) => void
}) {
  const links = event.links ?? []

  return (
    <div className="bg-gradient-to-b from-blue-50/60 to-white px-4 sm:px-6 py-4 border-t border-blue-100 space-y-5">

      {/* Remarks */}
      {(event.internal_remark || event.final_remark) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {event.internal_remark && (
            <div className="bg-white rounded-xl border border-amber-200 p-3">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5">Internal Remark</p>
              <p className="text-sm text-gray-700 leading-relaxed">{event.internal_remark}</p>
            </div>
          )}
          {event.final_remark && (
            <div className="bg-white rounded-xl border border-green-200 p-3">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1.5">Final Remark</p>
              <p className="text-sm text-gray-700 leading-relaxed">{event.final_remark}</p>
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-blue-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Links ({links.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Attachments + Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Documents {attachments.length > 0 && `(${attachments.length})`}
          </p>
          {isAdmin && (
            <FileUploader eventId={event.id} onUploaded={() => window.location.reload()} />
          )}
        </div>
        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map(att => (
              <AttachmentViewer key={att.id} attachment={att} isAdmin={isAdmin} onDelete={onDeleteAttachment} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            {isAdmin ? 'No documents yet — use "Attach Files" above to add.' : 'No documents attached.'}
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="border-t border-blue-100 pt-4">
        <EventComments eventId={event.id} comments={comments} isAdmin={isAdmin} />
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-blue-100">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" /> Edit Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ isAdmin, onAdd }: { isAdmin?: boolean; onAdd?: () => void }) {
  return (
    <div className="py-16 text-center text-gray-500">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-gray-300" />
      </div>
      <p className="font-semibold text-gray-600">No events yet</p>
      {isAdmin && (
        <button
          onClick={onAdd}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
        >
          Add the first event
        </button>
      )}
    </div>
  )
}
