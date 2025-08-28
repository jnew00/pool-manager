import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as csv from 'csv-parse/sync'

/**
 * POST /api/pools/[id]/spreads/upload - Upload CSV file with pool-specific spreads
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const poolId = resolvedParams.id
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const season = parseInt(formData.get('season') as string)
    const week = parseInt(formData.get('week') as string)

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!season || !week) {
      return NextResponse.json(
        { error: 'Season and week are required' },
        { status: 400 }
      )
    }

    // Read and parse CSV
    const fileText = await file.text()
    
    let records: any[]
    try {
      records = csv.parse(fileText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid CSV format' },
        { status: 400 }
      )
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }

    // Get games for this season/week to match against
    const games = await prisma.game.findMany({
      where: { season, week },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (games.length === 0) {
      return NextResponse.json(
        { error: `No games found for season ${season} week ${week}` },
        { status: 404 }
      )
    }

    // Process each CSV record
    let createdCount = 0
    let updatedCount = 0
    const errors: string[] = []

    for (const record of records) {
      try {
        // Extract team abbreviations (normalize case and whitespace)
        const awayTeam = record['Away Team']?.trim().toUpperCase()
        const homeTeam = record['Home Team']?.trim().toUpperCase()
        
        if (!awayTeam || !homeTeam) {
          errors.push(`Row missing team data: ${JSON.stringify(record)}`)
          continue
        }

        // Find matching game
        const game = games.find(g => 
          g.awayTeam.nflAbbr === awayTeam && g.homeTeam.nflAbbr === homeTeam
        )

        if (!game) {
          errors.push(`No game found for ${awayTeam} @ ${homeTeam}`)
          continue
        }

        // Extract spread data
        const spread = record['Spread'] ? parseFloat(record['Spread']) : null
        const total = record['Total'] ? parseFloat(record['Total']) : null
        const moneylineHome = record['ML Home'] ? parseInt(record['ML Home']) : null
        const moneylineAway = record['ML Away'] ? parseInt(record['ML Away']) : null

        // Check if line already exists for this pool/game
        const existingLine = await prisma.line.findFirst({
          where: {
            gameId: game.id,
            poolId,
          },
        })

        const lineData = {
          gameId: game.id,
          poolId,
          spread,
          total,
          moneylineHome,
          moneylineAway,
          source: 'csv_upload',
          isUserProvided: true,
          capturedAt: new Date(),
        }

        if (existingLine) {
          // Update existing line
          await prisma.line.update({
            where: { id: existingLine.id },
            data: lineData,
          })
          updatedCount++
        } else {
          // Create new line
          await prisma.line.create({
            data: lineData,
          })
          createdCount++
        }
      } catch (recordError) {
        errors.push(`Error processing row ${JSON.stringify(record)}: ${recordError}`)
      }
    }

    const totalProcessed = createdCount + updatedCount

    return NextResponse.json({
      success: true,
      count: totalProcessed,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${totalProcessed} spreads (${createdCount} created, ${updatedCount} updated)${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    })
  } catch (error) {
    console.error('Failed to upload CSV spreads:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload CSV spreads',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}