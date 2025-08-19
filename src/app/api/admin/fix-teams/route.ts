import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/admin/fix-teams - Add missing NFL teams and fix abbreviations
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Fix Teams] Adding missing teams and fixing abbreviations...')

    const results = {
      teamsCreated: 0,
      teamsUpdated: 0,
      errors: [] as string[],
    }

    // Create missing teams
    const missingTeams = [
      {
        name: 'Tampa Bay Buccaneers',
        nflAbbr: 'TB',
      },
      {
        name: 'Tennessee Titans',
        nflAbbr: 'TEN',
      },
    ]

    for (const team of missingTeams) {
      try {
        // Check if team already exists
        const existing = await prisma.team.findUnique({
          where: { nflAbbr: team.nflAbbr },
        })

        if (!existing) {
          await prisma.team.create({
            data: team,
          })
          results.teamsCreated++
          console.log(`[Fix Teams] Created: ${team.name} (${team.nflAbbr})`)
        } else {
          console.log(
            `[Fix Teams] Already exists: ${team.name} (${team.nflAbbr})`
          )
        }
      } catch (error) {
        const errorMsg = `Failed to create ${team.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(`[Fix Teams] ${errorMsg}`)
      }
    }

    // Fix abbreviation mismatches
    const abbreviationFixes = [
      { oldAbbr: 'LVR', newAbbr: 'LV', name: 'Las Vegas Raiders' },
      { oldAbbr: 'WAS', newAbbr: 'WSH', name: 'Washington Commanders' },
    ]

    for (const fix of abbreviationFixes) {
      try {
        const team = await prisma.team.findUnique({
          where: { nflAbbr: fix.oldAbbr },
        })

        if (team) {
          await prisma.team.update({
            where: { nflAbbr: fix.oldAbbr },
            data: { nflAbbr: fix.newAbbr },
          })
          results.teamsUpdated++
          console.log(
            `[Fix Teams] Updated: ${fix.name} ${fix.oldAbbr} → ${fix.newAbbr}`
          )
        } else {
          console.log(`[Fix Teams] Team not found: ${fix.oldAbbr}`)
        }
      } catch (error) {
        const errorMsg = `Failed to update ${fix.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(`[Fix Teams] ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        message: `Team fixes complete: ${results.teamsCreated} created, ${results.teamsUpdated} updated`,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[Fix Teams] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fix teams',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
