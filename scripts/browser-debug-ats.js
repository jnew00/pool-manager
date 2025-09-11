/**
 * Browser console debug script for ATS recommendations
 * Paste this into your browser console when viewing the BAL vs CLE game
 */

// Check if we can find the game data
const gameElements = document.querySelectorAll('[data-game-id], .game-card, .recommendation-card');
console.log('🔍 Found game elements:', gameElements.length);

// Log current recommendation visible on screen
const cleRecommendation = document.querySelector('*:contains("CLE")');
const balRecommendation = document.querySelector('*:contains("BAL")');
console.log('👀 Visible recommendation elements found');

// Check if we can access any global game state
if (window.gameData) {
  console.log('📊 Game data found:', window.gameData);
}

// Check for any React dev tools data
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('⚛️  React DevTools available');
}

// Instructions for user
console.log(`
🐛 ATS Debug Instructions:
1. Look for console logs starting with "[ATS Pick]" 
2. Check the actual spreads being used:
   - Pool Spread (your upload): Should be BAL -10.5
   - Vegas Spread (ESPN): Should be BAL -11.5
   - Line Value: Should be -1.0
3. Check Line Value Weight: Should be 1.0 (100%)
4. Look for "threshold: 0.25" in the logs
5. Should see "Picking HOME (favorite gets better value)"

If you don't see these logs, the recommendation might be cached 
or using different data than expected.

To force refresh:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear local storage: localStorage.clear()
3. Try incognito/private mode
`);

// Check localStorage for any cached data
const lsKeys = Object.keys(localStorage);
const gameCache = lsKeys.filter(key => 
  key.includes('game') || 
  key.includes('recommendation') || 
  key.includes('pool') ||
  key.includes('ATS')
);

if (gameCache.length > 0) {
  console.log('💾 Found cached data keys:', gameCache);
  gameCache.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`   ${key}:`, data);
    } catch (e) {
      console.log(`   ${key}: ${localStorage.getItem(key)}`);
    }
  });
}

// Check sessionStorage too
const ssKeys = Object.keys(sessionStorage);
const sessionGameCache = ssKeys.filter(key => 
  key.includes('game') || 
  key.includes('recommendation') || 
  key.includes('pool')
);

if (sessionGameCache.length > 0) {
  console.log('🗂️  Found session cached data keys:', sessionGameCache);
}