'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/lib/actions/comments'
import { toast } from 'sonner'
import type { EventComment } from '@/lib/types'
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Props {
  eventId: string
  comments: EventComment[]
  isAdmin?: boolean
}

export function EventComments({ eventId, comments: initial, isAdmin }: Props) {
  const [comments, setComments] = useState<EventComment[]>(
    [...initial].sort((a, b) => a.created_at.localeCompare(b.created_at))
  )
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSubmitting(true)
    const result = await addComment(eventId, trimmed)
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setComments(prev => [...prev, result.data as EventComment])
      setText('')
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteComment(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setComments(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Comments {comments.length > 0 && `(${comments.length})`}
        </p>
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5 group">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {c.author[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700">{c.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {format(new Date(c.created_at), 'dd MMM, hh:mm a')}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && !isAdmin && (
        <p className="text-xs text-gray-400 italic">No comments yet</p>
      )}

      {/* Add comment — admin only */}
      {isAdmin && (
        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(e as unknown as React.FormEvent) }
              }}
              placeholder="Add a comment… (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !text.trim()}
            className="flex-shrink-0 gap-1.5 self-end"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </Button>
        </form>
      )}
    </div>
  )
}
