import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api/config'

export async function POST(request: NextRequest) {
  const response = await fetch(`${API_BASE_URL}/api/email/send-alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(await request.json()),
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))
  return NextResponse.json(data, { status: response.status })
}
