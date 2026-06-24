import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('caseId')
  const caseName = req.nextUrl.searchParams.get('caseName') ?? 'case'

  if (!caseId) {
    return NextResponse.json({ error: 'caseId required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch all attachments for every event in this case
  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_description, attachments(id, file_name, file_url)')
    .eq('case_id', caseId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const zip = new JSZip()
  const seenNames = new Map<string, number>()

  for (const event of events ?? []) {
    const attachments = (event.attachments as { id: string; file_name: string; file_url: string }[]) ?? []
    for (const att of attachments) {
      try {
        const res = await fetch(att.file_url)
        if (!res.ok) continue
        const buffer = await res.arrayBuffer()

        // Deduplicate file names
        let name = att.file_name
        const count = seenNames.get(name) ?? 0
        if (count > 0) {
          const dot = name.lastIndexOf('.')
          name = dot > -1
            ? `${name.slice(0, dot)} (${count})${name.slice(dot)}`
            : `${name} (${count})`
        }
        seenNames.set(att.file_name, count + 1)

        zip.file(name, buffer)
      } catch {
        // skip files that fail to fetch
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

  const safeName = caseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()

  return new NextResponse(zipBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}_documents.zip"`,
    },
  })
}
