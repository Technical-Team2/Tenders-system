import { NextRequest, NextResponse } from 'next/server'
import { generateApplicationAssistance } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tenderId } = await request.json()

    if (!tenderId) {
      return NextResponse.json(
        { error: 'Tender ID is required' },
        { status: 400 }
      )
    }

    // Get tender details from database
    const supabase = await createClient()
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single()

    if (tenderError || !tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      )
    }

    // Generate application assistance using AI
    const assistance = await generateApplicationAssistance(
      tender.title,
      tender.description || '',
      tender.deadline || 'Not specified'
    )

    return NextResponse.json({
      success: true,
      assistance
    })

  } catch (error) {
    console.error('Error in application-assist API:', error)
    return NextResponse.json(
      { error: 'Failed to generate application assistance' },
      { status: 500 }
    )
  }
}
