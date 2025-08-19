import { PrismaClient } from '@prisma/client'
import type { NormalizedSpreadData } from './llm-normalizer.service'

const prisma = new PrismaClient()

export interface GameMatchResult {
  gameId: string
  homeTeam: string
  awayTeam: string
  spread: number | null
  matched: boolean
  issues: string[]
}

export interface GameMatchingResult {
  matches: GameMatchResult[]
  unmatched: NormalizedSpreadData[]
  success: boolean
  error?: string
}

/**
 * Service to match uploaded spread data with existing games in the database
 */
export class GameMatcherService {
  /**
   * Match uploaded spreads with existing games for a given season/week
   */
  async matchSpreadsToGames(
    spreads: NormalizedSpreadData[],
    season: number,
    week: number
  ): Promise<GameMatchingResult> {
    try {
      // Get all games for the specified week
      const games = await prisma.game.findMany({
        where: { season, week },
        include: {
          homeTeam: {
            select: {
              id: true,
              nflAbbr: true,
              name: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              nflAbbr: true,
              name: true,
            },
          },
        },
      })

      console.log(
        `[GameMatcher] Found ${games.length} games for season ${season}, week ${week}`
      )
      console.log(
        `[GameMatcher] Attempting to match ${spreads.length} uploaded spreads`
      )

      const matches: GameMatchResult[] = []
      const unmatched: NormalizedSpreadData[] = []

      for (const spread of spreads) {
        const matchResult = this.findMatchingGame(spread, games)

        if (matchResult) {
          matches.push({
            gameId: matchResult.id,
            homeTeam: matchResult.homeTeam.nflAbbr,
            awayTeam: matchResult.awayTeam.nflAbbr,
            spread: spread.spread_for_home,
            matched: true,
            issues: spread.issues,
          })
          console.log(
            `[GameMatcher] ✓ Matched: ${spread.away_team} @ ${spread.home_team} → ${matchResult.awayTeam.nflAbbr} @ ${matchResult.homeTeam.nflAbbr}`
          )
        } else {
          unmatched.push(spread)
          console.log(
            `[GameMatcher] ✗ No match: ${spread.away_team} @ ${spread.home_team}`
          )
        }
      }

      return {
        matches,
        unmatched,
        success: true,
      }
    } catch (error) {
      console.error('[GameMatcher] Error matching spreads to games:', error)
      return {
        matches: [],
        unmatched: spreads,
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown matching error',
      }
    }
  }

  /**
   * Find a matching game for a spread entry
   */
  private findMatchingGame(
    spread: NormalizedSpreadData,
    games: any[]
  ): any | null {
    // Try exact match first
    let match = games.find(
      (game) =>
        game.homeTeam.nflAbbr === spread.home_team &&
        game.awayTeam.nflAbbr === spread.away_team
    )

    if (match) {
      return match
    }

    // Try with team abbreviation variations
    match = games.find((game) => {
      const homeMatch = this.teamMatches(
        game.homeTeam.nflAbbr,
        spread.home_team
      )
      const awayMatch = this.teamMatches(
        game.awayTeam.nflAbbr,
        spread.away_team
      )
      return homeMatch && awayMatch
    })

    return match || null
  }

  /**
   * Check if two team abbreviations represent the same team
   * Handles variations, abbreviations, nicknames, and fuzzy matching
   */
  private teamMatches(dbTeam: string, uploadTeam: string): boolean {
    // Comprehensive team name variations for NFL teams
    const variations: Record<string, string[]> = {
      ARI: ['Arizona', 'Cardinals', 'AZ', 'ARIZ', 'Card', 'Cards', 'Cardinal'],
      ATL: ['Atlanta', 'Falcons', 'GA', 'Falcon', 'Dirty Birds'],
      BAL: ['Baltimore', 'Ravens', 'MD', 'Raven'],
      BUF: ['Buffalo', 'Bills', 'NY', 'Bill', 'Mafia'],
      CAR: ['Carolina', 'Panthers', 'NC', 'Panther', 'CAR', 'Cats'],
      CHI: ['Chicago', 'Bears', 'IL', 'Bear', 'Da Bears'],
      CIN: ['Cincinnati', 'Bengals', 'OH', 'Bengal', 'Stripes'],
      CLE: ['Cleveland', 'Browns', 'OH', 'Brown', 'Factory of Sadness'],
      DAL: ['Dallas', 'Cowboys', 'TX', 'Cowboy', 'Boys', 'Americas Team'],
      DEN: ['Denver', 'Broncos', 'CO', 'Bronco', 'Orange Crush'],
      DET: ['Detroit', 'Lions', 'MI', 'Lion'],
      GB: [
        'Green Bay',
        'Packers',
        'WI',
        'GNB',
        'Packer',
        'Pack',
        'Cheeseheads',
      ],
      HOU: ['Houston', 'Texans', 'TX', 'Texan'],
      IND: ['Indianapolis', 'Colts', 'IN', 'Colt', 'Horseshoe'],
      JAX: ['Jacksonville', 'Jaguars', 'FL', 'JAC', 'Jaguar', 'Jags', 'Duval'],
      KC: ['Kansas City', 'Chiefs', 'MO', 'KAN', 'Chief', 'Kingdom'],
      LV: [
        'Las Vegas',
        'Raiders',
        'NV',
        'LVR',
        'Oakland',
        'Raider',
        'LV',
        'Vegas',
        'OAK',
        'Silver and Black',
        'Nation',
      ],
      LAC: [
        'Los Angeles',
        'Chargers',
        'CA',
        'LAC',
        'San Diego',
        'Charger',
        'Bolts',
        'SD',
        'Powder Blue',
      ],
      LAR: ['Los Angeles', 'Rams', 'CA', 'LAR', 'Ram', 'Horns'],
      MIA: ['Miami', 'Dolphins', 'FL', 'Dolphin', 'Fins', 'Aqua'],
      MIN: [
        'Minnesota',
        'Vikings',
        'MN',
        'Viking',
        'Vikes',
        'Purple People Eaters',
      ],
      NE: [
        'New England',
        'Patriots',
        'MA',
        'NWE',
        'Patriot',
        'Pats',
        'Flying Elvis',
      ],
      NO: ['New Orleans', 'Saints', 'LA', 'NOR', 'Saint', 'Who Dat'],
      NYG: ['New York', 'Giants', 'NY', 'NYG', 'Giant', 'G-Men', 'Big Blue'],
      NYJ: ['New York', 'Jets', 'NY', 'NYJ', 'Jet', 'Gang Green'],
      PHI: [
        'Philadelphia',
        'Eagles',
        'PA',
        'Eagle',
        'Iggles',
        'Fly Eagles Fly',
      ],
      PIT: [
        'Pittsburgh',
        'Steelers',
        'PA',
        'Steeler',
        'Steel Curtain',
        'Black and Gold',
      ],
      SF: [
        'San Francisco',
        'Forty Niners',
        '49ers',
        'CA',
        'SFO',
        'Niners',
        '49er',
        'Faithful',
      ],
      SEA: ['Seattle', 'Seahawks', 'WA', 'Seahawk', 'Hawks', '12th Man'],
      TB: [
        'Tampa Bay',
        'Buccaneers',
        'Bucs',
        'FL',
        'TBB',
        'TPA',
        'TAM',
        'Tampa',
        'Buccaneer',
        'Fire the Cannons',
      ],
      TEN: ['Tennessee', 'Titans', 'TN', 'Titan', 'Oilers'],
      WAS: [
        'Washington',
        'Commanders',
        'DC',
        'WSH',
        'Commander',
        'WFT',
        'Football Team',
        'Burgundy and Gold',
      ],
    }

    // Normalize inputs - remove common words and punctuation
    const normalize = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\b(team|football|nfl|fc|the)\b/g, '') // Remove common words
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
    }

    const normalizedDb = normalize(dbTeam)
    const normalizedUpload = normalize(uploadTeam)

    // Exact match after normalization
    if (normalizedDb === normalizedUpload) return true

    // Check if upload team matches any variation of db team
    const dbVariations = variations[dbTeam] || []
    if (
      dbVariations.some(
        (variation) => normalize(variation) === normalizedUpload
      )
    ) {
      return true
    }

    // Check reverse - if db team matches variation of upload team
    for (const [abbr, teamVariations] of Object.entries(variations)) {
      if (
        teamVariations.some((v) => normalize(v) === normalizedDb) &&
        teamVariations.some((v) => normalize(v) === normalizedUpload)
      ) {
        return true
      }
    }

    // Fuzzy partial matches for team names (minimum 3 characters)
    if (normalizedUpload.length >= 3 && normalizedDb.length >= 3) {
      // Check if one contains the other
      if (
        normalizedUpload.includes(normalizedDb) ||
        normalizedDb.includes(normalizedUpload)
      ) {
        return true
      }

      // Check if either normalized value contains variations
      for (const variation of dbVariations) {
        const normalizedVar = normalize(variation)
        if (
          normalizedVar.length >= 3 &&
          (normalizedUpload.includes(normalizedVar) ||
            normalizedVar.includes(normalizedUpload))
        ) {
          return true
        }
      }
    }

    // Special case: check if either is an abbreviation that starts with the other
    if (
      (normalizedUpload.length <= 3 &&
        normalizedDb.startsWith(normalizedUpload)) ||
      (normalizedDb.length <= 3 && normalizedUpload.startsWith(normalizedDb))
    ) {
      return true
    }

    // Levenshtein distance for very close matches (typos)
    if (
      this.getLevenshteinDistance(normalizedDb, normalizedUpload) <= 1 &&
      Math.min(normalizedDb.length, normalizedUpload.length) >= 3
    ) {
      return true
    }

    return false
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private getLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Create betting lines for matched games
   */
  async createLinesForMatches(
    matches: GameMatchResult[],
    poolId: string,
    source: string = 'Pool Upload'
  ): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = []
    let created = 0

    for (const match of matches) {
      try {
        if (match.spread !== null) {
          await prisma.line.create({
            data: {
              gameId: match.gameId,
              poolId: poolId,
              source: source,
              spread: match.spread,
              total: null, // Only spreads for pool uploads
              moneylineHome: null,
              moneylineAway: null,
              isUserProvided: true,
            },
          })
          created++
          console.log(
            `[GameMatcher] Created line for ${match.awayTeam} @ ${match.homeTeam}: spread ${match.spread}`
          )
        }
      } catch (error) {
        const errorMsg = `Failed to create line for ${match.awayTeam} @ ${match.homeTeam}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`[GameMatcher] ${errorMsg}`)
      }
    }

    return { created, errors }
  }
}

export const gameMatcherService = new GameMatcherService()
