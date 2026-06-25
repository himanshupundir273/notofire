'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateCaseImportance, updateCase } from '@/lib/actions/cases'
import { toast } from 'sonner'
import type { Case, Importance } from '@/lib/types'
import { Scale, User, Phone, MapPin, Calendar, Hash, Users, Bell, MessageSquare, Pencil, Check, X } from 'lucide-react'

interface Props {
  caseData: Case
  isAdmin?: boolean
}

export function CaseHeader({ caseData, isAdmin }: Props) {
  const [importance, setImportance] = useState<Importance>(caseData.importance)
  const [remark, setRemark] = useState(caseData.remark ?? '')
  const [editingRemark, setEditingRemark] = useState(false)
  const [remarkDraft, setRemarkDraft] = useState(caseData.remark ?? '')
  const [savingRemark, setSavingRemark] = useState(false)

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

  async function handleRemarkSave() {
    setSavingRemark(true)
    const result = await updateCase(caseData.id, { remark: remarkDraft })
    setSavingRemark(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setRemark(remarkDraft)
      setEditingRemark(false)
      toast.success('Remark saved')
    }
  }

  function handleRemarkCancel() {
    setRemarkDraft(remark)
    setEditingRemark(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
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

        {/* Remark */}
        {(isAdmin || remark) && (
          <div className="col-span-2 lg:col-span-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Remark</p>
              {isAdmin && !editingRemark && (
                <button
                  onClick={() => { setRemarkDraft(remark); setEditingRemark(true) }}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
            </div>

            {isAdmin && editingRemark ? (
              <div className="space-y-2">
                <textarea
                  value={remarkDraft}
                  onChange={e => setRemarkDraft(e.target.value)}
                  rows={3}
                  placeholder="Add a remark visible to the client…"
                  className="w-full rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRemarkSave}
                    disabled={savingRemark}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {savingRemark ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleRemarkCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {remark || <span className="text-gray-400 italic">No remark added yet</span>}
              </p>
            )}
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
