'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CaseForm } from '@/components/admin/case-form'
import { deleteCase } from '@/lib/actions/cases'
import { toast } from 'sonner'
import type { Case } from '@/lib/types'
import {
  Plus, Search, ExternalLink, Pencil, Trash2,
  FolderOpen, Scale, Hash, User, Phone, Calendar
} from 'lucide-react'

export function CaseListClient({ cases }: { cases: Case[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCase, setEditCase] = useState<Case | null>(null)
  const [, startTransition] = useTransition()

  const filtered = cases.filter(c =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.case_code.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete case "${title}" and all its events? This cannot be undone.`)) return
    const result = await deleteCase(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Case deleted')
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cases.length} case{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">New Case</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9 bg-white"
          placeholder="Search by title, client, or case ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Cases */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-semibold">
            {search ? 'No cases match your search' : 'No cases yet'}
          </p>
          {!search && (
            <p className="text-sm text-gray-400 mt-1">Create your first case to get started</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-5 flex flex-col gap-4"
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 leading-tight line-clamp-2">{c.title}</h2>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-500 tracking-wider">{c.case_code}</span>
                  </div>
                </div>
                <ImportanceBadge importance={c.importance} className="flex-shrink-0" />
              </div>

              {/* Meta */}
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{c.client_name}</span>
                </div>
                {c.contact_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{c.contact_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{format(new Date(c.created_at), 'dd MMM yyyy')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <Link href={`/admin/case/${c.case_code}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full gap-1.5 text-xs">
                    <Scale className="h-3.5 w-3.5" />
                    Open Case
                  </Button>
                </Link>
                <Link href={`/${c.case_code}`} target="_blank">
                  <Button variant="outline" size="sm" title="Public view" className="px-2.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditCase(c)}
                  title="Edit"
                  className="px-2.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(c.id, c.title)}
                  className="px-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <CaseForm
            onSuccess={() => {
              setCreateOpen(false)
              startTransition(() => router.refresh())
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editCase && (
        <Dialog open={!!editCase} onOpenChange={() => setEditCase(null)}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Case</DialogTitle>
            </DialogHeader>
            <CaseForm
              existing={editCase}
              onSuccess={() => {
                setEditCase(null)
                startTransition(() => router.refresh())
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
