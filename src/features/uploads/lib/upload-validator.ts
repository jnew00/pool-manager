export interface GameData {
  season: number
  week: number
  date: string
  time: string
  away_team: string
  home_team: string
  spread: string
  total: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  warnings: number
  errorMessages: string[]
  warningMessages: string[]
}

export class UploadValidator {
  private readonly NFL_TEAMS = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
    'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LVR', 'LAC', 'LAR', 'MIA',
    'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB',
    'TEN', 'WAS'
  ]

  /**
   * Validate a single game data object
   */
  validateGameData(gameData: GameData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate season
    if (gameData.season < 2000 || gameData.season > 2050) {
      errors.push('Season must be between 2000 and 2050')
    }

    // Validate week
    if (gameData.week < 1 || gameData.week > 22) {
      errors.push('Week must be between 1 and 22')
    }

    // Validate teams
    if (!this.NFL_TEAMS.includes(gameData.away_team)) {
      errors.push(`Invalid away team: ${gameData.away_team}`)
    }

    if (!this.NFL_TEAMS.includes(gameData.home_team)) {
      errors.push(`Invalid home team: ${gameData.home_team}`)
    }

    // Check for same team playing itself
    if (gameData.away_team === gameData.home_team) {
      errors.push('Home and away teams cannot be the same')
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(gameData.date)) {
      errors.push('Invalid date format. Expected YYYY-MM-DD')
    } else {
      // Additional date validation
      const date = new Date(gameData.date)
      if (isNaN(date.getTime())) {
        errors.push('Invalid date')
      }
    }

    // Validate time format (HH:MM in 24-hour format)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(gameData.time)) {
      errors.push('Invalid time format. Expected HH:MM (24-hour)')
    }

    // Validate spread (optional, but if present must be numeric)
    if (gameData.spread && gameData.spread.trim() !== '') {
      const spread = parseFloat(gameData.spread)
      if (isNaN(spread)) {
        errors.push('Spread must be a number')
      }
    }

    // Validate total (optional, but if present must be numeric)
    if (gameData.total && gameData.total.trim() !== '') {
      const total = parseFloat(gameData.total)
      if (isNaN(total)) {
        errors.push('Total must be a number')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate multiple games and check for duplicates
   */
  validateBatch(games: GameData[]): ValidationResult[] {
    const results: ValidationResult[] = []
    const gameKeys = new Set<string>()

    for (let i = 0; i < games.length; i++) {
      const game = games[i]
      const result = this.validateGameData(game)

      // Check for duplicates
      const gameKey = `${game.away_team}@${game.home_team}-${game.date}`
      if (gameKeys.has(gameKey)) {
        result.warnings.push(`Duplicate game: ${game.away_team} @ ${game.home_team} on ${game.date}`)
      } else {
        gameKeys.add(gameKey)
      }

      results.push(result)
    }

    return results
  }

  /**
   * Generate validation summary from results
   */
  getSummary(results: ValidationResult[]): ValidationSummary {
    const total = results.length
    const valid = results.filter(r => r.valid).length
    const invalid = total - valid
    const warnings = results.filter(r => r.warnings.length > 0).length

    const errorMessages = results
      .flatMap(r => r.errors)
      .filter((error, index, arr) => arr.indexOf(error) === index) // Unique errors

    const warningMessages = results
      .flatMap(r => r.warnings)
      .filter((warning, index, arr) => arr.indexOf(warning) === index) // Unique warnings

    return {
      total,
      valid,
      invalid,
      warnings,
      errorMessages,
      warningMessages
    }
  }
}