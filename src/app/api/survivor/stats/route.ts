import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

// GET /api/survivor/stats - Get comprehensive survivor pool statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const poolId = searchParams.get('poolId')
    const week = parseInt(searchParams.get('week') || '1')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Missing poolId parameter' },
        { status: 400 }
      )
    }

    // Fetch pool entries and their picks
    const entries = await prisma.survivorEntry.findMany({
      where: { poolId },
      include: {
        picks: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                nflAbbr: true,
              },
            },
          },
        },
      },
    })

    const totalEntries = entries.length
    const survivorsRemaining = entries.filter((e) => e.isActive).length
    const eliminatedThisWeek = entries.filter(
      (e) => !e.isActive && e.strikes > 0
    ).length // Simplified logic

    // Calculate survival rate
    const survivalRate =
      totalEntries > 0 ? survivorsRemaining / totalEntries : 0

    // Calculate average strikes
    const totalStrikes = entries.reduce((sum, entry) => sum + entry.strikes, 0)
    const averageStrikes = totalEntries > 0 ? totalStrikes / totalEntries : 0

    // Get picks for current week to analyze popularity
    const currentWeekPicks = entries
      .map((entry) => entry.picks.find((pick) => pick.week === week))
      .filter(Boolean)

    // Calculate team usage for current week
    const teamPickCounts: { [teamAbbr: string]: number } = {}
    currentWeekPicks.forEach((pick) => {
      if (pick?.team?.nflAbbr) {
        teamPickCounts[pick.team.nflAbbr] =
          (teamPickCounts[pick.team.nflAbbr] || 0) + 1
      }
    })

    const sortedTeamPicks = Object.entries(teamPickCounts)
      .map(([team, count]) => ({
        team,
        count,
        percentage: (
          (count / Math.max(currentWeekPicks.length, 1)) *
          100
        ).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)

    const mostPopularPick = sortedTeamPicks[0] || { team: 'N/A', percentage: 0 }
    const leastPopularPick = sortedTeamPicks[sortedTeamPicks.length - 1] || {
      team: 'N/A',
      percentage: 0,
    }

    // Mock weekly elimination data (in production, this would be calculated from historical data)
    const weeklyEliminations = Array.from({ length: week }, (_, i) => {
      const weekNum = i + 1
      const mockEliminationRate = Math.random() * 0.3 + 0.1 // 10-40% elimination rate
      const remaining = Math.floor(
        totalEntries * Math.pow(1 - mockEliminationRate, weekNum)
      )
      const eliminated =
        weekNum === 1
          ? totalEntries - remaining
          : Math.floor(
              totalEntries * Math.pow(1 - mockEliminationRate, weekNum - 1)
            ) - remaining

      return {
        week: weekNum,
        eliminated: Math.max(0, eliminated),
        survivalRate: remaining / totalEntries,
      }
    })

    // Calculate overall team usage rates across all weeks
    const allTeamUsage: { [teamAbbr: string]: number } = {}
    entries.forEach((entry) => {
      entry.picks.forEach((pick) => {
        if (pick.team?.nflAbbr) {
          allTeamUsage[pick.team.nflAbbr] =
            (allTeamUsage[pick.team.nflAbbr] || 0) + 1
        }
      })
    })

    const teamUsageRates = Object.entries(allTeamUsage)
      .map(([team, usageCount]) => ({
        team,
        usageCount,
        percentage: ((usageCount / Math.max(entries.length, 1)) * 100).toFixed(
          1
        ),
      }))
      .sort((a, b) => b.usageCount - a.usageCount)

    // Mock biggest upset (would need game results and win probabilities)
    const biggestUpset =
      Math.random() > 0.5
        ? {
            team:
              sortedTeamPicks[
                Math.floor(Math.random() * sortedTeamPicks.length)
              ]?.team || 'N/A',
            winProbability: Math.random() * 0.3 + 0.1, // 10-40% win probability
            week: Math.floor(Math.random() * week) + 1,
          }
        : undefined

    // Project when pool might end
    const projectedWinner = {
      weeks: Math.min(
        18,
        Math.ceil(Math.log(1) / Math.log(survivalRate)) + week
      ),
      probability: Math.min(0.9, survivalRate * 2), // Mock confidence
    }

    const stats = {
      totalEntries,
      survivorsRemaining,
      eliminatedThisWeek,
      survivalRate,
      averageStrikes,
      mostPopularPick: {
        team: mostPopularPick.team,
        percentage: parseFloat(mostPopularPick.percentage),
      },
      leastPopularPick: {
        team: leastPopularPick.team,
        percentage: parseFloat(leastPopularPick.percentage),
      },
      biggestUpset,
      weeklyEliminations,
      teamUsageRates: teamUsageRates.slice(0, 20), // Top 20 most used teams
      projectedWinner,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching survivor stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
