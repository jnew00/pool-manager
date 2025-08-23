import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SurvivorRecommendations } from '@/lib/models/survivor-recommendations'
import { realTeamAnalysis } from '@/lib/models/real-team-analysis'
import { z } from 'zod'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

// Request validation schema
const RecommendationRequestSchema = z.object({
  poolId: z.string(),
  entryId: z.string(),
  week: z.number().min(1).max(18),
  strategy: z
    .enum(['CONSERVATIVE', 'BALANCED', 'CONTRARIAN', 'RISK_SEEKING', 'CUSTOM'])
    .optional(),
  customWeights: z
    .object({
      winProbabilityWeight: z.number().min(0).max(1),
      evWeight: z.number().min(0).max(1),
      futureValueWeight: z.number().min(0).max(1),
      publicFadeWeight: z.number().min(0).max(1),
      minWinProbability: z.number().min(0.5).max(0.8),
      maxPublicPickPercentage: z.number().min(1).max(100),
      futureValueThreshold: z.number().min(1).max(5),
    })
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Get session (authentication)
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const poolId = searchParams.get('poolId')
    const entryId = searchParams.get('entryId')
    const week = parseInt(searchParams.get('week') || '1')
    const strategy = searchParams.get('strategy') || 'BALANCED'

    if (!poolId || !entryId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate the entry belongs to the pool
    const survivorEntry = await prisma.survivorEntry.findFirst({
      where: {
        id: entryId,
        poolId,
      },
      include: {
        picks: {
          select: {
            teamId: true,
            week: true,
            result: true,
          },
        },
        pool: true,
      },
    })

    if (!survivorEntry) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if entry is still active
    if (!survivorEntry.isActive) {
      return NextResponse.json(
        {
          error: 'Entry has been eliminated',
          eliminatedWeek: survivorEntry.eliminatedWeek,
          strikes: survivorEntry.strikes,
        },
        { status: 400 }
      )
    }

    // Get used teams
    const usedTeams = new Set(survivorEntry.picks.map((p) => p.teamId))

    // Get pool statistics
    const poolStats = await prisma.survivorEntry.findMany({
      where: {
        poolId,
      },
      select: {
        isActive: true,
      },
    })

    const poolSize = poolStats.length
    const survivorsRemaining = poolStats.filter((e) => e.isActive).length

    // Check data availability first
    const dataAvailability = await realTeamAnalysis.checkRealDataAvailability()

    // Generate recommendations
    const recommender = new SurvivorRecommendations()
    const recommendations = await recommender.generateWeekRecommendations(
      poolId,
      week,
      usedTeams,
      strategy as any,
      poolSize,
      survivorsRemaining
    )

    // Add metadata with data source information
    const response = {
      ...recommendations,
      entry: {
        id: entryId,
        entryName: survivorEntry.entryName,
        strikes: survivorEntry.strikes,
        weeksSurvived: survivorEntry.picks.filter((p) => p.result === 'WIN')
          .length,
        usedTeams: Array.from(usedTeams),
      },
      pool: {
        id: poolId,
        name: survivorEntry.pool.name,
        totalEntries: poolSize,
        survivorsRemaining,
        survivalRate: ((survivorsRemaining / poolSize) * 100).toFixed(1),
      },
      dataSource: {
        available: dataAvailability.available,
        seasonActive: dataAvailability.seasonActive,
        currentWeek: dataAvailability.currentWeek,
        message: dataAvailability.message,
      },
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request
    const validation = RecommendationRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      )
    }

    const { poolId, entryId, week, strategy, customWeights } = validation.data

    // Get survivor entry with validation
    const survivorEntry = await prisma.survivorEntry.findFirst({
      where: {
        id: entryId,
        poolId,
      },
      include: {
        picks: true,
        pool: true,
      },
    })

    if (!survivorEntry) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check for existing pick this week
    const existingPick = survivorEntry.picks.find((p) => p.week === week)
    if (existingPick) {
      return NextResponse.json(
        { error: `Already picked for week ${week}` },
        { status: 400 }
      )
    }

    // Get used teams
    const usedTeams = new Set(survivorEntry.picks.map((p) => p.teamId))

    // Get pool statistics
    const poolStats = await prisma.survivorEntry.findMany({
      where: {
        poolId,
      },
    })

    const poolSize = poolStats.length
    const survivorsRemaining = poolStats.filter((e) => e.isActive).length

    // Generate recommendations with custom strategy
    const recommender = new SurvivorRecommendations()
    const recommendations = await recommender.generateWeekRecommendations(
      poolId,
      week,
      usedTeams,
      strategy || 'BALANCED',
      poolSize,
      survivorsRemaining
    )

    // Save recommendation request for analytics
    await prisma.survivorWeekData
      .update({
        where: {
          poolId_week: { poolId, week },
        },
        data: {
          // Increment recommendation requests counter
          // This would be a new field in production
        },
      })
      .catch(() => {
        // Create if doesn't exist
        return prisma.survivorWeekData.create({
          data: {
            poolId,
            week,
            totalEntries: poolSize,
            survivorsRemaining,
            entriesEliminated: poolSize - survivorsRemaining,
            survivalRate: survivorsRemaining / poolSize,
            teamPickDistribution: {},
            topPickTeam: recommendations.primaryPick.teamAbbr,
            topPickPercentage: recommendations.primaryPick.publicPickPercentage,
          },
        })
      })

    return NextResponse.json({
      success: true,
      recommendations,
      entry: {
        id: entryId,
        usedTeams: Array.from(usedTeams),
        weeksSurvived: survivorEntry.picks.filter((p) => p.result === 'WIN')
          .length,
      },
    })
  } catch (error) {
    console.error('Error processing recommendation request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Endpoint to get historical recommendations performance
export async function GET_PERFORMANCE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const poolId = searchParams.get('poolId')
    const weeks = parseInt(searchParams.get('weeks') || '4')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Missing poolId parameter' },
        { status: 400 }
      )
    }

    // Get historical performance data
    const weekData = await prisma.survivorWeekData.findMany({
      where: {
        poolId,
        week: {
          lte: weeks,
        },
      },
      orderBy: {
        week: 'asc',
      },
    })

    // Calculate performance metrics
    const performance = weekData.map((w) => ({
      week: w.week,
      survivalRate: w.survivalRate,
      topPickTeam: w.topPickTeam,
      topPickSuccess: w.topPickTeam ? true : false, // Would check actual results
      contrarianSuccess: false, // Would calculate from actual data
      weatherImpact: false, // Would check if weather affected outcomes
    }))

    return NextResponse.json({
      poolId,
      weeksAnalyzed: weeks,
      performance,
      summary: {
        averageSurvivalRate:
          weekData.reduce((sum, w) => sum + w.survivalRate, 0) /
          weekData.length,
        totalEliminations: weekData.reduce(
          (sum, w) => sum + w.entriesEliminated,
          0
        ),
        mostPopularTeams: [], // Would aggregate from teamPickDistribution
      },
    })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
