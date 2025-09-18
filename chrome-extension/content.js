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
    // Try multiple selectors to find game select elements
    let selects = document.querySelectorAll('select[name^="Game_"]');
    console.log(`[PoolManager] Found ${selects.length} selects with name^="Game_"`);

    if (selects.length === 0) {
      // Try alternative selectors
      selects = document.querySelectorAll('select[name*="Game"]');
      console.log(`[PoolManager] Found ${selects.length} selects with name*="Game"`);
    }

    if (selects.length === 0) {
      // Try any select elements
      selects = document.querySelectorAll('select');
      console.log(`[PoolManager] Found ${selects.length} total select elements`);
      // Log first few select names for debugging
      Array.from(selects).slice(0, 5).forEach(select => {
        console.log(`[PoolManager] Select name: "${select.name}", id: "${select.id}"`);
      });
    }

    // Store select elements with their game numbers
    this.gameSelects = {};
    selects.forEach((select, index) => {
      let gameNum = null;

      // Try to extract game number from name
      const nameMatch = select.name.match(/Game_?(\d+)/i);
      if (nameMatch) {
        gameNum = parseInt(nameMatch[1]);
      } else {
        // Use index as fallback
        gameNum = index + 1;
      }

      this.gameSelects[gameNum] = select;
      console.log(`[PoolManager] Mapped game ${gameNum} to select: ${select.name}`);
    });

    console.log(`[PoolManager] Total game selects mapped: ${Object.keys(this.gameSelects).length}`);
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
            Auto-Fill Favorites
          </button>
          <button id="pm-clear-all" class="pm-btn pm-btn-secondary">
            Clear All
          </button>
        </div>
        <div class="pm-options">
          <label>
            <input type="radio" name="pm-fill-type" value="favorites" checked>
            Fill with Favorites (1)
          </label>
          <label>
            <input type="radio" name="pm-fill-type" value="underdogs">
            Fill with Underdogs (2)
          </label>
          <label>
            <input type="radio" name="pm-fill-type" value="custom">
            Use PoolManager recommendations
          </label>
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
      // Try to get data from Chrome storage (set by popup or PoolManager)
      const result = await chrome.storage.local.get(['poolmanagerGames', 'lastUpdate']);

      console.log('[PoolManager] Storage result:', result);

      if (result.poolmanagerGames && result.poolmanagerGames.length > 0) {
        this.games = result.poolmanagerGames;
        this.updateUI();
        this.updateStatus(`✅ ${this.games.length} games loaded from storage`, 'success');
        console.log(`[PoolManager] Loaded ${this.games.length} games from storage`);
      } else {
        console.log('[PoolManager] No stored data found');
        // Show message to load data via popup
        this.updateStatus('Click extension icon to load game data', 'warning');
      }
    } catch (error) {
      console.error('[PoolManager] Error loading data:', error);
      this.updateStatus('Error loading data. Check extension popup.', 'error');
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

  autoFillGames() {
    const fillType = document.querySelector('input[name="pm-fill-type"]:checked').value;
    let filled = 0;
    let errors = [];

    this.games.forEach((game, index) => {
      const gameNumber = game.sortOrder || (index + 1);
      const select = this.gameSelects[gameNumber];

      if (select) {
        let value;
        switch (fillType) {
          case 'favorites':
            value = '1';
            break;
          case 'underdogs':
            value = '2';
            break;
          case 'custom':
            // Use PoolManager recommendation if available
            if (game.recommendation) {
              value = game.recommendation;
            } else if (game.aiPick && game.recommendedTeam) {
              // Fallback: determine pick from recommendedTeam
              value = game.recommendedTeam === game.favorite ? '1' : '2';
            } else {
              value = '1'; // Default to favorite
            }
            break;
          default:
            value = '1';
        }

        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        filled++;

        // Visual feedback
        select.style.background = '#e8f5e8';
        setTimeout(() => {
          select.style.background = '';
        }, 2000);
      } else {
        errors.push(`Game ${gameNumber} select not found`);
      }
    });

    // Show result
    if (filled > 0) {
      this.updateStatus(`✅ Filled ${filled} games with ${fillType}`, 'success');
    }

    if (errors.length > 0) {
      console.warn('[PoolManager] Errors:', errors);
    }

    // Auto-close panel after success
    setTimeout(() => {
      document.getElementById('poolmanager-autofill-panel').style.display = 'none';
    }, 3000);
  }

  clearAllSelections() {
    Object.values(this.gameSelects).forEach(select => {
      select.value = '00'; // NO PICK
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.style.background = '#ffe8e8';
      setTimeout(() => {
        select.style.background = '';
      }, 1000);
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
      // Set the fill type if specified
      if (message.fillType) {
        const radioElement = document.querySelector(`input[name="pm-fill-type"][value="${message.fillType}"]`);
        if (radioElement) {
          radioElement.checked = true;
        }
      }
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