'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { AttachmentViewer } from '@/components/attachment-viewer'
import { Button } from '@/components/ui/button'
import type { Event, SortOrder } from '@/lib/types'
import { ArrowUpDown, FileText, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

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
        <h2 className="text-lg font-semibold text-gray-800">Event Sheet</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
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
            <p>No events recorded yet</p>
          </div>
        ) : (
          sorted.map((event, idx) => {
            const isExpanded = expandedRows.has(event.id)
            const attachments = event.attachments ?? []
            const hasDetails = event.final_remark || attachments.length > 0

            return (
              <div key={event.id} className="border-t border-gray-100">
                <div className={`grid grid-cols-[3rem_1fr_8rem_8rem] items-center hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                }`}>
                  <div className="px-4 py-3 text-center">
                    <span className="text-sm font-mono text-gray-500 font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="px-4 py-3">
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
                      {event.final_remark && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Remark
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 font-medium">
                      {format(parseISO(event.event_date), 'dd-MMM-yyyy')}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-center">
                    {hasDetails ? (
                      <button
                        onClick={() => toggleRow(event.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors"
                      >
                        View
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-blue-50/30 px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {event.final_remark && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Remark
                          </p>
                          <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                            {event.final_remark}
                          </p>
                        </div>
                      )}
                      {attachments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Attachments ({attachments.length})
                          </p>
                          <div className="space-y-1.5">
                            {attachments.map(att => (
                              <AttachmentViewer key={att.id} attachment={att} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
