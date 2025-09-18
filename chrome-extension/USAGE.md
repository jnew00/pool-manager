# PoolManager Chrome Extension Usage

## Overview
This Chrome extension allows you to auto-fill Number1Pool pick forms using your PoolManager data, including AI recommendations.

## Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `chrome-extension` folder

## How to Use

### Step 1: Prepare Data in PoolManager
1. Import spreads into PoolManager
2. Adjust your strategies and sliders as needed
3. Click the **"+ AI Picks"** button (this includes AI recommendations)
4. The game data will be copied to your clipboard

### Step 2: Load Data in Extension
1. Open the extension popup by clicking the extension icon
2. Paste the copied data into the text area
3. Click "Load Game Data"
4. You should see confirmation that games are loaded (with AI picks if available)

### Step 3: Auto-Fill Number1Pool
1. Navigate to your Number1Pool picks page (`picks_weekly.php`)
2. Either:
   - Click the extension icon and use the auto-fill buttons, OR
   - Press **Ctrl+Shift+P** to open the floating panel on the page

### Auto-Fill Options
- **Fill with Favorites**: Selects option 1 for all games
- **Fill with Underdogs**: Selects option 2 for all games
- **Fill with AI Picks**: Uses PoolManager's AI recommendations (requires AI data)
- **Clear All Picks**: Resets all selections to "NO PICK"

## Features

### Visual Indicators
- Extension badge (⚡) appears when on Number1Pool picks page
- Games list shows recommendations (FAV/DOG) when AI data is available
- Color-coded status messages for feedback

### Keyboard Shortcuts
- **Ctrl+Shift+P**: Toggle auto-fill panel on Number1Pool pages

### Context Menu
- Right-click on Number1Pool pages for quick access to auto-fill panel

## Data Format
The extension expects JSON data with this structure:
```json
[
  {
    "favorite": "TEAM1",
    "underdog": "TEAM2",
    "spread": "-3.5",
    "sortOrder": 1,
    "recommendation": "1"  // Optional: 1=favorite, 2=underdog
  }
]
```

## Troubleshooting
- Ensure you're on the correct Number1Pool picks page
- Check that game data was properly copied from PoolManager
- Reload the page if auto-fill buttons appear disabled
- Open browser console (F12) to see any error messages