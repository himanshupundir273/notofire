'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateCaseImportance } from '@/lib/actions/cases'
import { toast } from 'sonner'
import type { Case, Importance } from '@/lib/types'
import { Scale, User, Phone, MapPin, Calendar, Hash, Users, Bell } from 'lucide-react'

interface Props {
  caseData: Case
  isAdmin?: boolean
}

export function CaseHeader({ caseData, isAdmin }: Props) {
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
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="bg-white/15 rounded-xl p-2 sm:p-2.5 flex-shrink-0 mt-0.5">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight break-words">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Hash className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm font-mono tracking-wider">
                  {caseData.case_code}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            {isAdmin ? (
              <Select value={importance} onValueChange={handleImportanceChange}>
                <SelectTrigger className="w-32 sm:w-36 bg-white/15 border-white/20 text-white h-8 text-xs sm:text-sm">
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

      {/* Details */}
      <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <InfoItem icon={<User className="h-4 w-4" />} label="Client" value={caseData.client_name} />
        {caseData.contact_number && (
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Contact" value={caseData.contact_number} />
        )}
        <InfoItem
          icon={<Calendar className="h-4 w-4" />}
          label="Filed"
          value={format(new Date(caseData.created_at), 'dd MMM yyyy')}
        />
        <InfoItem
          icon={<Calendar className="h-4 w-4" />}
          label="Updated"
          value={format(new Date(caseData.updated_at), 'dd MMM yyyy')}
        />
        <div className="flex items-start gap-2">
          <Bell className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next Update</p>
            <p className="text-sm font-semibold text-orange-600">
              {caseData.next_update ? format(new Date(caseData.next_update), 'dd MMM yyyy') : '—'}
            </p>
          </div>
        </div>
        {caseData.address && (
          <div className="col-span-2 lg:col-span-4 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
              <p className="text-sm font-medium text-gray-800">{caseData.address}</p>
            </div>
          </div>
        )}
        <div className="col-span-2 lg:col-span-4 flex items-start gap-2">
          <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Party Details</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {caseData.party_details || '—'}
            </p>
          </div>
        </div>
        {caseData.description && (
          <div className="col-span-2 lg:col-span-4 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{caseData.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}
