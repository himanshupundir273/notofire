import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  const name = req.nextUrl.searchParams.get('name') ?? 'file'

  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  // Only allow downloads from our own Supabase storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !url.startsWith(supabaseUrl)) {
    return NextResponse.json({ error: 'Invalid file source' }, { status: 403 })
  }

  try {
    const fileRes = await fetch(url)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream'
    const buffer = await fileRes.arrayBuffer()

    const safeName = name.replace(/['"\\]/g, '_')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
