import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseHeader } from '@/components/case-header'
import { EventSheet } from '@/components/event-sheet'
import type { Case, Event } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCasePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('case_code', code.toUpperCase())
    .single()

  if (!caseData) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*, attachments(*)')
    .eq('case_id', caseData.id)
    .order('event_date', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            All Cases
          </Button>
        </Link>
        <Link href={`/${caseData.case_code}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Public View
          </Button>
        </Link>
      </div>

      <CaseHeader caseData={caseData as Case} isAdmin />
      <EventSheet caseData={caseData as Case} events={(events as Event[]) ?? []} isAdmin />
    </div>
  )
}
