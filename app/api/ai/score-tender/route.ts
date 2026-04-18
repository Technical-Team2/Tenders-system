import { NextRequest, NextResponse } from 'next/server'
import { scoreTender } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tenderId, companyProfile } = await request.json()

    if (!tenderId || !companyProfile) {
      return NextResponse.json(
        { error: 'Tender ID and company profile are required' },
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

    // Score the tender using AI
    const scoreResult = await scoreTender(
      tender.title,
      tender.description || '',
      companyProfile
    )

    // Save the score to database
    const { data: savedScore, error: saveError } = await supabase
      .from('tender_scores')
      .insert({
        tender_id: tenderId,
        score: scoreResult.score,
        breakdown: scoreResult.breakdown,
        reasoning: scoreResult.reasoning,
        confidence: scoreResult.confidence,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving score:', saveError)
      // Still return the score even if saving fails
    }

    return NextResponse.json({
      success: true,
      score: scoreResult,
      savedScore: savedScore || null
    })

  } catch (error) {
    console.error('Error in score-tender API:', error)
    return NextResponse.json(
      { error: 'Failed to score tender' },
      { status: 500 }
    )
  }
}
