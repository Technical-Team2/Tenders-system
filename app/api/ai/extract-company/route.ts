import { NextRequest, NextResponse } from 'next/server'
import { extractCompanyInfo } from '@/lib/ai/client'

export async function POST(request: NextRequest) {
  try {
    const { websiteUrl } = await request.json()

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(websiteUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      )
    }

    // Extract company information using AI
    const companyInfo = await extractCompanyInfo(websiteUrl)

    return NextResponse.json({
      success: true,
      companyInfo
    })

  } catch (error) {
    console.error('Error in extract-company API:', error)
    return NextResponse.json(
      { error: 'Failed to extract company information' },
      { status: 500 }
    )
  }
}
