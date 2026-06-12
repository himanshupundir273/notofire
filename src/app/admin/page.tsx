import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ImportanceBadge } from '@/components/importance-badge'
import { CaseListClient } from '@/components/admin/case-list-client'
import type { Case } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  return <CaseListClient cases={(cases as Case[]) ?? []} />
}
