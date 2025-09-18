# PoolManager Number1Pool Auto-Fill Chrome Extension

A Chrome extension that automatically fills Number1Pool picks using data from your PoolManager spreads.

## Features

🏈 **Auto-detect Number1Pool pages** - Automatically activates when you visit Number1Pool picks pages
⚡ **One-click auto-fill** - Fill all games with favorites or underdogs instantly
🎯 **Smart game matching** - Matches games by their Number1Pool order
🎨 **Clean UI overlay** - Non-intrusive floating panel on Number1Pool pages
⌨️ **Keyboard shortcuts** - Press `Ctrl+Shift+P` to toggle the auto-fill panel
🔄 **Sync with PoolManager** - Imports game data from your PoolManager pools

## Installation

### Method 1: Developer Mode (Recommended)
1. Download or clone this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### Method 2: Chrome Web Store
*Coming soon - pending review*

## Usage

### Setup
1. **Import spreads in PoolManager first**
   - Go to your ATS pool page
   - Use the Number1Pool import feature
   - Make sure spreads are imported and sorted correctly

2. **Navigate to Number1Pool**
   - Open your Number1Pool weekly picks page
   - The extension will automatically detect the page

3. **Auto-fill your picks**
   - Click the extension icon or press `Ctrl+Shift+P`
   - Choose your fill preference (favorites/underdogs)
   - Click "Auto-Fill" and review your picks

### Options

- **Fill with Favorites** - Selects "1" for all games (recommended for ATS)
- **Fill with Underdogs** - Selects "2" for all games
- **Clear All** - Resets all picks to "NO PICK"

## How It Works

1. **Page Detection** - Monitors for Number1Pool picks pages
2. **Game Matching** - Finds all `Game_01`, `Game_02`, etc. select elements
3. **Data Sync** - Uses Chrome storage to sync game data from PoolManager
4. **Auto-Fill** - Automatically sets select values and triggers change events
5. **Visual Feedback** - Highlights filled games with temporary background colors

## Keyboard Shortcuts

- `Ctrl+Shift+P` - Toggle auto-fill panel on Number1Pool pages

## Permissions

- **activeTab** - Access current tab to detect Number1Pool pages
- **storage** - Store game data between sessions
- **host_permissions** - Access Number1Pool and PoolManager domains

## Troubleshooting

### Extension not working
- Make sure you're on a Number1Pool picks page (`picks_weekly.php`)
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the Number1Pool page

### No game data available
- Import spreads in PoolManager first
- Use the "Fetch Game Data" button in the extension popup
- Check browser console for any error messages

### Auto-fill not working
- Verify that game select elements exist on the page
- Check that the game data was loaded correctly
- Try clearing all picks first, then auto-filling

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── content.js             # Runs on Number1Pool pages
├── popup.html/popup.js    # Extension popup interface
├── background.js          # Background service worker
├── styles.css             # UI styling
└── icons/                 # Extension icons
```

### Building
No build process required - this is a standard Chrome extension that can be loaded directly.

### Contributing
1. Fork the repository
2. Make your changes
3. Test thoroughly on Number1Pool pages
4. Submit a pull request

## Privacy

This extension:
- ✅ Only accesses Number1Pool and PoolManager domains
- ✅ Stores data locally in Chrome storage
- ✅ Does not transmit data to external servers
- ✅ Does not track user behavior

## License

MIT License - See LICENSE file for details

## Support

For issues or feature requests, please open an issue in the main PoolManager repository.