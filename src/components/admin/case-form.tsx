'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCase, updateCase } from '@/lib/actions/cases'
import { toast } from 'sonner'
import type { Case, Importance } from '@/lib/types'
import { Loader2, RefreshCw } from 'lucide-react'

interface Props {
  existing?: Case
  onSuccess?: () => void
}

function slugFromTitle(title: string): string {
  return title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10)
}

export function CaseForm({ existing, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [importance, setImportance] = useState<Importance>(existing?.importance ?? 'medium')
  const [caseCode, setCaseCode] = useState(existing?.case_code ?? '')
  const [codeEdited, setCodeEdited] = useState(false)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!codeEdited && !existing) {
      setCaseCode(slugFromTitle(e.target.value))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!caseCode.trim()) {
      toast.error('Case ID is required')
      return
    }
    const clean = caseCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length < 3) {
      toast.error('Case ID must be at least 3 characters (letters/numbers only)')
      return
    }
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const data = {
      title: fd.get('title') as string,
      client_name: fd.get('client_name') as string,
      contact_number: fd.get('contact_number') as string || undefined,
      address: fd.get('address') as string || undefined,
      description: fd.get('description') as string || undefined,
      importance,
      case_code: clean,
    }

    const result = existing
      ? await updateCase(existing.id, data)
      : await createCase(data)

    setLoading(false)
    if ('error' in result && result.error) {
      toast.error(result.error)
    } else {
      toast.success(existing ? 'Case updated' : 'Case created')
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Case Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={existing?.title}
            required
            placeholder="e.g. MP Hyaat vs State"
            onChange={handleTitleChange}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="case_code">
            Case ID *
            <span className="ml-1.5 text-xs text-gray-400 font-normal">(used in the URL)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="case_code"
              value={caseCode}
              onChange={e => {
                setCaseCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                setCodeEdited(true)
              }}
              placeholder="e.g. MPHYAAT"
              className="font-mono tracking-widest"
              maxLength={20}
              required
            />
            {!existing && (
              <button
                type="button"
                title="Regenerate random ID"
                className="px-2 text-gray-400 hover:text-gray-700 border rounded-md"
                onClick={() => {
                  const rand = Math.random().toString(36).substring(2, 9).toUpperCase()
                  setCaseCode(rand)
                  setCodeEdited(true)
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Public URL: <span className="font-mono text-gray-600">/{caseCode || 'CASEID'}</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client_name">Client Name *</Label>
          <Input id="client_name" name="client_name" defaultValue={existing?.client_name} required placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input id="contact_number" name="contact_number" defaultValue={existing?.contact_number ?? ''} placeholder="+91 9876543210" />
        </div>
        <div className="space-y-1.5">
          <Label>Importance Level</Label>
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
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={existing?.address ?? ''} placeholder="Client address" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={existing?.description ?? ''} rows={3} placeholder="Case description and notes..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {existing ? 'Update Case' : 'Create Case'}
        </Button>
      </div>
    </form>
  )
}
