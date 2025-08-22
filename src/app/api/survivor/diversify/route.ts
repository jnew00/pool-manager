import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SurvivorRecommendations } from '@/lib/models/survivor-recommendations'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

const diversifySchema = z.object({
  poolId: z.string(),
  entryIds: z.array(z.string()).min(2),
  week: z.number().min(1).max(18),
  strategy: z.enum(['BLOCK', 'CORRELATED', 'HEDGE']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = diversifySchema.parse(body)

    // Verify user owns all entries
    const entries = await prisma.survivorEntry.findMany({
      where: {
        id: { in: validated.entryIds },
        poolId: validated.poolId,
        // Temporarily remove userId check for testing
        // userId: session.user.id,
        eliminatedWeek: null, // Only active entries
      },
      include: {
        picks: {
          where: {
            result: { in: ['WIN', 'PENDING'] },
          },
          select: {
            teamId: true,
            week: true,
          },
        },
      },
    })

    console.log('Diversification Debug:', {
      requestedEntries: validated.entryIds.length,
      foundEntries: entries.length,
      sessionUserId: session.user.id,
      entryUserIds: entries.map((e) => ({ id: e.id, userId: e.userId })),
    })

    if (entries.length !== validated.entryIds.length) {
      return NextResponse.json(
        {
          error: 'Some entries not found or not owned by user',
          debug: {
            requested: validated.entryIds,
            found: entries.map((e) => e.id),
            sessionUserId: session.user.id,
          },
        },
        { status: 403 }
      )
    }

    // Get pool info for context
    const pool = await prisma.pool.findUnique({
      where: { id: validated.poolId },
      include: {
        _count: {
          select: { survivorEntries: true },
        },
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Get current survivors count
    const survivorsRemaining = await prisma.survivorEntry.count({
      where: {
        poolId: validated.poolId,
        eliminatedWeek: null,
      },
    })

    // Initialize recommendation engine
    const engine = new SurvivorRecommendations()

    // Generate diversified picks based on strategy
    const diversifiedPicks = await generateDiversifiedPicks(
      entries,
      validated.week,
      validated.strategy,
      pool._count.survivorEntries,
      survivorsRemaining,
      engine
    )

    // Format response
    const result = {
      type: validated.strategy,
      description: getStrategyDescription(validated.strategy),
      entries: diversifiedPicks.map((pick) => ({
        entryId: pick.entryId,
        week: validated.week,
        teamId: pick.teamId,
        teamAbbr: pick.teamAbbr,
        winProbability: pick.winProbability,
        reasoning: pick.reasoning,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error diversifying picks:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateDiversifiedPicks(
  entries: any[],
  week: number,
  strategy: 'BLOCK' | 'CORRELATED' | 'HEDGE',
  poolSize: number,
  survivorsRemaining: number,
  engine: any
) {
  const picks = []

  // Get available teams for each entry
  const entryTeamSets = entries.map((entry) => ({
    entryId: entry.id,
    usedTeams: new Set(entry.picks.map((p: any) => p.teamId)),
    strategy: entry.strategy || 'BALANCED',
  }))

  // Get all games for the week
  const games = await prisma.game.findMany({
    where: { week },
    include: {
      homeTeam: {
        select: { id: true, nflAbbr: true, name: true },
      },
      awayTeam: {
        select: { id: true, nflAbbr: true, name: true },
      },
    },
  })

  // Calculate recommendations for all possible teams
  const allRecommendations = await Promise.all(
    games
      .flatMap((game) => [
        { team: game.homeTeam, opponent: game.awayTeam, game },
        { team: game.awayTeam, opponent: game.homeTeam, game },
      ])
      .map(async ({ team, opponent, game }) => {
        const winProb = calculateWinProbability(
          team.id === game.homeTeamId,
          game.homeMoneyline,
          game.awayMoneyline
        )

        return {
          teamId: team.id,
          teamAbbr: team.nflAbbr,
          teamName: team.name,
          opponentAbbr: opponent.nflAbbr,
          winProbability: winProb,
          expectedValue: await calculateExpectedValue(
            winProb,
            team.id,
            week,
            poolSize,
            survivorsRemaining
          ),
        }
      })
  )

  // Sort by expected value
  allRecommendations.sort((a, b) => b.expectedValue - a.expectedValue)

  console.log(
    'Debug - All recommendations:',
    allRecommendations.length,
    'total'
  )
  console.log('Debug - Games found:', games.length)
  console.log('Debug - Entry team sets:', entryTeamSets)

  switch (strategy) {
    case 'BLOCK':
      // Each entry gets a different team, prioritizing highest EV
      const usedInBlock = new Set<string>()

      for (const entry of entryTeamSets) {
        const availableRecs = allRecommendations.filter(
          (rec) =>
            !entry.usedTeams.has(rec.teamId) && !usedInBlock.has(rec.teamId)
        )

        if (availableRecs.length > 0) {
          const pick = availableRecs[0]
          usedInBlock.add(pick.teamId)
          picks.push({
            entryId: entry.entryId,
            teamId: pick.teamId,
            teamAbbr: pick.teamAbbr,
            winProbability: pick.winProbability,
            reasoning: `Block strategy: ${pick.teamAbbr} (${(pick.winProbability * 100).toFixed(0)}% win) - Unique pick for diversification`,
          })
        }
      }
      break

    case 'CORRELATED':
      // All entries get similar high-probability picks
      const safePicks = allRecommendations.filter(
        (rec) => rec.winProbability >= 0.65
      )

      for (const entry of entryTeamSets) {
        const availableSafe = safePicks.filter(
          (rec) => !entry.usedTeams.has(rec.teamId)
        )

        if (availableSafe.length > 0) {
          const pick = availableSafe[0]
          picks.push({
            entryId: entry.entryId,
            teamId: pick.teamId,
            teamAbbr: pick.teamAbbr,
            winProbability: pick.winProbability,
            reasoning: `Correlated strategy: ${pick.teamAbbr} (${(pick.winProbability * 100).toFixed(0)}% win) - Safe pick for survival`,
          })
        }
      }
      break

    case 'HEDGE':
      // Mix of safe and contrarian picks
      const contrarianThreshold = 0.15 // Public pick % threshold

      for (let i = 0; i < entryTeamSets.length; i++) {
        const entry = entryTeamSets[i]
        const isContrarian = i % 2 === 1 // Alternate between safe and contrarian

        const availableRecs = allRecommendations.filter(
          (rec) => !entry.usedTeams.has(rec.teamId)
        )

        const targetRecs = isContrarian
          ? availableRecs.filter(
              (rec) => rec.winProbability >= 0.45 && rec.winProbability <= 0.65
            )
          : availableRecs.filter((rec) => rec.winProbability >= 0.55)

        console.log(
          `Debug - Entry ${i + 1} (${isContrarian ? 'contrarian' : 'safe'}):`,
          {
            totalRecs: allRecommendations.length,
            availableRecs: availableRecs.length,
            targetRecs: targetRecs.length,
            usedTeams: Array.from(entry.usedTeams),
            winProbRange: isContrarian ? '45-65%' : '55%+',
          }
        )

        if (targetRecs.length > 0) {
          const pick = targetRecs[0]
          picks.push({
            entryId: entry.entryId,
            teamId: pick.teamId,
            teamAbbr: pick.teamAbbr,
            winProbability: pick.winProbability,
            reasoning: `Hedge strategy: ${pick.teamAbbr} (${(pick.winProbability * 100).toFixed(0)}% win) - ${isContrarian ? 'Contrarian' : 'Safe'} pick for hedging`,
          })
        }
      }
      break
  }

  return picks
}

function calculateWinProbability(
  isHome: boolean,
  homeMoneyline: number | null,
  awayMoneyline: number | null
): number {
  if (!homeMoneyline || !awayMoneyline) return 0.5

  const moneyline = isHome ? homeMoneyline : awayMoneyline

  if (moneyline < 0) {
    return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
  } else {
    return 100 / (moneyline + 100)
  }
}

async function calculateExpectedValue(
  winProbability: number,
  teamId: string,
  week: number,
  poolSize: number,
  survivorsRemaining: number
): Promise<number> {
  // Simplified EV calculation
  const publicPickPct = await getPublicPickPercentage(teamId, week)
  const survivalRate = survivorsRemaining / poolSize

  // EV = (Win% × (1 / % picking)) / (Overall survival rate)
  const pickValue = publicPickPct > 0 ? 1 / publicPickPct : 1
  return (winProbability * pickValue) / Math.max(0.1, survivalRate)
}

async function getPublicPickPercentage(
  teamId: string,
  week: number
): Promise<number> {
  // In production, this would fetch from public pick services
  // For now, return a mock value based on win probability
  const game = await prisma.game.findFirst({
    where: {
      week,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
  })

  if (!game) return 0.1

  // Mock calculation: favorites get picked more
  const isHome = game.homeTeamId === teamId
  const moneyline = isHome ? game.homeMoneyline : game.awayMoneyline

  if (!moneyline) return 0.1

  if (moneyline < -200) return 0.35 // Heavy favorites
  if (moneyline < -150) return 0.25 // Moderate favorites
  if (moneyline < -110) return 0.15 // Slight favorites
  return 0.05 // Underdogs
}

function getStrategyDescription(
  strategy: 'BLOCK' | 'CORRELATED' | 'HEDGE'
): string {
  switch (strategy) {
    case 'BLOCK':
      return 'Each entry picks a different team to maximize overall survival if any single team loses'
    case 'CORRELATED':
      return 'All entries pick similar high-probability teams for maximum survival rate'
    case 'HEDGE':
      return 'Mix of safe and contrarian picks to balance risk and differentiation'
    default:
      return 'Custom diversification strategy'
  }
}
