'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/lib/actions/comments'
import { toast } from 'sonner'
import type { EventComment } from '@/lib/types'
import { MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react'
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
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const author = isAdmin ? 'Admin' : (authorName.trim() || 'Anonymous')
    setSubmitting(true)
    const result = await addComment(eventId, trimmed, author)
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setComments(prev => [...prev, result.data as EventComment])
      setText('')
      if (!isAdmin) setAuthorName('')
      toast.success('Comment added')
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

  const avatarColor = (author: string) => {
    if (author === 'Admin') return 'bg-gray-800 text-white'
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700']
    return colors[author.charCodeAt(0) % colors.length]
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
        <div className="space-y-2.5">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5 group">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${avatarColor(c.author)}`}>
                {c.author[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-800">{c.author}</span>
                    {c.author === 'Admin' && (
                      <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded-full font-medium">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
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

      {comments.length === 0 && (
        <p className="text-xs text-gray-400 italic">No comments yet — be the first to comment.</p>
      )}

      {/* Add comment form — visible to everyone */}
      <form onSubmit={handleAdd} className="space-y-2 pt-1">
        {/* Name field — only for public users */}
        {!isAdmin && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={40}
              className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(e as unknown as React.FormEvent) }
              }}
              placeholder={isAdmin ? 'Add a comment… (Enter to send)' : 'Write a comment… (Enter to send)'}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent placeholder:text-gray-400 bg-white"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !text.trim()}
            className="flex-shrink-0 gap-1.5 self-end"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
