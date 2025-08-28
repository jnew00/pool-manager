#!/usr/bin/env npx tsx

// Manual parsing of the exact image data for reference
// LEFT = Away team, RIGHT = Home team
// Spread shown is from each team's perspective

const correctParsing = [
  { away: "DAL", home: "PHI", spread_for_home: -6.5 }, // Eagles favored by 6.5
  { away: "KC", home: "LAC", spread_for_home: 2.5 },   // Chiefs favored by 2.5 (LAC gets 2.5)
  { away: "TB", home: "ATL", spread_for_home: 1.5 },   // Bucs favored by 1.5 (ATL gets 1.5)  
  { away: "CIN", home: "CLE", spread_for_home: 5.5 },  // Bengals favored by 5.5 (CLE gets 5.5)
  { away: "MIA", home: "IND", spread_for_home: -0.5 }, // Colts favored by 0.5
  { away: "LVR", home: "NE", spread_for_home: -3.5 },  // Patriots favored by 3.5
  { away: "ARI", home: "NO", spread_for_home: 3.5 },   // Cardinals favored by 3.5 (NO gets 3.5)
  { away: "PIT", home: "NYJ", spread_for_home: 2.5 },  // Steelers favored by 2.5 (NYJ gets 2.5)
  { away: "NYG", home: "WAS", spread_for_home: -6.5 }, // Commanders favored by 6.5
  { away: "CAR", home: "JAX", spread_for_home: -2.5 }, // Jaguars favored by 2.5
  { away: "TEN", home: "DEN", spread_for_home: -6.5 }, // Broncos favored by 6.5
  { away: "SF", home: "SEA", spread_for_home: 1.5 },   // 49ers favored by 1.5 (SEA gets 1.5)
  { away: "DET", home: "GB", spread_for_home: 0.5 },   // Lions favored by 0.5 (GB gets 0.5)
  { away: "HOU", home: "LAR", spread_for_home: -2.5 }, // Rams favored by 2.5
  { away: "BAL", home: "BUF", spread_for_home: -1.5 }, // Bills favored by 1.5
  { away: "MIN", home: "CHI", spread_for_home: -0.5 }, // Bears favored by 0.5
];

console.log('Correct parsing of image data:');
console.log('================================');
correctParsing.forEach((game, i) => {
  const favTeam = game.spread_for_home < 0 ? game.home : game.away;
  const favAmount = Math.abs(game.spread_for_home);
  console.log(`${i + 1}. ${game.away} @ ${game.home} | Home spread: ${game.spread_for_home} (${favTeam} favored by ${favAmount})`);
});

export { correctParsing };