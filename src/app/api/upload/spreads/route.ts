import { NextRequest, NextResponse } from 'next/server'
import { ServerOCRService } from '@/features/uploads/services/server-ocr.service'
import { createLLMNormalizerService } from '@/features/uploads/services/llm-normalizer.service'
import { gameMatcherService } from '@/features/uploads/services/game-matcher.service'
import { setLastUploadResult } from '@/lib/debug-store'


/**
 * POST /api/upload/spreads - Upload image with pool-specific spreads
 * This endpoint focuses on extracting only spreads and matching them to existing ESPN games
 */
export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const season =
      parseInt(formData.get('season') as string) || new Date().getFullYear()
    const week = parseInt(formData.get('week') as string) || 1
    const poolId = formData.get('poolId') as string

    console.log('[Spreads Upload] Processing:', { season, week, poolId, fileName: file?.name, fileSize: file?.size })

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
      const serverOCRService = new ServerOCRService()
      return await serverOCRService.processImageFile(file)
    })()

    const ocrResult = await Promise.race([ocrProcessing, ocrTimeout])

    
    // Save OCR text for debugging
    const fs = await import('fs')
    const debugPath = '/tmp/last-ocr-output.txt'
    await fs.promises.writeFile(debugPath, ocrResult.text)
    console.log('[Spreads Upload] OCR text saved to:', debugPath)
    
    // Preprocess OCR text for better LLM parsing
    const { preprocessOCRText } = await import('@/features/uploads/services/ocr-preprocessor')
    const processedText = preprocessOCRText(ocrResult.text)
    console.log('[Spreads Upload] Preprocessed text:', processedText)
    await fs.promises.writeFile('/tmp/last-ocr-processed.txt', processedText)
    
    // Parse preprocessed text directly if it's already in clean format
    const processedLines = processedText.split('\n').filter(line => line.trim())
    const directParsedSpreads = []
    
    // Helper function to convert team names to abbreviations
    const teamNameToAbbr = (teamName: string): string => {
      const nameMap: Record<string, string> = {
        // Full names to abbreviations
        'Cardinals': 'ARI', 'Arizona': 'ARI',
        'Falcons': 'ATL', 'Atlanta': 'ATL', 
        'Ravens': 'BAL', 'Baltimore': 'BAL',
        'Bills': 'BUF', 'Buffalo': 'BUF',
        'Panthers': 'CAR', 'Carolina': 'CAR',
        'Bears': 'CHI', 'Chicago': 'CHI',
        'Bengals': 'CIN', 'Cincinnati': 'CIN',
        'Browns': 'CLE', 'Cleveland': 'CLE',
        'Cowboys': 'DAL', 'Dallas': 'DAL',
        'Broncos': 'DEN', 'Denver': 'DEN',
        'Lions': 'DET', 'Detroit': 'DET',
        'Packers': 'GB', 'Green Bay': 'GB',
        'Texans': 'HOU', 'Houston': 'HOU',
        'Colts': 'IND', 'Indianapolis': 'IND',
        'Jaguars': 'JAX', 'Jacksonville': 'JAX', 'Jags': 'JAX',
        'Chiefs': 'KC', 'Kansas City': 'KC',
        'Raiders': 'LVR', 'Las Vegas': 'LVR', 'Vegas': 'LVR', 'Oakland': 'LVR',
        'Chargers': 'LAC', 'Los Angeles Chargers': 'LAC',
        'Rams': 'LAR', 'Los Angeles Rams': 'LAR',
        'Dolphins': 'MIA', 'Miami': 'MIA',
        'Vikings': 'MIN', 'Minnesota': 'MIN',
        'Patriots': 'NE', 'New England': 'NE',
        'Saints': 'NO', 'New Orleans': 'NO',
        'Giants': 'NYG', 'New York Giants': 'NYG',
        'Jets': 'NYJ', 'New York Jets': 'NYJ',
        'Eagles': 'PHI', 'Philadelphia': 'PHI',
        'Steelers': 'PIT', 'Pittsburgh': 'PIT',
        '49ers': 'SF', 'San Francisco': 'SF', 'Niners': 'SF',
        'Seahawks': 'SEA', 'Seattle': 'SEA',
        'Buccaneers': 'TB', 'Tampa Bay': 'TB', 'Bucs': 'TB',
        'Titans': 'TEN', 'Tennessee': 'TEN',
        'Commanders': 'WAS', 'Washington': 'WAS'
      }
      
      // Return abbreviation if found, otherwise return original
      return nameMap[teamName] || teamName
    }

    console.log('[Spreads Upload] Processing lines for direct parsing:')
    for (const line of processedLines) {
      console.log(`[Spreads Upload]   Line: "${line}"`)
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 3) {
        // Format: Team1 Team2 Spread
        // Use our mandatory fallback rule: FIRST/LEFT = AWAY, SECOND/RIGHT = HOME
        const team1Raw = parts[0]
        const team2Raw = parts[1]
        const spreadValue = parseFloat(parts[2])
        
        // Convert team names to abbreviations for better matching
        const team1 = teamNameToAbbr(team1Raw)
        const team2 = teamNameToAbbr(team2Raw)
        
        if (!isNaN(spreadValue)) {
          // Always treat first team as away, second team as home (our fallback rule)
          directParsedSpreads.push({
            away_team: team1,
            home_team: team2,
            spread_for_home: spreadValue,
            is_pickem: Math.abs(spreadValue) < 0.5,
            issues: []
          })
          console.log(`[Spreads Upload]   Parsed: ${team1Raw}(${team1}) @ ${team2Raw}(${team2}) spread=${spreadValue}`)
        }
      }
    }
    
    console.log(`[Spreads Upload] Direct parsing found ${directParsedSpreads.length} spreads`)

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

    // Step 2: Use spreads (prefer direct parsing over LLM if available)
    let spreadResult
    if (directParsedSpreads.length > 0) {
      console.log('[Spreads Upload] Using direct parsed spreads')
      spreadResult = {
        spreads: directParsedSpreads,
        success: true,
        provider: 'direct-parser'
      }
    } else {
      // Fallback to LLM if direct parsing failed
      console.log('[Spreads Upload] Falling back to LLM extraction...')
      let llmService
      try {
        llmService = createLLMNormalizerService()
        console.log('[Spreads Upload] LLM service created successfully')
        
        spreadResult = await llmService.normalizeSpreads(processedText)
        console.log('[Spreads Upload] LLM normalization completed')
      } catch (serviceError) {
        console.error('[Spreads Upload] LLM service failed:', serviceError)
        return NextResponse.json(
          {
            error: 'Failed to extract spreads',
            details: serviceError instanceof Error ? serviceError.message : 'Both direct parsing and LLM failed',
            extractedText: ocrResult.text,
            ocrConfidence: ocrResult.confidence,
            success: false,
          },
          { status: 500 }
        )
      }
    }

    console.log('[Spreads Upload] LLM spread extraction completed:', {
      success: spreadResult.success,
      spreadCount: spreadResult.spreads.length,
      provider: spreadResult.provider,
    })

    // DETAILED LOGGING: Show what the LLM actually parsed
    console.log('[Spreads Upload] ===== LLM PARSED SPREADS =====')
    spreadResult.spreads.forEach((spread, index) => {
      console.log(`[Spreads Upload] Spread ${index + 1}:`)
      console.log(`  Away Team: "${spread.away_team}"`)
      console.log(`  Home Team: "${spread.home_team}"`)
      console.log(`  Spread for Home: ${spread.spread_for_home}`)
      console.log(`  Issues: ${JSON.stringify(spread.issues)}`)
    })
    console.log('[Spreads Upload] ===============================')
    
    // Store for debugging
    setLastUploadResult({
      ocrText: ocrResult.text,
      parsedSpreads: spreadResult.spreads,
      matchResults: null, // Will be updated later
      timestamp: new Date().toISOString()
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
    let matchResult
    try {
      matchResult = await gameMatcherService.matchSpreadsToGames(
        spreadResult.spreads,
        season,
        week
      )
      console.log('[Spreads Upload] Game matching completed')
    } catch (matchingError) {
      console.error('[Spreads Upload] Game matching failed:', matchingError)
      return NextResponse.json(
        {
          error: 'Failed to match spreads to games',
          details: matchingError instanceof Error ? matchingError.message : 'Unknown matching error',
          extractedSpreads: spreadResult.spreads,
          success: false,
        },
        { status: 500 }
      )
    }

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

    // DETAILED LOGGING: Show matching results
    console.log('[Spreads Upload] ===== MATCHING RESULTS =====')
    console.log(`[Spreads Upload] Successfully matched ${matchResult.matches.length} games:`)
    matchResult.matches.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.awayTeam} @ ${match.homeTeam} - Spread: ${match.spread}`)
    })
    console.log(`[Spreads Upload] Failed to match ${matchResult.unmatched.length} spreads:`)
    matchResult.unmatched.forEach((unmatched, index) => {
      console.log(`  ${index + 1}. "${unmatched.away_team}" @ "${unmatched.home_team}" - Spread: ${unmatched.spread_for_home}`)
    })
    console.log('[Spreads Upload] ===============================')
    
    // Update debug data with match results
    setLastUploadResult({
      ocrText: ocrResult.text,
      parsedSpreads: spreadResult.spreads,
      matchResults: {
        matched: matchResult.matches,
        unmatched: matchResult.unmatched
      },
      timestamp: new Date().toISOString()
    })
    
    // Add debugging for modal display logic
    console.log('[Spreads Upload] ===== MODAL DISPLAY DEBUG =====')
    console.log(`[Spreads Upload] Matches count: ${matchResult.matches.length}`)
    console.log(`[Spreads Upload] Unmatched count: ${matchResult.unmatched.length}`)
    console.log('[Spreads Upload] Matches array:', JSON.stringify(matchResult.matches, null, 2))
    console.log('[Spreads Upload] Unmatched array:', JSON.stringify(matchResult.unmatched, null, 2))
    console.log('[Spreads Upload] ===============================')

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
