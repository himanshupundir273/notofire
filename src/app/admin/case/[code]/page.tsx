import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseHeader } from '@/components/case-header'
import { EventSheet } from '@/components/event-sheet'
import type { Case, Event } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { DownloadZipButton } from '@/components/admin/download-zip-button'
import { DuplicateCaseButton } from '@/components/admin/duplicate-case-button'

export const dynamic = 'force-dynamic'

export default async function AdminCasePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('case_code', code.toLowerCase())
    .single()

  if (!caseData) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*, attachments(*)')
    .eq('case_id', caseData.id)
    .order('event_date', { ascending: true })

  const totalFiles = (events ?? []).reduce(
    (sum, e) => sum + ((e.attachments as unknown[]) ?? []).length,
    0
  )

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">All Cases</span>
            <span className="xs:hidden">Back</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <DuplicateCaseButton caseId={caseData.id} />
          <DownloadZipButton caseId={caseData.id} caseName={caseData.title} totalFiles={totalFiles} />
          <Link href={`/${caseData.case_code}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Public View</span>
              <span className="xs:hidden">Public</span>
            </Button>
          </Link>
        </div>
      </div>

      <CaseHeader caseData={caseData as Case} isAdmin />
      <EventSheet caseData={caseData as Case} events={(events as Event[]) ?? []} isAdmin />
    </div>
  )
}
