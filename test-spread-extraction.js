// Quick test script to see what LLM extracts from sample text
const sampleText = `
NFL Week 1 Spreads

Commanders -3.5 vs Giants
Tennessee +7 at Houston  
Browns -6 vs Cowboys
Packers +2.5 at Rams
Cardinals vs Falcons PK
`

console.log('Sample betting text:')
console.log(sampleText)
console.log('\nThis should extract:')
console.log(
  '- WAS vs NYG, spread_for_home: +3.5 (Giants home, Commanders favored)'
)
console.log(
  '- TEN vs HOU, spread_for_home: -7 (Houston home, Titans getting points)'
)
console.log('- CLE vs DAL, spread_for_home: +6 (Cowboys home, Browns favored)')
console.log(
  '- GB vs LAR, spread_for_home: -2.5 (Rams home, Packers getting points)'
)
console.log('- ARI vs ATL, spread_for_home: 0 (Pick em)')

// Test the new prompt improvements:
// 1. Team name mapping (Commanders → WAS, Tennessee → TEN)
// 2. Spread direction logic (home team perspective)
// 3. Pick em handling (PK → is_pickem: true)
