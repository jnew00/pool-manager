import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { poolId, spreads, source = 'Pool Upload' } = await request.json()

    if (!poolId || !spreads || !Array.isArray(spreads)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create lines for each spread
    const createdLines = []
    const errors = []

    for (const spread of spreads) {
      if (!spread.gameId) {
        errors.push(`No gameId for ${spread.awayTeam} @ ${spread.homeTeam}`)
        continue
      }

      try {
        // Check if line already exists for this game and pool
        const existingLine = await prisma.line.findFirst({
          where: {
            gameId: spread.gameId,
            poolId: poolId,
          }
        })

        if (existingLine) {
          // Update existing line
          const updated = await prisma.line.update({
            where: { id: existingLine.id },
            data: {
              spread: spread.spread,
              source: source,
              isUserProvided: true,
            }
          })
          createdLines.push(updated)
        } else {
          // Create new line
          const created = await prisma.line.create({
            data: {
              gameId: spread.gameId,
              poolId: poolId,
              source: source,
              spread: spread.spread,
              total: null,
              moneylineHome: null,
              moneylineAway: null,
              isUserProvided: true,
            }
          })
          createdLines.push(created)
        }
      } catch (error) {
        console.error(`Error creating line for game ${spread.gameId}:`, error)
        errors.push(`Failed to create line for ${spread.awayTeam} @ ${spread.homeTeam}`)
      }
    }

    return NextResponse.json({
      success: true,
      created: createdLines.length,
      errors: errors,
      lines: createdLines
    })
  } catch (error) {
    console.error('Error in batch line creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}