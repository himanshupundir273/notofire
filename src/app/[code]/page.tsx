import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseHeader } from '@/components/case-header'
import { EventSheetPublic } from '@/components/event-sheet-public'
import type { Case, Event } from '@/lib/types'
import { Scale } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('cases')
    .select('title, client_name')
    .eq('case_code', code.toUpperCase())
    .single()

  return {
    title: data ? `${data.title} — ${data.client_name}` : 'Case Not Found',
  }
}

export default async function PublicCasePage({ params }: { params: Promise<{ code: string }> }) {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-2.5">
          <div className="bg-white/15 rounded-xl p-1.5">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">LegalCase</span>
          <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full ml-1">
            Public View
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        <CaseHeader caseData={caseData as Case} isAdmin={false} />
        <EventSheetPublic events={(events as Event[]) ?? []} />
      </main>

      <footer className="text-center text-xs text-gray-400 py-8 border-t border-gray-200 mt-8">
        Case Reference: <span className="font-mono">{caseData.case_code}</span>
      </footer>
    </div>
  )
}
