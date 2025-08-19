import { NextRequest, NextResponse } from 'next/server'
import { getMockOCRService } from '@/features/uploads/services/mock-ocr.service'
import { createLLMNormalizerService } from '@/features/uploads/services/llm-normalizer.service'
import { gameMatcherService } from '@/features/uploads/services/game-matcher.service'

// Use mock OCR if tesseract.js has issues
const USE_MOCK_OCR = process.env.USE_MOCK_OCR === 'true'

/**
 * POST /api/upload/spreads - Upload image with pool-specific spreads
 * This endpoint focuses on extracting only spreads and matching them to existing ESPN games
 */
export async function POST(request: NextRequest) {
  console.log('[Spreads Upload] Starting spread-only image processing...')

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const season =
      parseInt(formData.get('season') as string) || new Date().getFullYear()
    const week = parseInt(formData.get('week') as string) || 1
    const poolId = formData.get('poolId') as string

    console.log('[Spreads Upload] Processing:', { season, week, poolId })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID is required for spread uploads' },
        { status: 400 }
      )
    }

    // Validate file type and size (same as OCR route)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG and JPEG images are supported.' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Step 1: Extract text from image using OCR
    console.log('[Spreads Upload] Extracting text from image...')

    const ocrTimeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('OCR processing timeout after 30 seconds')),
        30000
      )
    })

    const ocrProcessing = (async () => {
      if (USE_MOCK_OCR) {
        console.log('[Spreads Upload] Using mock OCR service...')
        const mockOCRService = await getMockOCRService()
        return await mockOCRService.processImageFile(file)
      } else {
        console.log('[Spreads Upload] Loading real OCR service...')
        const { getOCRService } = await import(
          '@/features/uploads/services/ocr.service'
        )
        const ocrService = await getOCRService()
        return await ocrService.processImageFile(file)
      }
    })()

    const ocrResult = await Promise.race([ocrProcessing, ocrTimeout])

    console.log('[Spreads Upload] OCR completed:', {
      textLength: ocrResult.text.length,
      confidence: ocrResult.confidence,
    })

    if (ocrResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'OCR processing failed',
          details: ocrResult.errors,
          success: false,
        },
        { status: 500 }
      )
    }

    if (!ocrResult.text || ocrResult.text.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'No text found in image',
          success: false,
          ocrConfidence: ocrResult.confidence,
        },
        { status: 400 }
      )
    }

    // Step 2: Extract spreads using LLM
    console.log('[Spreads Upload] Extracting spreads with LLM...')
    const llmService = createLLMNormalizerService()
    const spreadResult = await llmService.normalizeSpreads(ocrResult.text)

    console.log('[Spreads Upload] LLM spread extraction completed:', {
      success: spreadResult.success,
      spreadCount: spreadResult.spreads.length,
      provider: spreadResult.provider,
    })

    if (!spreadResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to extract spreads from text',
          details: spreadResult.error,
          extractedText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          success: false,
        },
        { status: 500 }
      )
    }

    if (spreadResult.spreads.length === 0) {
      return NextResponse.json(
        {
          error: 'No spreads found in image',
          extractedText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          success: false,
        },
        { status: 400 }
      )
    }

    // Step 3: Match spreads to existing games
    console.log('[Spreads Upload] Matching spreads to existing games...')
    const matchResult = await gameMatcherService.matchSpreadsToGames(
      spreadResult.spreads,
      season,
      week
    )

    if (!matchResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to match spreads to games',
          details: matchResult.error,
          extractedSpreads: spreadResult.spreads,
          success: false,
        },
        { status: 500 }
      )
    }

    console.log('[Spreads Upload] Match results:', {
      matched: matchResult.matches.length,
      unmatched: matchResult.unmatched.length,
    })

    // Step 4: Create betting lines for matched games
    let linesCreated = 0
    const lineErrors: string[] = []

    if (matchResult.matches.length > 0) {
      console.log('[Spreads Upload] Creating betting lines...')
      const lineResult = await gameMatcherService.createLinesForMatches(
        matchResult.matches,
        poolId,
        'Pool Spread Upload'
      )
      linesCreated = lineResult.created
      lineErrors.push(...lineResult.errors)
    }

    // Step 5: Return results
    const response = {
      success: true,
      data: {
        extractedText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        llmProvider: spreadResult.provider,
        tokensUsed: spreadResult.tokensUsed,
        estimatedCostUSD: spreadResult.costUSD,
        spreadsExtracted: spreadResult.spreads.length,
        gamesMatched: matchResult.matches.length,
        gamesUnmatched: matchResult.unmatched.length,
        linesCreated,
        matches: matchResult.matches,
        unmatched: matchResult.unmatched,
        errors: lineErrors.length > 0 ? lineErrors : undefined,
        processingSteps: [
          'Image uploaded successfully',
          `OCR extracted ${ocrResult.text.length} characters with ${ocrResult.confidence.toFixed(1)}% confidence`,
          `LLM found ${spreadResult.spreads.length} spreads using ${spreadResult.provider}`,
          `Matched ${matchResult.matches.length} spreads to existing games`,
          ...(linesCreated > 0
            ? [`Created ${linesCreated} betting lines for pool`]
            : []),
          ...(matchResult.unmatched.length > 0
            ? [
                `${matchResult.unmatched.length} spreads could not be matched to games`,
              ]
            : []),
        ],
      },
    }

    console.log('[Spreads Upload] Upload completed successfully:', {
      spreadsExtracted: spreadResult.spreads.length,
      matched: matchResult.matches.length,
      linesCreated,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Spreads Upload] Processing error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error during spread processing',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
