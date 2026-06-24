'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { duplicateCase } from '@/lib/actions/cases'

export function DuplicateCaseButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDuplicate() {
    if (!confirm('Create a full copy of this case including all events and file attachments? This may take a moment.')) return
    setLoading(true)
    const result = await duplicateCase(caseId)
    setLoading(false)
    if (result.error) {
      alert(`Failed to duplicate: ${result.error}`)
      return
    }
    router.push(`/admin/case/${result.data.case_code}`)
  }

  return (
    <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm" onClick={handleDuplicate} disabled={loading}>
      <Copy className="h-3.5 w-3.5" />
      {loading ? 'Copying…' : 'Duplicate'}
    </Button>
  )
}
