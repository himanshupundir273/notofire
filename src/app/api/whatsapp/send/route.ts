import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { phoneNumber, caseTitle, eventDescription, documentName, documentUrl } = await req.json()

  const apiKey = process.env.WHATSAPP_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'WhatsApp API key not configured' }, { status: 500 })
  }

  let destination = phoneNumber.replace(/\D/g, '')
  if (destination.length === 10) destination = '91' + destination

  const payload = {
    apiKey,
    campaignName: 'case_document',
    destination,
    userName: caseTitle,
    templateParams: [eventDescription],
    media: {
      url: documentUrl,
      filename: documentName,
    },
  }

  const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}
