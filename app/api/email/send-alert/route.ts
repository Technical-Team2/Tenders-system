import { NextRequest, NextResponse } from 'next/server'
import { sendTenderAlerts } from '@/lib/email/notifications'

export async function POST(request: NextRequest) {
  try {
    const { tenderId, score } = await request.json()

    if (!tenderId || score === undefined) {
      return NextResponse.json(
        { error: 'Tender ID and score are required' },
        { status: 400 }
      )
    }

    // Get tender details
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: tender, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single()

    if (error || !tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      )
    }

    // Send tender alerts
    await sendTenderAlerts(tender, score)

    return NextResponse.json({
      success: true,
      message: 'Tender alerts sent successfully'
    })

  } catch (error) {
    console.error('Error in send-alert API:', error)
    return NextResponse.json(
      { error: 'Failed to send tender alerts' },
      { status: 500 }
    )
  }
}
