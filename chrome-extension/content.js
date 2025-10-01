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

    // Check if this is a Number1Pool page - be more flexible with URL detection
    const isNumber1Pool = window.location.hostname === 'number1pool.com' ||
                         window.location.hostname.includes('number1pool');

    // Check for various picks page patterns
    const isPicksPage = window.location.pathname.includes('picks') ||
                       window.location.pathname.includes('weekly') ||
                       window.location.pathname.includes('entry') ||
                       window.location.pathname.includes('game') ||
                       document.querySelector('input[name^="Game_"]') !== null ||
                       document.querySelector('select[name*="game"]') !== null;

    console.log('[PoolManager] Page detection:', {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      isNumber1Pool,
      isPicksPage,
      hasGameInputs: document.querySelector('input[name^="Game_"]') !== null
    });

    if (isNumber1Pool && (isPicksPage || window.location.pathname === '/')) {
      this.isNumber1PoolPage = true;

      // Wait a bit for dynamic content to load
      setTimeout(() => {
        this.injectCSS();
        this.detectGameSelects();
        this.createUI();
        this.loadStoredData();

        console.log('[PoolManager] Extension initialized on Number1Pool page');

        // Show a notification that the extension is ready
        this.showNotification();
      }, 1000);
    } else if (isNumber1Pool) {
      console.log('[PoolManager] On Number1Pool but not a picks page. Initializing anyway...');
      this.isNumber1PoolPage = true;

      setTimeout(() => {
        this.injectCSS();
        this.detectGameSelects();
        if (Object.keys(this.gameSelects).length > 0) {
          this.createUI();
          this.loadStoredData();
          console.log('[PoolManager] Found game inputs, extension initialized');
        } else {
          console.log('[PoolManager] No game inputs found on this page');
        }
      }, 1000);
    } else {
      console.log('[PoolManager] Not on Number1Pool:', window.location.href);
    }
  }

  showNotification() {
    // Create a small notification badge to show the extension is active
    const badge = document.createElement('div');
    badge.id = 'pm-active-badge';
    badge.innerHTML = '🏈 PM Ready';
    badge.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    `;

    badge.onclick = () => {
      const panel = document.getElementById('poolmanager-autofill-panel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    };

    document.body.appendChild(badge);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      badge.style.opacity = '0.3';
    }, 3000);
  }

  injectCSS() {
    // CSS is automatically injected via manifest.json content_scripts
    // This method can be used for additional dynamic styling if needed
  }

  detectGameSelects() {
    // Number1Pool uses hidden inputs + buttons, not select dropdowns
    // Detect all three pool types simultaneously: Weekly ATS, Over/Under, Points Plus

    // Store game elements with their game numbers
    this.gameSelects = {};
    this.gameButtons = {}; // Store corresponding buttons for spread picks
    this.overUnderSelects = {}; // Store over/under inputs
    this.overUnderButtons = {}; // Store over/under buttons
    this.pointsPlusSelects = {}; // Store Points Plus inputs
    this.pointsPlusButtons = {}; // Store Points Plus buttons

    // Detect Weekly ATS picks (Game_XX_Weekly hidden inputs)
    const weeklyInputs = document.querySelectorAll('input[name^="Game_"][name*="Weekly"]');
    console.log(`[PoolManager] Found ${weeklyInputs.length} Weekly ATS hidden inputs`);

    weeklyInputs.forEach((input) => {
      const match = input.name.match(/Game_(\d+)_Weekly/);
      if (match) {
        const gameNum = parseInt(match[1]);
        this.gameSelects[gameNum] = input;

        // Find corresponding button for spread pick
        const buttonName = `Weekly_${gameNum.toString().padStart(2, '0')}`;
        const button = document.querySelector(`input[name="${buttonName}"]`);
        if (button) {
          this.gameButtons[gameNum] = button;
        }

        console.log(`[PoolManager] Mapped Weekly ATS game ${gameNum}: ${input.name}`);
      }
    });

    // Detect Over/Under picks (Game_XX_OU hidden inputs)
    const ouInputs = document.querySelectorAll('input[name^="Game_"][name$="_OU"]');
    console.log(`[PoolManager] Found ${ouInputs.length} Over/Under hidden inputs`);

    ouInputs.forEach((input) => {
      const match = input.name.match(/Game_(\d+)_OU/);
      if (match) {
        const gameNum = parseInt(match[1]);
        this.overUnderSelects[gameNum] = input;

        // Find over/under button (pattern: OU_XX)
        const ouButtonName = `OU_${gameNum.toString().padStart(2, '0')}`;
        const ouButton = document.querySelector(`input[name="${ouButtonName}"]`);
        if (ouButton) {
          this.overUnderButtons[gameNum] = ouButton;
        }

        console.log(`[PoolManager] Mapped Over/Under game ${gameNum}: ${input.name}`);
      }
    });

    // Detect Points Plus picks (Game_XX_Points_Plus hidden inputs)
    const ppInputs = document.querySelectorAll('input[name^="Game_"][name*="Points_Plus"]');
    console.log(`[PoolManager] Found ${ppInputs.length} Points Plus hidden inputs`);

    ppInputs.forEach((input) => {
      const match = input.name.match(/Game_(\d+)_Points_Plus/);
      if (match) {
        const gameNum = parseInt(match[1]);
        this.pointsPlusSelects[gameNum] = input;

        // Find corresponding button (pattern: PPlus_XX)
        const buttonName = `PPlus_${gameNum.toString().padStart(2, '0')}`;
        const button = document.querySelector(`input[name="${buttonName}"]`);
        if (button) {
          this.pointsPlusButtons[gameNum] = button;
        }

        console.log(`[PoolManager] Mapped Points Plus game ${gameNum}: ${input.name}`);
      }
    });

    console.log(`[PoolManager] Detection summary:`);
    console.log(`  - Weekly ATS: ${Object.keys(this.gameSelects).length} inputs, ${Object.keys(this.gameButtons).length} buttons`);
    console.log(`  - Over/Under: ${Object.keys(this.overUnderSelects).length} inputs, ${Object.keys(this.overUnderButtons).length} buttons`);
    console.log(`  - Points Plus: ${Object.keys(this.pointsPlusSelects).length} inputs, ${Object.keys(this.pointsPlusButtons).length} buttons`);
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

      // Detect which page we're on to load the correct pool type
      const hasWeeklyInputs = Object.keys(this.gameSelects).length > 0;
      const hasPointsPlusInputs = Object.keys(this.pointsPlusSelects).length > 0;

      console.log(`[PoolManager] Page detection: Weekly=${hasWeeklyInputs}, PointsPlus=${hasPointsPlusInputs}`);

      // Both pools on same page (Number1Pool shows both ATS and Points Plus columns)
      if (hasWeeklyInputs && hasPointsPlusInputs) {
        console.log('[PoolManager] Both pool types detected on same page - loading both datasets');

        // Load ATS/O-U data from localStorage
        const atsLocalData = localStorage.getItem('poolmanagerExtensionData_ATS');
        const ppLocalData = localStorage.getItem('poolmanagerExtensionData_PP');

        let atsGames = [];
        let ppGames = [];

        // Try localStorage first
        if (atsLocalData) {
          try {
            const data = JSON.parse(atsLocalData);
            if (data.games && data.games.length > 0) {
              atsGames = data.games;
              console.log(`[PoolManager] Loaded ${atsGames.length} ATS/O-U picks from localStorage`);
            }
          } catch (e) {
            console.warn('[PoolManager] Failed to parse ATS localStorage data:', e);
          }
        }

        if (ppLocalData) {
          try {
            const data = JSON.parse(ppLocalData);
            if (data.games && data.games.length > 0) {
              ppGames = data.games;
              console.log(`[PoolManager] Loaded ${ppGames.length} Points Plus picks from localStorage`);
            }
          } catch (e) {
            console.warn('[PoolManager] Failed to parse Points Plus localStorage data:', e);
          }
        }

        // Fallback to Chrome storage if localStorage is empty
        if (atsGames.length === 0 || ppGames.length === 0) {
          const result = await chrome.storage.local.get(['poolmanagerGames_ATS', 'poolmanagerGames_PP', 'lastUpdate']);
          console.log('[PoolManager] Chrome storage result:', result);

          if (atsGames.length === 0 && result.poolmanagerGames_ATS) {
            atsGames = result.poolmanagerGames_ATS;
            console.log(`[PoolManager] Loaded ${atsGames.length} ATS/O-U picks from Chrome storage`);
          }

          if (ppGames.length === 0 && result.poolmanagerGames_PP) {
            ppGames = result.poolmanagerGames_PP;
            console.log(`[PoolManager] Loaded ${ppGames.length} Points Plus picks from Chrome storage`);
          }
        }

        // Combine both datasets
        this.games = [...atsGames, ...ppGames];
        this.poolType = 'Combined (ATS/O-U + Points Plus)';

        if (this.games.length > 0) {
          this.updateUI();
          this.updateStatus(`✅ ${atsGames.length} ATS/O-U + ${ppGames.length} Points Plus picks loaded`, 'success');
          console.log(`[PoolManager] Total picks loaded: ${this.games.length}`);
        } else {
          this.updateStatus('Generate AI picks in PoolManager first', 'warning');
        }
        return;
      }

      // Single pool type on page
      let poolType = 'unknown';
      let storageKey = '';
      let chromeStorageKey = '';

      if (hasWeeklyInputs) {
        poolType = 'ATS/O-U';
        storageKey = 'poolmanagerExtensionData_ATS';
        chromeStorageKey = 'poolmanagerGames_ATS';
      } else if (hasPointsPlusInputs) {
        poolType = 'Points Plus';
        storageKey = 'poolmanagerExtensionData_PP';
        chromeStorageKey = 'poolmanagerGames_PP';
      } else {
        console.log('[PoolManager] Could not detect pool type');
        this.updateStatus('No pool inputs detected on page', 'warning');
        return;
      }

      console.log(`[PoolManager] Detected single pool type: ${poolType}`);

      // First try to get data from localStorage (set automatically by PoolManager)
      const localStorageData = localStorage.getItem(storageKey);
      console.log(`[PoolManager] localStorage key: ${storageKey}`, localStorageData);

      if (localStorageData) {
        try {
          const data = JSON.parse(localStorageData);
          console.log('[PoolManager] localStorage parsed data:', data);
          console.log('[PoolManager] Games array length:', data.games ? data.games.length : 'no games array');

          if (data.games && data.games.length > 0) {
            this.games = data.games;
            this.poolType = poolType;
            this.updateUI();
            this.updateStatus(`✅ ${this.games.length} ${poolType} picks loaded`, 'success');
            console.log(`[PoolManager] Loaded ${this.games.length} ${poolType} picks from localStorage`);
            return;
          } else {
            console.log('[PoolManager] localStorage has data but no valid games array');
          }
        } catch (e) {
          console.warn('[PoolManager] Failed to parse localStorage data:', e);
        }
      } else {
        console.log(`[PoolManager] No localStorage data found for ${storageKey}`);
      }

      // Fallback: Try to get data from Chrome storage (manual popup method)
      const result = await chrome.storage.local.get([chromeStorageKey, 'lastUpdate']);
      console.log('[PoolManager] Chrome storage result:', result);

      if (result[chromeStorageKey] && result[chromeStorageKey].length > 0) {
        this.games = result[chromeStorageKey];
        this.poolType = poolType;
        this.updateUI();
        this.updateStatus(`✅ ${this.games.length} ${poolType} picks loaded`, 'success');
        console.log(`[PoolManager] Loaded ${this.games.length} ${poolType} picks from Chrome storage`);
      } else {
        console.log('[PoolManager] No stored data found');
        // Show message to load data via popup
        this.updateStatus(`Generate ${poolType} AI picks in PoolManager first`, 'warning');
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
        let pickTypeLabel = '';

        if (hasRecommendation) {
          // Handle over/under picks
          if (game.pickType === 'OVER_UNDER') {
            recText = game.recommendation || game.aiPick; // 'OVER' or 'UNDER'
            pickTypeLabel = 'O/U';
          } else if (game.pickType === 'POINTS_PLUS') {
            // Handle Points Plus picks
            if (game.recommendation === '1') {
              recText = 'FAV';
            } else if (game.recommendation === '2') {
              recText = 'DOG';
            } else if (game.aiPick && game.recommendedTeam) {
              // Fallback: check if recommended team matches favorite/underdog
              recText = game.recommendedTeam === game.favorite ? 'FAV' : 'DOG';
            }
            pickTypeLabel = 'PP';
          } else {
            // Handle spread picks
            if (game.recommendation === '1') {
              recText = 'FAV';
            } else if (game.recommendation === '2') {
              recText = 'DOG';
            } else if (game.aiPick && game.recommendedTeam) {
              // Fallback: check if recommended team matches favorite/underdog
              recText = game.recommendedTeam === game.favorite ? 'FAV' : 'DOG';
            }
            pickTypeLabel = 'ATS';
          }
        }

        const pickTypeColor = game.pickType === 'OVER_UNDER' ? '#f59e0b' : game.pickType === 'POINTS_PLUS' ? '#8b5cf6' : '#3b82f6';

        return `
          <div class="pm-game">
            <span class="pm-game-number">${game.sortOrder || index + 1}</span>
            <span class="pm-game-matchup">
              <strong>${game.favorite || game.homeTeam}</strong> vs ${game.underdog || game.awayTeam}
            </span>
            <span class="pm-game-spread">${game.pickType === 'OVER_UNDER' ? `O/U ${game.total}` : game.spread || 'N/A'}</span>
            ${hasRecommendation ? `<span class="pm-game-rec" style="background: ${pickTypeColor}">${pickTypeLabel}: ${recText}</span>` : ''}
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

    console.log('[PoolManager] Starting auto-fill with', this.games.length, 'picks (spread + over/under + points plus)');

    this.games.forEach((game, index) => {
      const gameNumber = game.sortOrder || (index + 1);

      console.log(`[PoolManager] Game ${gameNumber} (${game.pickType}):`, {
        pickType: game.pickType,
        aiPick: game.aiPick,
        favorite: game.favorite,
        underdog: game.underdog,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        total: game.total
      });

      // Handle over/under picks
      if (game.pickType === 'OVER_UNDER') {
        const ouInput = this.overUnderSelects[gameNumber];
        const ouButton = this.overUnderButtons[gameNumber];

        if (ouInput && ouButton && game.aiPick) {
          // Map 'OVER' to '1', 'UNDER' to '2'
          const targetValue = game.aiPick === 'OVER' ? '1' : '2';
          const currentValue = ouInput.value || '0';

          // Calculate clicks needed (cycle: 0 -> 1 -> 2 -> 0)
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

          // Click the button
          for (let i = 0; i < clicksNeeded; i++) {
            ouButton.click();
          }

          filled++;
          console.log(`[PoolManager] Filled O/U for game ${gameNumber}: ${game.aiPick}`);

          // Visual feedback
          ouButton.style.background = '#fef3c7';
          setTimeout(() => {
            ouButton.style.background = '';
          }, 2000);
        } else if (!ouInput) {
          console.log(`[PoolManager] O/U input not found for game ${gameNumber} (pool may not support O/U)`);
        }
        return; // Skip spread/points plus logic for O/U picks
      }

      // Handle Points Plus picks
      if (game.pickType === 'POINTS_PLUS') {
        const ppInput = this.pointsPlusSelects[gameNumber];
        const ppButton = this.pointsPlusButtons[gameNumber];

        if (ppInput && ppButton) {
          // Use recommendation value (1=favorite, 2=underdog)
          const targetValue = game.recommendation || '1';
          const currentValue = ppInput.value || '0';

          // Calculate clicks needed (cycle: 0 -> 1 -> 2 -> 0)
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

          // Click the button
          for (let i = 0; i < clicksNeeded; i++) {
            ppButton.click();
          }

          filled++;
          console.log(`[PoolManager] Filled Points Plus for game ${gameNumber}: ${targetValue === '1' ? 'FAV' : 'DOG'}`);

          // Visual feedback
          ppButton.style.background = '#ddd6fe';
          setTimeout(() => {
            ppButton.style.background = '';
          }, 2000);
        } else if (!ppInput) {
          console.log(`[PoolManager] Points Plus input not found for game ${gameNumber} (pool may not support Points Plus)`);
        }
        return; // Skip spread logic for Points Plus picks
      }

      // Handle spread picks (existing logic)
      const gameInput = this.gameSelects[gameNumber];
      const gameButton = this.gameButtons[gameNumber];

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
      this.updateStatus(`✅ Filled ${filled} picks with AI recommendations`, 'success');
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
    // Store the games data - determine pool type
    const poolType = message.poolType || 'ATS';
    const storageKey = poolType === 'PP' ? 'poolmanagerGames_PP' : 'poolmanagerGames_ATS';

    chrome.storage.local.set({ [storageKey]: message.games }, () => {
      // Refresh the UI
      if (window.poolManagerAutoFill) {
        window.poolManagerAutoFill.games = message.games;
        window.poolManagerAutoFill.poolType = poolType === 'PP' ? 'Points Plus' : 'ATS/O-U';
        window.poolManagerAutoFill.updateUI();
        window.poolManagerAutoFill.updateStatus(`✅ ${message.games.length} ${window.poolManagerAutoFill.poolType} picks loaded`, 'success');
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

  if (message.type === 'SHOW_AUTOFILL_PANEL' || message.type === 'SHOW_PANEL') {
    // Initialize the extension if not already done
    if (!window.poolManagerAutoFill) {
      window.poolManagerAutoFill = new PoolManagerAutoFill();
    }

    // Wait a moment for initialization
    setTimeout(() => {
      const panel = document.getElementById('poolmanager-autofill-panel');
      if (panel) {
        panel.style.display = 'block';
      }
    }, 500);

    sendResponse({ success: true });
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