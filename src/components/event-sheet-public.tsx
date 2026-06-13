'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { AttachmentViewer } from '@/components/attachment-viewer'
import { Button } from '@/components/ui/button'
import type { Event, SortOrder } from '@/lib/types'
import {
  ArrowUpDown, FileText, ChevronDown, ChevronUp,
  MessageSquare, Paperclip, Calendar
} from 'lucide-react'
import { EventComments } from '@/components/event-comments'

export function EventSheetPublic({ events }: { events: Event[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">Event Sheet</h2>
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
      </div>

      {/* ── DESKTOP TABLE (md+) ── */}
      <div className="hidden md:block rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="grid grid-cols-[3rem_9rem_1fr_7rem] bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm font-semibold">
          <div className="px-4 py-3.5 text-center">#</div>
          <div className="px-4 py-3.5 text-center">Date</div>
          <div className="px-4 py-3.5">Event Description</div>
          <div className="px-4 py-3.5 text-center">Details</div>
        </div>

        {sorted.length === 0 ? (
          <EmptyPublic />
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="border-t border-gray-100">
                <div className={`grid grid-cols-[3rem_9rem_1fr_7rem] items-center hover:bg-blue-50/30 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
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
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{event.event_description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <ImportanceBadge importance={event.importance} />
                      {attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Paperclip className="h-3 w-3" />{attachments.length}
                        </span>
                      )}
                      {event.final_remark && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <MessageSquare className="h-3 w-3" /> Remark
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 text-center">
                    {hasDetails ? (
                      <button
                        onClick={() => toggleRow(event.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-full transition-colors border border-blue-100"
                      >
                        View
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gradient-to-b from-blue-50/60 to-white px-6 py-4 border-t border-blue-100 space-y-4">
                    {event.final_remark && (
                      <div className="bg-white rounded-xl border border-green-200 p-3 max-w-xl">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1.5">Remark</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{event.final_remark}</p>
                      </div>
                    )}
                    {attachments.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Attachments ({attachments.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachments.map(att => (
                            <AttachmentViewer key={att.id} attachment={att} />
                          ))}
                        </div>
                      </div>
                    )}
                    {(event.event_comments?.length ?? 0) > 0 && (
                      <div className="border-t border-blue-100 pt-3">
                        <EventComments
                          eventId={event.id}
                          comments={event.event_comments ?? []}
                          isAdmin={false}
                        />
                      </div>
                    )}
                  </div>
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
            <EmptyPublic />
          </div>
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                            <Paperclip className="h-3 w-3" />{attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {hasDetails && (
                  <button
                    onClick={() => toggleRow(event.id)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border-t border-blue-100 transition-colors"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details & Files'}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                )}

                {isExpanded && (
                  <div className="bg-gradient-to-b from-blue-50/60 to-white px-4 py-4 border-t border-blue-100 space-y-3">
                    {event.final_remark && (
                      <div className="bg-white rounded-xl border border-green-200 p-3">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1.5">Remark</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{event.final_remark}</p>
                      </div>
                    )}
                    {attachments.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Attachments ({attachments.length})
                        </p>
                        <div className="space-y-2">
                          {attachments.map(att => (
                            <AttachmentViewer key={att.id} attachment={att} />
                          ))}
                        </div>
                      </div>
                    )}
                    {(event.event_comments?.length ?? 0) > 0 && (
                      <div className="border-t border-blue-100 pt-3">
                        <EventComments
                          eventId={event.id}
                          comments={event.event_comments ?? []}
                          isAdmin={false}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function EmptyPublic() {
  return (
    <div className="py-16 text-center text-gray-500">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-gray-300" />
      </div>
      <p className="font-semibold text-gray-600">No events recorded yet</p>
    </div>
  )
}
