// PoolManager Number1Pool Auto-Fill Content Script

class PoolManagerAutoFill {
  constructor() {
    this.games = [];
    this.isNumber1PoolPage = false;
    this.init();
  }

  async init() {
    // Make this instance globally available for debugging
    window.poolManagerAutoFill = this;

    // Check if this is a Number1Pool picks page
    if (window.location.hostname === 'number1pool.com' &&
        window.location.pathname.includes('picks_weekly.php')) {
      this.isNumber1PoolPage = true;
      this.injectCSS();
      this.detectGameSelects();
      this.createUI();
      this.loadStoredData();

      console.log('[PoolManager] Extension initialized on Number1Pool picks page');
    } else {
      console.log('[PoolManager] Not on Number1Pool picks page:', window.location.href);
    }
  }

  injectCSS() {
    // CSS is automatically injected via manifest.json content_scripts
    // This method can be used for additional dynamic styling if needed
  }

  detectGameSelects() {
    // Number1Pool uses hidden inputs + buttons, not select dropdowns
    // Priority: Weekly ATS > Points Plus > Other pools

    // Try Weekly ATS picks first (Game_XX_Weekly hidden inputs)
    let gameInputs = document.querySelectorAll('input[name^="Game_"][name*="Weekly"]');
    console.log(`[PoolManager] Found ${gameInputs.length} Weekly ATS hidden inputs`);

    if (gameInputs.length === 0) {
      // Try Points Plus picks (Game_XX_Points_Plus hidden inputs)
      gameInputs = document.querySelectorAll('input[name^="Game_"][name*="Points_Plus"]');
      console.log(`[PoolManager] Found ${gameInputs.length} Points Plus hidden inputs`);
    }

    if (gameInputs.length === 0) {
      // Fallback: try any Game_ inputs
      gameInputs = document.querySelectorAll('input[name^="Game_"]');
      console.log(`[PoolManager] Found ${gameInputs.length} inputs with name^="Game_"`);
    }

    if (gameInputs.length === 0) {
      // Last resort: try select elements (for other pool types)
      const selects = document.querySelectorAll('select');
      console.log(`[PoolManager] Found ${selects.length} select elements (fallback)`);
      Array.from(selects).slice(0, 5).forEach(select => {
        console.log(`[PoolManager] Select name: "${select.name}", id: "${select.id}"`);
      });
      gameInputs = selects;
    }

    // Store game elements with their game numbers
    this.gameSelects = {};
    this.gameButtons = {}; // Store corresponding buttons
    this.poolType = 'unknown';

    gameInputs.forEach((input, index) => {
      let gameNum = null;

      // Extract game number from various naming patterns
      if (input.name.includes('Weekly')) {
        this.poolType = 'ATS';
        const match = input.name.match(/Game_(\d+)_Weekly/);
        gameNum = match ? parseInt(match[1]) : index + 1;

        // Find corresponding button
        const buttonName = `Weekly_${gameNum.toString().padStart(2, '0')}`;
        const button = document.querySelector(`input[name="${buttonName}"]`);
        if (button) {
          this.gameButtons[gameNum] = button;
        }
      } else if (input.name.includes('Points_Plus')) {
        this.poolType = 'Points Plus';
        const match = input.name.match(/Game_(\d+)_Points_Plus/);
        gameNum = match ? parseInt(match[1]) : index + 1;

        // Find corresponding button
        const buttonName = `PPlus_${gameNum.toString().padStart(2, '0')}`;
        const button = document.querySelector(`input[name="${buttonName}"]`);
        if (button) {
          this.gameButtons[gameNum] = button;
        }
      } else if (input.name.includes('Game_')) {
        const match = input.name.match(/Game_?(\d+)/i);
        gameNum = match ? parseInt(match[1]) : index + 1;
      } else {
        // Use index as fallback
        gameNum = index + 1;
      }

      this.gameSelects[gameNum] = input;
      console.log(`[PoolManager] Mapped game ${gameNum} to ${this.poolType} input: ${input.name}`);
    });

    console.log(`[PoolManager] Total game inputs mapped: ${Object.keys(this.gameSelects).length}, Pool type: ${this.poolType}`);
    console.log(`[PoolManager] Total buttons mapped: ${Object.keys(this.gameButtons).length}`);
  }

  createUI() {
    // Create floating UI panel
    const panel = document.createElement('div');
    panel.id = 'poolmanager-autofill-panel';
    panel.innerHTML = `
      <div class="pm-header">
        <h3>🏈 PoolManager Auto-Fill</h3>
        <button id="pm-close" class="pm-close">×</button>
      </div>
      <div class="pm-content">
        <div id="pm-status" class="pm-status">
          <span id="pm-status-text">Loading...</span>
        </div>
        <div id="pm-games-count" class="pm-games-count"></div>
        <div class="pm-actions">
          <button id="pm-auto-fill" class="pm-btn pm-btn-primary" disabled>
            Use AI Recommendations
          </button>
          <button id="pm-clear-all" class="pm-btn pm-btn-secondary">
            Clear All
          </button>
        </div>
        <div id="pm-game-list" class="pm-game-list"></div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    document.getElementById('pm-close').onclick = () => {
      document.getElementById('poolmanager-autofill-panel').style.display = 'none';
    };

    // Auto-fill button
    document.getElementById('pm-auto-fill').onclick = () => {
      this.autoFillGames();
    };

    // Clear all button
    document.getElementById('pm-clear-all').onclick = () => {
      this.clearAllSelections();
    };

    // Show/hide panel with keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        const panel = document.getElementById('poolmanager-autofill-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  async loadStoredData() {
    try {
      console.log('[PoolManager] Loading stored data...');

      // First try to get data from localStorage (set automatically by PoolManager)
      const localStorageData = localStorage.getItem('poolmanagerExtensionData');
      console.log('[PoolManager] localStorage raw data:', localStorageData);

      if (localStorageData) {
        try {
          const data = JSON.parse(localStorageData);
          console.log('[PoolManager] localStorage parsed data:', data);
          console.log('[PoolManager] Games array length:', data.games ? data.games.length : 'no games array');

          if (data.games && data.games.length > 0) {
            this.games = data.games;
            this.updateUI();
            this.updateStatus(`✅ ${this.games.length} games loaded automatically`, 'success');
            console.log(`[PoolManager] Loaded ${this.games.length} games from localStorage automatically`);
            return;
          } else {
            console.log('[PoolManager] localStorage has data but no valid games array');
          }
        } catch (e) {
          console.warn('[PoolManager] Failed to parse localStorage data:', e);
        }
      } else {
        console.log('[PoolManager] No localStorage data found at all');
      }

      // Fallback: Try to get data from Chrome storage (manual popup method)
      const result = await chrome.storage.local.get(['poolmanagerGames', 'lastUpdate']);
      console.log('[PoolManager] Chrome storage result:', result);

      if (result.poolmanagerGames && result.poolmanagerGames.length > 0) {
        this.games = result.poolmanagerGames;
        this.updateUI();
        this.updateStatus(`✅ ${this.games.length} games loaded from extension storage`, 'success');
        console.log(`[PoolManager] Loaded ${this.games.length} games from Chrome storage`);
      } else {
        console.log('[PoolManager] No stored data found');
        // Show message to load data via popup
        this.updateStatus('Generate AI recommendations in PoolManager first', 'warning');
      }
    } catch (error) {
      console.error('[PoolManager] Error loading data:', error);
      this.updateStatus('Error loading data. Check PoolManager AI recommendations.', 'error');
    }
  }

  async fetchFromPoolManager() {
    // This would require CORS to be enabled on the PoolManager API
    // For now, we'll rely on the popup to set the data
    this.updateStatus('Load game data via extension popup first', 'warning');
  }

  updateUI() {
    const statusEl = document.getElementById('pm-status-text');
    const countEl = document.getElementById('pm-games-count');
    const autoFillBtn = document.getElementById('pm-auto-fill');
    const gameListEl = document.getElementById('pm-game-list');

    if (this.games.length > 0) {
      statusEl.textContent = 'Ready to auto-fill';
      statusEl.className = 'pm-status-ready';
      countEl.textContent = `${this.games.length} games loaded`;
      autoFillBtn.disabled = false;

      // Show game list
      gameListEl.innerHTML = this.games.map((game, index) => {
        const hasRecommendation = (game.recommendation && game.recommendation !== '00') ||
                                  (game.aiPick && game.recommendedTeam);

        let recText = '';
        if (hasRecommendation) {
          if (game.recommendation === '1') {
            recText = 'FAV';
          } else if (game.recommendation === '2') {
            recText = 'DOG';
          } else if (game.aiPick && game.recommendedTeam) {
            // Fallback: check if recommended team matches favorite/underdog
            recText = game.recommendedTeam === game.favorite ? 'FAV' : 'DOG';
          }
        }

        return `
          <div class="pm-game">
            <span class="pm-game-number">${game.sortOrder || index + 1}</span>
            <span class="pm-game-matchup">
              <strong>${game.favorite}</strong> vs ${game.underdog}
            </span>
            <span class="pm-game-spread">${game.spread || 'N/A'}</span>
            ${hasRecommendation ? `<span class="pm-game-rec">${recText}</span>` : ''}
          </div>
        `;
      }).join('');
    } else {
      statusEl.textContent = 'No game data available';
      statusEl.className = 'pm-status-error';
      countEl.textContent = '';
      autoFillBtn.disabled = true;
    }
  }

  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('pm-status-text');
    statusEl.textContent = message;
    statusEl.className = `pm-status-${type}`;
  }


  getPointsPlusValue(fillType, game, index) {
    // For Points Plus pools, return confidence levels (1-5)
    switch (fillType) {
      case 'balanced':
        // Balanced: mostly 2s and 3s with some variety
        const balancedOptions = ['2', '3', '2', '3', '4'];
        return balancedOptions[index % balancedOptions.length];

      case 'aggressive':
        // Aggressive: higher confidence levels (4s and 5s)
        const aggressiveOptions = ['4', '5', '4', '5', '3'];
        return aggressiveOptions[index % aggressiveOptions.length];

      case 'ai':
        // AI: use confidence from AI if available, otherwise default
        if (game.confidence) {
          // Map AI confidence (0-1) to pool confidence (1-5)
          const aiConfidence = parseFloat(game.confidence);
          if (aiConfidence >= 0.8) return '5';
          if (aiConfidence >= 0.6) return '4';
          if (aiConfidence >= 0.4) return '3';
          if (aiConfidence >= 0.2) return '2';
          return '1';
        }
        return '3'; // Default medium confidence

      default:
        return '3'; // Default medium confidence
    }
  }

  teamNamesMatch(team1, team2) {
    // Normalize team names for comparison
    if (!team1 || !team2) return false;

    const normalize = (name) => {
      return name.toLowerCase()
        .replace(/[^a-z\s]/g, '') // Remove non-alphabetic chars except spaces
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
    };

    const norm1 = normalize(team1);
    const norm2 = normalize(team2);

    // Direct match
    if (norm1 === norm2) return true;

    // Check if one contains the other (for cases like "BUFFALO BILLS" vs "Buffalo Bills")
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

    // Split into words and check for significant word matches
    const words1 = norm1.split(' ').filter(w => w.length > 2); // Ignore short words like "of"
    const words2 = norm2.split(' ').filter(w => w.length > 2);

    // If any significant word matches, consider it a match
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2) return true;
      }
    }

    return false;
  }

  autoFillGames() {
    let filled = 0;
    let errors = [];

    console.log('[PoolManager] Starting auto-fill with', this.games.length, 'games');

    this.games.forEach((game, index) => {
      const gameNumber = game.sortOrder || (index + 1);
      const gameInput = this.gameSelects[gameNumber];
      const gameButton = this.gameButtons[gameNumber];

      console.log(`[PoolManager] Game ${gameNumber}:`, {
        aiPick: game.aiPick,
        favorite: game.favorite,
        underdog: game.underdog,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam
      });

      if (gameInput) {
        let value;

        // Use AI recommendation from PoolManager
        if (game.aiPick) {
          // Map HOME/AWAY to favorite/underdog
          if (game.aiPick === 'HOME') {
            // AI picked the home team - check if home team is favorite or underdog
            const homeTeamName = game.homeTeam;
            const favoriteTeamName = game.favorite;

            // Use team name matching to determine if home team is the favorite
            const homeIsFavorite = this.teamNamesMatch(homeTeamName, favoriteTeamName);
            value = homeIsFavorite ? '1' : '2';

            console.log(`[PoolManager] Game ${gameNumber}: AI picked HOME (${homeTeamName}), favorite is ${favoriteTeamName}, homeIsFavorite=${homeIsFavorite} -> value=${value}`);
          } else if (game.aiPick === 'AWAY') {
            // AI picked the away team - check if away team is favorite or underdog
            const awayTeamName = game.awayTeam;
            const favoriteTeamName = game.favorite;

            // Use team name matching to determine if away team is the favorite
            const awayIsFavorite = this.teamNamesMatch(awayTeamName, favoriteTeamName);
            value = awayIsFavorite ? '1' : '2';

            console.log(`[PoolManager] Game ${gameNumber}: AI picked AWAY (${awayTeamName}), favorite is ${favoriteTeamName}, awayIsFavorite=${awayIsFavorite} -> value=${value}`);
          } else {
            value = '1'; // Default to favorite
            console.log(`[PoolManager] Game ${gameNumber}: Unknown aiPick=${game.aiPick}, defaulting to favorite`);
          }
        } else {
          // No AI pick available, default to favorite
          value = '1';
          console.log(`[PoolManager] Game ${gameNumber}: No AI pick, defaulting to favorite`);
        }

        // Handle different pool types
        if (this.poolType === 'Points Plus') {
          // Points Plus pools have different options (1-5 confidence levels)
          value = this.getPointsPlusValue(fillType, game, index);
        }

        // Click the button to cycle to the desired value
        if (gameButton) {
          // First, check current value
          const currentValue = gameInput.value || '0';
          const targetValue = value;

          // Calculate how many clicks needed
          // Cycle is: 0 -> 1 -> 2 -> 0
          let clicksNeeded = 0;

          if (currentValue === '0') {
            if (targetValue === '1') clicksNeeded = 1;
            else if (targetValue === '2') clicksNeeded = 2;
          } else if (currentValue === '1') {
            if (targetValue === '2') clicksNeeded = 1;
            else if (targetValue === '0') clicksNeeded = 2;
          } else if (currentValue === '2') {
            if (targetValue === '0') clicksNeeded = 1;
            else if (targetValue === '1') clicksNeeded = 2;
          }

          // Click the button the required number of times
          for (let i = 0; i < clicksNeeded; i++) {
            gameButton.click();
          }

          filled++;

          // Visual feedback
          gameButton.style.background = '#e8f5e8';
          setTimeout(() => {
            gameButton.style.background = '';
          }, 2000);
        } else {
          // Fallback: set value directly if no button found
          gameInput.value = value;
          gameInput.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        }
      } else {
        errors.push(`Game ${gameNumber} input not found`);
      }
    });

    // Fill tiebreaker with Monday Night Football total
    this.fillTiebreaker();

    // Show result
    if (filled > 0) {
      this.updateStatus(`✅ Filled ${filled} games with AI recommendations`, 'success');
    }

    if (errors.length > 0) {
      console.warn('[PoolManager] Errors:', errors);
    }

    // Auto-close panel after success
    setTimeout(() => {
      document.getElementById('poolmanager-autofill-panel').style.display = 'none';
    }, 3000);
  }

  fillTiebreaker() {
    try {
      // Find Monday Night Football game (usually has "Mon" in day/time)
      const mondayGame = this.games.find(game =>
        game.day && game.day.toLowerCase().includes('monday') ||
        game.time && game.time.toLowerCase().includes('mon')
      );

      if (!mondayGame) {
        console.log('[PoolManager] No Monday Night Football game found for tiebreaker');
        return;
      }

      // Calculate total points (spread + estimated total)
      // For NFL games, average total is around 45-50 points, but we can estimate from spread
      const spread = parseFloat(mondayGame.spread) || 0;
      const estimatedTotal = Math.round(45 + (spread / 2)); // Simple estimation

      // Look for tiebreaker input field
      const tiebreakerInput = document.querySelector('input[name*="tiebreaker" i], input[name*="TIEBREAKER" i], input[placeholder*="tiebreaker" i]');

      if (tiebreakerInput) {
        tiebreakerInput.value = estimatedTotal.toString();
        tiebreakerInput.dispatchEvent(new Event('input', { bubbles: true }));
        tiebreakerInput.dispatchEvent(new Event('change', { bubbles: true }));

        console.log(`[PoolManager] Filled tiebreaker with ${estimatedTotal} (Monday Night: ${mondayGame.favorite} vs ${mondayGame.underdog})`);
      } else {
        console.log('[PoolManager] Tiebreaker input field not found');
      }
    } catch (error) {
      console.error('[PoolManager] Error filling tiebreaker:', error);
    }
  }

  clearAllSelections() {
    Object.keys(this.gameSelects).forEach(gameNum => {
      const gameInput = this.gameSelects[gameNum];
      const gameButton = this.gameButtons[gameNum];

      if (gameButton && gameInput) {
        const currentValue = gameInput.value || '0';

        // Calculate clicks needed to get back to 0
        let clicksNeeded = 0;
        if (currentValue === '1') clicksNeeded = 2;  // 1 -> 2 -> 0
        else if (currentValue === '2') clicksNeeded = 1;  // 2 -> 0

        // Click the button the required number of times
        for (let i = 0; i < clicksNeeded; i++) {
          gameButton.click();
        }

        // Visual feedback
        gameButton.style.background = '#ffe8e8';
        setTimeout(() => {
          gameButton.style.background = '';
        }, 1000);
      } else if (gameInput) {
        // Fallback: set value directly if no button found
        gameInput.value = '0';
        gameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    this.updateStatus('Cleared all selections', 'info');
  }
}

// Initialize when DOM is ready, with a small delay for dynamic content
function initializeExtension() {
  console.log('[PoolManager] Initializing extension...');
  setTimeout(() => {
    new PoolManagerAutoFill();
  }, 1000); // 1 second delay for page to fully load
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_GAMES_DATA') {
    // Store the games data
    chrome.storage.local.set({ poolmanagerGames: message.games }, () => {
      // Refresh the UI
      if (window.poolManagerAutoFill) {
        window.poolManagerAutoFill.games = message.games;
        window.poolManagerAutoFill.updateUI();
        window.poolManagerAutoFill.updateStatus(`✅ ${message.games.length} games loaded`, 'success');
      }
      sendResponse({ success: true });
    });
    return true; // Keep message channel open
  }

  if (message.type === 'AUTO_FILL_NOW') {
    if (window.poolManagerAutoFill) {
      // Fill type is ignored - we always use AI recommendations from PoolManager
      window.poolManagerAutoFill.autoFillGames();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Auto-fill not initialized' });
    }
    return true; // Keep message channel open
  }

  if (message.type === 'SHOW_AUTOFILL_PANEL') {
    if (window.poolManagerAutoFill) {
      const panel = document.getElementById('poolmanager-autofill-panel');
      if (panel) {
        panel.style.display = 'block';
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Auto-fill not initialized' });
    }
    return true; // Keep message channel open
  }

  if (message.type === 'CLEAR_ALL_PICKS') {
    if (window.poolManagerAutoFill) {
      window.poolManagerAutoFill.clearAllSelections();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Auto-fill not initialized' });
    }
    return true; // Keep message channel open
  }
});