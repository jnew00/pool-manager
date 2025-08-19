import { NextRequest, NextResponse } from 'next/server'
import { getMockOCRService } from '@/features/uploads/services/mock-ocr.service'
import { createLLMNormalizerService } from '@/features/uploads/services/llm-normalizer.service'

// Use mock OCR if tesseract.js has issues
const USE_MOCK_OCR = process.env.USE_MOCK_OCR === 'true'

export async function POST(request: NextRequest) {
  console.log('[OCR API] Starting image processing...')

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const season =
      parseInt(formData.get('season') as string) || new Date().getFullYear()
    const week = parseInt(formData.get('week') as string) || 1

    console.log('[OCR API] File received:', file?.name, file?.size, file?.type)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG and JPEG images are supported.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Step 1: Extract text from image using OCR
    console.log('[OCR API] Initializing OCR service...')

    // Add timeout to prevent hanging
    const ocrTimeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('OCR processing timeout after 30 seconds')),
        30000
      )
    })

    const ocrProcessing = (async () => {
      if (USE_MOCK_OCR) {
        console.log('[OCR API] Using mock OCR service...')
        const mockOCRService = await getMockOCRService()
        return await mockOCRService.processImageFile(file)
      } else {
        console.log('[OCR API] Loading real OCR service...')
        // Dynamic import to avoid loading tesseract.js when using mock
        const { getOCRService } = await import(
          '@/features/uploads/services/ocr.service'
        )
        const ocrService = await getOCRService()
        console.log('[OCR API] Processing image with tesseract.js...')
        return await ocrService.processImageFile(file)
      }
    })()

    const ocrResult = await Promise.race([ocrProcessing, ocrTimeout])

    console.log('[OCR API] OCR completed:', {
      textLength: ocrResult.text.length,
      confidence: ocrResult.confidence,
      errors: ocrResult.errors,
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

    // Step 2: Normalize extracted text using LLM
    console.log('[OCR API] Starting LLM normalization...')
    const llmService = createLLMNormalizerService()
    console.log('[OCR API] LLM service created, calling normalizeText...')
    const normalizationResult = await llmService.normalizeText(
      ocrResult.text,
      season,
      week
    )
    console.log('[OCR API] LLM normalization completed:', {
      success: normalizationResult.success,
      rowCount: normalizationResult.rows.length,
      provider: normalizationResult.provider,
      error: normalizationResult.error,
    })

    if (!normalizationResult.success) {
      // If LLM is disabled, return the raw text and let the user know
      if (normalizationResult.error === 'LLM normalization is disabled') {
        return NextResponse.json(
          {
            success: false,
            error:
              'LLM normalization is disabled. Enable LLM_NORMALIZER_PROVIDER in your environment variables to use AI normalization.',
            extractedText: ocrResult.text,
            ocrConfidence: ocrResult.confidence,
            rawOcrData: {
              text: ocrResult.text,
              confidence: ocrResult.confidence,
            },
            message:
              'OCR extraction completed successfully, but LLM normalization is disabled. You can manually parse the extracted text or enable LLM normalization.',
          },
          { status: 200 }
        ) // Return 200 since OCR worked
      }

      // Other LLM errors should be 500
      return NextResponse.json(
        {
          error: 'Failed to normalize extracted text',
          details: normalizationResult.error,
          extractedText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          success: false,
        },
        { status: 500 }
      )
    }

    // Step 3: Create games and lines in database if poolId provided
    const poolId = formData.get('poolId') as string | null
    let gamesCreated = 0
    let linesCreated = 0
    let externalDataFetched = false

    if (poolId && normalizationResult.rows.length > 0) {
      try {
        const createGamesResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3003'}/api/games`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              games: normalizationResult.rows,
              poolId: poolId,
            }),
          }
        )

        if (createGamesResponse.ok) {
          const createGamesResult = await createGamesResponse.json()
          gamesCreated = createGamesResult.data?.gamesCreated || 0
          linesCreated = createGamesResult.data?.linesCreated || 0

          // Step 4: Automatically fetch external data for the created games
          if (gamesCreated > 0) {
            try {
              console.log(
                '[OCR API] Automatically fetching external data for new games...'
              )
              const dataSourcesResponse = await fetch(
                `${process.env.NEXTAUTH_URL || 'http://localhost:3003'}/api/data-sources`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    season: season,
                    week: week,
                    dataTypes: ['odds', 'weather'],
                  }),
                }
              )

              if (dataSourcesResponse.ok) {
                const dataSourcesResult = await dataSourcesResponse.json()
                externalDataFetched = dataSourcesResult.success
                console.log(
                  '[OCR API] External data fetch result:',
                  dataSourcesResult.data
                )
              }
            } catch (error) {
              console.error('[OCR API] Failed to fetch external data:', error)
              // Continue without failing - games were created successfully
            }
          }
        }
      } catch (error) {
        console.error('[OCR API] Failed to create games:', error)
        // Continue without failing - user will see games data but creation failed
      }
    }

    // Step 5: Return successful result
    return NextResponse.json({
      success: true,
      data: {
        games: normalizationResult.rows,
        extractedText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        llmProvider: normalizationResult.provider,
        tokensUsed: normalizationResult.tokensUsed,
        estimatedCostUSD: normalizationResult.costUSD,
        gamesCreated,
        linesCreated,
        externalDataFetched,
        processingSteps: [
          'Image uploaded successfully',
          `OCR extracted ${ocrResult.text.length} characters with ${ocrResult.confidence.toFixed(1)}% confidence`,
          `LLM normalized ${normalizationResult.rows.length} games using ${normalizationResult.provider}`,
          ...(gamesCreated > 0
            ? [
                `Created ${gamesCreated} games and ${linesCreated} betting lines in database`,
              ]
            : []),
          ...(externalDataFetched
            ? ['Automatically fetched latest odds and weather data']
            : []),
        ],
      },
    })
  } catch (error) {
    console.error('OCR processing error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error during image processing',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
