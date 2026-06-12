'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateCaseImportance } from '@/lib/actions/cases'
import { toast } from 'sonner'
import type { Case, Importance } from '@/lib/types'
import { Scale, User, Phone, MapPin, Calendar, RefreshCw, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  caseData: Case
  isAdmin?: boolean
}

export function CaseHeader({ caseData, isAdmin }: Props) {
  const router = useRouter()
  const [importance, setImportance] = useState<Importance>(caseData.importance)

  function handleImportanceChange(value: string | null) {
    if (!value) return
    setImportance(value as Importance)
    updateCaseImportance(caseData.id, value as Importance).then(result => {
      if (result.error) {
        toast.error(result.error)
        setImportance(caseData.importance)
      } else {
        toast.success('Importance updated')
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-lg p-2">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{caseData.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-300 text-sm font-mono">#{caseData.case_code}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isAdmin ? (
              <Select value={importance} onValueChange={handleImportanceChange}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <ImportanceBadge importance={importance} />
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Client</p>
            <p className="text-sm font-semibold text-gray-800">{caseData.client_name}</p>
          </div>
        </div>
        {caseData.contact_number && (
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contact</p>
              <p className="text-sm font-semibold text-gray-800">{caseData.contact_number}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Created</p>
            <p className="text-sm font-semibold text-gray-800">
              {format(new Date(caseData.created_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RefreshCw className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Updated</p>
            <p className="text-sm font-semibold text-gray-800">
              {format(new Date(caseData.updated_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        {caseData.address && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
              <p className="text-sm font-semibold text-gray-800">{caseData.address}</p>
            </div>
          </div>
        )}
        {caseData.description && (
          <div className="flex items-start gap-2 sm:col-span-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{caseData.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
