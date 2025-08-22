/**
 * Maps team abbreviations to their correct ESPN logo names
 * Some teams have different abbreviations between our database and ESPN's logo URLs
 */
const TEAM_LOGO_MAPPING: Record<string, string> = {
  LVR: 'lv', // Las Vegas Raiders - ESPN uses 'lv' not 'lvr'
  // Add other mappings as needed
}

/**
 * Get the correct ESPN team logo URL for a given team abbreviation
 */
export function getTeamLogoUrl(teamAbbr: string | undefined | null): string {
  if (!teamAbbr) return ''

  // Convert to lowercase and check if we have a mapping
  const normalizedAbbr = teamAbbr.toUpperCase()
  const espnAbbr = TEAM_LOGO_MAPPING[normalizedAbbr] || teamAbbr.toLowerCase()

  return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnAbbr}.png`
}

/**
 * Get team logo with fallback handling
 */
export function getTeamLogoWithFallback(
  teamAbbr: string | undefined | null,
  onError?: () => void
): { src: string; onError: () => void } {
  const src = getTeamLogoUrl(teamAbbr)

  return {
    src,
    onError: () => {
      onError?.()
      // Could add additional fallback logic here
    },
  }
}
