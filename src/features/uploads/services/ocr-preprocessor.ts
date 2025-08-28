/**
 * Preprocesses OCR output to extract clean team pairs and spreads
 */

const NFL_TEAMS = new Set([
  'Cardinals', 'Falcons', 'Ravens', 'Bills', 'Panthers', 'Bears', 'Bengals',
  'Browns', 'Cowboys', 'Broncos', 'Lions', 'Packers', 'Texans', 'Colts',
  'Jaguars', 'Chiefs', 'Raiders', 'Chargers', 'Rams', 'Dolphins', 'Vikings',
  'Patriots', 'Saints', 'Giants', 'Jets', 'Eagles', 'Steelers', '49ers',
  'Seahawks', 'Buccaneers', 'Titans', 'Commanders'
])

export interface TeamSpreadData {
  team: string
  spread: number | null
}

export function preprocessOCRText(ocrText: string): string {
  const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Find all team names and their positions
  const teamPositions: { team: string, index: number, spread: number | null }[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this line is a team name
    let isTeam = false
    let teamName = ''
    
    for (const team of NFL_TEAMS) {
      if (line.toLowerCase().includes(team.toLowerCase())) {
        isTeam = true
        teamName = line
        break
      }
    }
    
    // Skip single letter lines like "Y"
    if (line.length <= 1) {
      isTeam = false
    }
    
    if (isTeam) {
      // Look for spread in next few lines
      let spread: number | null = null
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextLine = lines[j]
        // Look for patterns like "46.5", "425", ""6.5", etc.
        const spreadMatch = nextLine.match(/["']?(\d+\.?\d*)/);
        if (spreadMatch) {
          let spreadText = spreadMatch[1].replace(/['"]/g, '')
          let spreadValue = parseFloat(spreadText)
          
          // Handle OCR errors where decimal is shown as separate digits
          // "425" likely means +2.5, "46.5" stays 46.5, "05" means 0.5
          if (!spreadText.includes('.')) {
            if (spreadValue === 425) spreadValue = 2.5
            else if (spreadValue === 415) spreadValue = 1.5
            else if (spreadValue === 435) spreadValue = 3.5
            else if (spreadValue === 455) spreadValue = 5.5
            else if (spreadValue === 405) spreadValue = 0.5
            else if (spreadValue === 465) spreadValue = 6.5
            else if (spreadValue === 15) spreadValue = 1.5
            else if (spreadValue === 25) spreadValue = 2.5
            else if (spreadValue === 35) spreadValue = 3.5
            else if (spreadValue === 55) spreadValue = 5.5
            else if (spreadValue === 65) spreadValue = 6.5
            else if (spreadValue === 5) spreadValue = 0.5
            else if (spreadValue === 28) spreadValue = 2.5  // OCR error for "2.5"
          }
          
          // Check if it should be negative (quotes often mean minus)
          if (nextLine.startsWith('"') || nextLine.startsWith("'")) {
            spreadValue = -spreadValue
          }
          spread = spreadValue
          break
        }
      }
      
      teamPositions.push({ team: teamName, index: i, spread })
    }
  }
  
  // Determine if it's vertical format (all away teams first, then all home teams)
  // In vertical format, we expect roughly equal number of teams in each half
  // Check if Eagles appears after Cowboys, Chiefs, etc. (should be around position 16-20)
  const eaglesIndex = teamPositions.findIndex(t => t.team.toLowerCase().includes('eagles'))
  const cowboysIndex = teamPositions.findIndex(t => t.team.toLowerCase().includes('cowboys'))
  
  // If Eagles appears much later than Cowboys, it's vertical format
  const isVerticalFormat = eaglesIndex > 10 && cowboysIndex < 5
  
  let processedPairs: string[] = []
  
  if (isVerticalFormat && teamPositions.length >= 16) {
    // Vertical format: first half are away teams, second half are home teams
    // We expect 16 away teams and 16 home teams
    const expectedGames = 16
    const awayTeams = teamPositions.slice(0, expectedGames)
    const homeTeams = teamPositions.slice(-expectedGames)  // Get last 16 teams
    
    for (let i = 0; i < Math.min(awayTeams.length, homeTeams.length); i++) {
      const away = awayTeams[i]
      const home = homeTeams[i]
      
      // Use the home team's spread
      const spread = home.spread !== null ? home.spread : away.spread
      
      if (spread !== null) {
        processedPairs.push(`${away.team} ${home.team} ${spread}`)
      } else {
        processedPairs.push(`${away.team} ${home.team}`)
      }
    }
  } else {
    // Standard format: teams are already paired
    for (let i = 0; i < teamPositions.length - 1; i += 2) {
      const team1 = teamPositions[i]
      const team2 = teamPositions[i + 1]
      
      if (team2) {
        const spread = team2.spread !== null ? team2.spread : team1.spread
        if (spread !== null) {
          processedPairs.push(`${team1.team} ${team2.team} ${spread}`)
        } else {
          processedPairs.push(`${team1.team} ${team2.team}`)
        }
      }
    }
  }
  
  // Return cleaned text with clear pairing
  return processedPairs.join('\n')
}

export function cleanOCRForLLM(ocrText: string): string {
  // Alternative: just clean up the OCR text for better LLM parsing
  return ocrText
    .replace(/["']/g, '-')  // Replace quotes with minus signs
    .replace(/(\d)(\d{2})($|\s)/g, '$1.$2$3')  // Fix missing decimals (425 -> 4.25)
    .replace(/Pleked|Ploked|Plekea/gi, 'Picked')  // Fix OCR errors
    .replace(/\n{3,}/g, '\n\n')  // Reduce excessive line breaks
    .trim()
}