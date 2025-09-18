# PoolManager Chrome Extension - Correct Workflow

## Setup (One Time)
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select the `chrome-extension` folder
4. Extension should load without errors

## Daily Usage Workflow

### Step 1: Prepare Data in PoolManager
1. Open PoolManager and navigate to your pool
2. Import spreads for the current week
3. Adjust strategies and sliders as desired
4. Click the **"+ AI Picks"** button
5. Data is copied to clipboard (you'll see a confirmation alert)

### Step 2: Load Data into Extension
1. Click the PoolManager extension icon in Chrome toolbar
2. In the popup, paste the copied data into the text area
3. Click "Load Game Data"
4. You should see "✅ X games loaded successfully"

### Step 3: Auto-Fill Number1Pool
1. Navigate to your Number1Pool picks page (`picks_weekly.php`)
2. Either:
   - Click extension icon → Use auto-fill buttons, OR
   - Press **Ctrl+Shift+P** on the page to open floating panel
3. Choose your fill method:
   - **Fill with Favorites**: Select option 1 for all games
   - **Fill with Underdogs**: Select option 2 for all games
   - **Fill with AI Picks**: Use PoolManager recommendations (if available)

## Troubleshooting

### Extension Not Loading
- Check `chrome://extensions/` for error messages
- Ensure manifest.json is valid
- Reload extension if needed

### "Click extension icon to load game data"
- This means no data in storage yet
- Follow Step 2 above to load data first

### Auto-Fill Not Working
- Ensure you're on Number1Pool picks page
- Check that games were loaded in Step 2
- Look for console errors (F12 → Console)

### No AI Recommendations
- Make sure you used "+ AI Picks" button (not "Copy for Ext")
- Check that PoolManager actually generated recommendations
- AI picks button will be disabled if no recommendations available

## Debug Console Commands

In Number1Pool page console:
```javascript
// Check if extension loaded
console.log(window.poolManagerAutoFill);

// Check Chrome storage
chrome.storage.local.get(['poolmanagerGames'], console.log);

// Manually trigger auto-fill panel
window.poolManagerAutoFill?.createUI();
```